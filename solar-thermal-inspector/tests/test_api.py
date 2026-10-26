import csv
import datetime as dt
import io
from dataclasses import replace

import numpy as np
from fastapi.testclient import TestClient

from solar_inspector.api import create_app
from solar_inspector.catalog import PRIORITY_SLA_DAYS
from solar_inspector.db import Finding
from tests.conftest import SAMPLE, module_array, pick_sample, png_bytes

FAULTY = {"Offline-Module": 3, "Diode-Multi": 2, "Cell-Multi": 2, "No-Anomaly": 4}


def upload(client, rows=None, extra=None, site="Test Site", layout=True, headers=None):
    rows = rows if rows is not None else pick_sample(FAULTY)
    files = [("files", (r["filename"], (SAMPLE / "images" / r["filename"]).read_bytes(), "image/png")) for r in rows]
    files += extra or []
    if layout:
        text = "filename,block,row,position,label\n" + "".join(
            f"{r['filename']},A,R01,{k + 1:02d},{r['label']}\n" for k, r in enumerate(rows))
        files.append(("layout", ("layout.csv", text.encode(), "text/csv")))
    return client.post("/api/inspections", data={"site_name": site, "inspected_on": "2026-09-01"}, files=files,
                       headers=headers or {})


def test_health_and_model(client):
    h = client.get("/api/health").json()
    assert h["status"] == "ok" and h["database"] in ("sqlite", "postgresql") and h["model_version"].startswith("cnn-")
    m = client.get("/api/model").json()
    assert m["meta"]["classes"][0] == "Cell" and "binary" in m["metrics"]
    assert len(client.get("/api/catalog").json()) == 12


def test_dashboard_served_with_security_headers(client):
    r = client.get("/")
    assert r.status_code == 200 and "Solar Thermal Inspector" in r.text
    assert "default-src 'self'" in r.headers["content-security-policy"]
    assert r.headers["x-content-type-options"] == "nosniff"
    assert client.get("/static/app.js").status_code == 200


def test_full_inspection_workflow(client, settings):
    r = upload(client, extra=[("files", ("notes.txt", b"hello", "text/plain")),
                              ("files", ("broken.png", b"\x89PNG broken", "image/png"))])
    assert r.status_code == 201, r.text
    insp = r.json()
    k = insp["kpis"]
    assert insp["n_images"] == 11 and insp["n_rejected"] == 2
    assert {x["file"] for x in insp["rejected"]} == {"notes.txt", "broken.png"}
    assert k["modules"] == 11 and k["labelled"] == 11
    assert k["anomalies"] >= 5  # 7 faulty modules uploaded; offline and diode-multi are easy
    assert k["label_recall"] >= 5 / 7
    assert k["power_at_risk_kw"] > 0 and k["revenue_at_risk_krw_year"] > 0

    page = client.get(f"/api/inspections/{insp['id']}/findings").json()
    assert page["total"] == k["anomalies"]
    prios = [f["priority"] for f in page["items"]]
    assert prios == sorted(prios)  # most urgent first
    all_mods = client.get(f"/api/inspections/{insp['id']}/findings?anomalies_only=false&sort=location").json()
    assert all_mods["total"] == 11 and all_mods["items"][0]["position"] == "01"

    p1 = client.get(f"/api/inspections/{insp['id']}/findings?priority=P1").json()
    assert all(f["priority"] == "P1" for f in p1["items"])

    fid = page["items"][0]["id"]
    detail = client.get(f"/api/findings/{fid}").json()
    assert detail["action"] and len(detail["top3"]) == 3 and "hot_area_pct" in detail["explanation"]
    img = client.get(f"/api/findings/{fid}/image.png?view=overlay")
    assert img.status_code == 200 and img.content[:4] == b"\x89PNG"

    # technician feedback loop
    done = client.patch(f"/api/findings/{fid}", json={"status": "resolved", "note": "diode replaced"})
    assert done.status_code == 200 and done.json()["resolved_at"]
    second = page["items"][1]["id"]
    client.patch(f"/api/findings/{second}", json={"status": "false_alarm"})
    k2 = client.get(f"/api/inspections/{insp['id']}").json()["kpis"]
    assert k2["field_precision"] == 0.5
    assert client.patch(f"/api/findings/{fid}", json={"status": "done"}).status_code == 422
    normal = next(f for f in all_mods["items"] if not f["is_anomaly"])
    assert client.patch(f"/api/findings/{normal['id']}", json={"status": "resolved"}).status_code == 409

    fleet = client.get("/api/kpis").json()
    assert fleet["resolved"] == 1 and fleet["false_alarms"] == 1 and fleet["mean_hours_to_resolve"] is not None
    assert fleet["open_work_orders"] == k["anomalies"] - 2

    # CSV export for the maintenance system
    out = client.get(f"/api/inspections/{insp['id']}/workorders.csv")
    rows = list(csv.DictReader(io.StringIO(out.text)))
    assert out.headers["content-type"].startswith("text/csv") and len(rows) == k["anomalies"]
    assert rows[0]["priority"] == prios[0] and rows[0]["due_by"] >= "2026-09-01"

    # delete removes rows and stored images
    assert client.delete(f"/api/inspections/{insp['id']}").status_code == 204
    assert client.get(f"/api/inspections/{insp['id']}").status_code == 404
    assert not (settings.storage_dir / str(insp["id"])).exists()


def test_upload_without_valid_images_is_422(client):
    r = client.post("/api/inspections", data={"site_name": "X"},
                    files=[("files", ("a.txt", b"nope", "text/plain"))])
    assert r.status_code == 422 and "no readable" in r.json()["detail"]


def test_overdue_work_orders(client, settings):
    insp = upload(client).json()
    with client.app.state.sessions() as s:
        f = s.query(Finding).filter_by(inspection_id=insp["id"], is_anomaly=True).first()
        f.created_at = f.created_at - dt.timedelta(days=PRIORITY_SLA_DAYS[f.priority] + 1)
        s.commit()
    assert client.get("/api/kpis").json()["overdue_work_orders"] == 1


def test_api_key_protects_writes(settings):
    with TestClient(create_app(replace(settings, api_key="s3cret"))) as c:
        assert upload(c).status_code == 401
        assert upload(c, headers={"X-API-Key": "wrong"}).status_code == 401
        assert upload(c, headers={"X-API-Key": "s3cret"}).status_code == 201
        assert c.get("/api/inspections").status_code == 200  # reads stay open


def test_predict_radiometric_csv(client):
    t = np.full((40, 24), 40.0)
    t[5:30, 3:21] = 65.0  # whole module 25 C hotter than the frame
    text = "\n".join(",".join(f"{v:.1f}" for v in row) for row in t)
    r = client.post("/api/predict", files={"file": ("frame.csv", text.encode(), "text/csv")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["radiometric"]["delta_t_c"] >= 0 and body["needs_review"] is True
    assert any("radiometric" in w for w in body["warnings"])


def test_predict_rejects_garbage(client):
    r = client.post("/api/predict", files={"file": ("x.png", b"garbage", "image/png")})
    assert r.status_code == 422


def test_synthetic_upload_without_layout(client):
    files = [("files", (f"m{k}.png", png_bytes(module_array(kind, k)), "image/png"))
             for k, kind in enumerate(["normal", "hotspot", "diode", "offline"])]
    r = client.post("/api/inspections", data={"site_name": "Synthetic"}, files=files)
    assert r.status_code == 201
    assert r.json()["kpis"]["labelled"] == 0


def test_demo_inspection(client):
    r = client.post("/api/demo")
    assert r.status_code == 201
    k = r.json()["kpis"]
    assert k["modules"] == 627 and k["labelled"] == 627
    assert k["label_recall"] > 0.9
    assert client.get("/api/sites").json() == ["Demo Solar Farm (sample data)"]


def test_oversized_request_is_refused_early(settings):
    with TestClient(create_app(replace(settings, max_upload_mb=0.01))) as c:
        r = c.post("/api/inspections", data={"site_name": "X"},
                   files=[("files", ("big.png", bytes(2 * 1024 * 1024), "image/png"))])
        assert r.status_code == 413
