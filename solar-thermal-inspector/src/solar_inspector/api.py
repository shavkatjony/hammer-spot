"""FastAPI application: REST API + the dashboard (static files) in one process.

Run:  uvicorn solar_inspector.api:app --host 0.0.0.0 --port 8000
Docs: http://localhost:8000/docs
"""

import csv
import datetime as dt
import io
import json
import secrets
import shutil
from collections.abc import Iterator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from . import __version__
from .catalog import CLASSES, PRIORITY_ORDER, PRIORITY_SLA_DAYS
from .config import Settings, get_settings
from .db import Finding, Inspection, init_db, make_engine, make_session_factory, utcnow
from .features import explain
from .imaging import ImageError, load_thermal, radiometric_summary, render_png
from .kpis import inspection_kpis, portfolio_kpis
from .predictor import Predictor
from .schemas import (
    FindingDetail,
    FindingOut,
    FindingPage,
    FindingUpdate,
    InspectionDetail,
    InspectionOut,
    PredictOut,
)
from .scoring import assess
from .services import (
    DEMO_NOTES,
    DEMO_SITE,
    UploadError,
    collect_files,
    load_pixels,
    parse_layout,
    run_inspection,
    sample_batch,
)

STATIC = Path(__file__).parent / "static"


def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.sessions() as session:
        yield session


def require_key(request: Request, x_api_key: Annotated[str | None, Header()] = None) -> None:
    """Write endpoints need `X-API-Key` when the server has API_KEY set."""
    expected = request.app.state.settings.api_key
    if expected and not secrets.compare_digest(x_api_key or "", expected):
        raise HTTPException(401, "missing or wrong X-API-Key")


SessionDep = Annotated[Session, Depends(get_session)]


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        settings.storage_dir.mkdir(parents=True, exist_ok=True)
        if settings.database_url.startswith("sqlite:///"):
            Path(settings.database_url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
        engine = make_engine(settings.database_url)
        init_db(engine)
        app.state.engine = engine
        app.state.sessions = make_session_factory(engine)
        app.state.predictor = Predictor(settings.model_dir, settings.alert_policy)
        metrics_path = settings.model_dir / "metrics.json"
        app.state.metrics = json.loads(metrics_path.read_text()) if metrics_path.exists() else {}
        yield
        engine.dispose()

    app = FastAPI(
        title="Solar Thermal Inspector",
        version=__version__,
        description="Drone IR inspection of PV modules: anomaly detection, prioritised work orders and KPIs.",
        lifespan=lifespan,
    )
    app.state.settings = settings

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        # refuse oversized bodies before they are spooled to disk (a reverse proxy should also cap this)
        length = request.headers.get("content-length", "")
        if length.isdigit() and int(length) > (settings.max_upload_mb + 1) * 1024 * 1024:
            return JSONResponse({"detail": f"request larger than {settings.max_upload_mb:.0f} MB"}, status_code=413)
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        if not request.url.path.startswith(("/docs", "/redoc", "/openapi.json")):
            response.headers.setdefault(
                "Content-Security-Policy",
                "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; "
                "frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
            )
        return response

    # ------------------------------------------------------------------ helpers

    def get_inspection(session: Session, inspection_id: int) -> Inspection:
        insp = session.get(Inspection, inspection_id)
        if not insp:
            raise HTTPException(404, "inspection not found")
        return insp

    def get_finding(session: Session, finding_id: int) -> Finding:
        f = session.get(Finding, finding_id)
        if not f:
            raise HTTPException(404, "finding not found")
        return f

    def detail(insp: Inspection, session: Session) -> InspectionDetail:
        base = InspectionOut.model_validate(insp).model_dump()
        return InspectionDetail(**base, rejected=insp.rejected or [], batch_median=insp.batch_median,
                                kpis=inspection_kpis(session, insp.id))

    @app.exception_handler(UploadError)
    async def upload_error(_: Request, exc: UploadError):
        return JSONResponse({"detail": str(exc)}, status_code=422)

    # ------------------------------------------------------------------ system

    @app.get("/api/health", tags=["system"])
    def health(request: Request, session: SessionDep) -> dict:
        session.execute(text("SELECT 1"))
        return {"status": "ok", "version": __version__, "model_version": request.app.state.predictor.version,
                "alert_policy": request.app.state.predictor.policy,
                "database": request.app.state.engine.dialect.name}

    @app.get("/api/model", tags=["system"])
    def model_info(request: Request) -> dict:
        p: Predictor = request.app.state.predictor
        return {"meta": p.meta, "metrics": request.app.state.metrics, "alert_policy": p.policy,
                "economics": {"module_power_w": settings.module_power_w,
                              "specific_yield_kwh_per_kwp": settings.specific_yield_kwh_per_kwp,
                              "tariff_krw_per_kwh": settings.tariff_krw_per_kwh}}

    @app.get("/api/catalog", tags=["system"])
    def catalog() -> list[dict]:
        return [{"name": c.name, "description": c.description, "group": c.group, "loss_fraction": c.loss_fraction,
                 "loss_basis": c.loss_basis, "priority": c.priority, "sla_days": PRIORITY_SLA_DAYS.get(c.priority),
                 "safety": c.safety, "action": c.action}
                for c in sorted(CLASSES.values(), key=lambda c: (PRIORITY_ORDER[c.priority], -c.loss_fraction))]

    # ------------------------------------------------------------------ inspections

    @app.post("/api/inspections", response_model=InspectionDetail, status_code=201, tags=["inspections"],
              dependencies=[Depends(require_key)])
    def create_inspection(
        request: Request,
        session: SessionDep,
        files: Annotated[list[UploadFile], File(description="IR images (JPG/PNG/TIFF), CSV/NPY temperature "
                                                            "matrices, or ZIP archives of them")],
        site_name: Annotated[str, Form(max_length=120)],
        inspected_on: Annotated[dt.date | None, Form()] = None,
        notes: Annotated[str, Form(max_length=2000)] = "",
        layout: Annotated[UploadFile | None, File(description="optional CSV: filename,block,row,position,label")]
        = None,
    ):
        max_zip = int(settings.max_upload_mb * 1024 * 1024)
        max_file = int(settings.max_file_mb * 1024 * 1024)
        uploads = []
        for f in files:
            name = f.filename or "upload"
            limit = max_zip if name.lower().endswith(".zip") else max_file
            data = f.file.read(limit + 1)
            if len(data) > limit:
                raise HTTPException(413, f"{name} is too large")
            uploads.append((name, data))
        batch = collect_files(uploads, settings)
        if layout is not None and layout.filename:
            batch.layout.update(parse_layout(layout.file.read(5 * 1024 * 1024)))
        insp = run_inspection(session, request.app.state.predictor, settings, batch, site_name=site_name,
                              inspected_on=inspected_on or dt.date.today(), notes=notes)
        return detail(insp, session)

    @app.get("/api/inspections", response_model=list[InspectionOut], tags=["inspections"])
    def list_inspections(session: SessionDep, site: str | None = None):
        q = select(Inspection).order_by(Inspection.inspected_on.desc(), Inspection.id.desc())
        if site:
            q = q.where(Inspection.site_name == site)
        return session.scalars(q).all()

    @app.get("/api/inspections/{inspection_id}", response_model=InspectionDetail, tags=["inspections"])
    def read_inspection(inspection_id: int, session: SessionDep):
        return detail(get_inspection(session, inspection_id), session)

    @app.delete("/api/inspections/{inspection_id}", status_code=204, tags=["inspections"],
                dependencies=[Depends(require_key)])
    def delete_inspection(inspection_id: int, session: SessionDep):
        insp = get_inspection(session, inspection_id)
        session.delete(insp)
        session.commit()
        shutil.rmtree(settings.storage_dir / str(inspection_id), ignore_errors=True)
        return Response(status_code=204)

    @app.get("/api/inspections/{inspection_id}/findings", response_model=FindingPage, tags=["inspections"])
    def list_findings(
        inspection_id: int,
        session: SessionDep,
        anomalies_only: bool = True,
        priority: str | None = None,
        predicted_class: str | None = None,
        status: str | None = None,
        needs_review: bool | None = None,
        sort: Annotated[str, Query(pattern="^(priority|loss|score|location)$")] = "priority",
        limit: Annotated[int, Query(ge=1, le=1000)] = 100,
        offset: Annotated[int, Query(ge=0)] = 0,
    ):
        get_inspection(session, inspection_id)
        f = Finding
        where = [f.inspection_id == inspection_id]
        if anomalies_only:
            where.append(f.is_anomaly.is_(True))
        if priority:
            where.append(f.priority == priority)
        if predicted_class:
            where.append(f.predicted_class == predicted_class)
        if status:
            where.append(f.status == status)
        if needs_review is not None:
            where.append(f.needs_review.is_(needs_review))
        order = {
            "priority": (f.priority, f.est_loss_w.desc(), f.anomaly_score.desc()),
            "loss": (f.est_loss_w.desc(), f.priority),
            "score": (f.anomaly_score.desc(),),
            "location": (f.block, f.row, f.position, f.filename),
        }[sort]
        total = session.scalar(select(func.count()).select_from(f).where(*where))
        items = session.scalars(select(f).where(*where).order_by(*order, f.id).limit(limit).offset(offset)).all()
        return FindingPage(total=total or 0, items=items)

    @app.get("/api/inspections/{inspection_id}/workorders.csv", tags=["inspections"])
    def export_work_orders(inspection_id: int, session: SessionDep):
        """Work orders for a CMMS / spreadsheet, most urgent first."""
        insp = get_inspection(session, inspection_id)
        rows = session.scalars(
            select(Finding).where(Finding.inspection_id == inspection_id, Finding.is_anomaly.is_(True))
            .order_by(Finding.priority, Finding.est_loss_w.desc(), Finding.id)
        ).all()
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["finding_id", "priority", "due_by", "site", "block", "row", "position", "file", "fault",
                    "confidence", "needs_review", "est_loss_w", "est_kwh_year", "est_krw_year", "action", "status"])
        for f in rows:
            due = insp.inspected_on + dt.timedelta(days=PRIORITY_SLA_DAYS.get(f.priority, 90))
            w.writerow([_cell(v) for v in (
                f.id, f.priority, due.isoformat(), insp.site_name, f.block, f.row, f.position, f.filename,
                f.predicted_class, f.class_confidence, f.needs_review, f.est_loss_w, f.est_kwh_year, f.est_krw_year,
                CLASSES[f.predicted_class].action, f.status)])
        name = f"workorders_inspection_{inspection_id}.csv"
        return Response(buf.getvalue(), media_type="text/csv",
                        headers={"Content-Disposition": f'attachment; filename="{name}"'})

    # ------------------------------------------------------------------ findings

    @app.get("/api/findings/{finding_id}", response_model=FindingDetail, tags=["findings"])
    def read_finding(finding_id: int, session: SessionDep):
        f = get_finding(session, finding_id)
        c = CLASSES[f.predicted_class]
        return FindingDetail(**FindingOut.model_validate(f).model_dump(), top3=f.top3, explanation=f.explanation,
                             warnings=f.warnings, radiometric=f.radiometric, action=c.action,
                             description=c.description, loss_basis=c.loss_basis, safety=c.safety)

    @app.patch("/api/findings/{finding_id}", response_model=FindingOut, tags=["findings"],
               dependencies=[Depends(require_key)])
    def update_finding(finding_id: int, body: FindingUpdate, session: SessionDep):
        """Technician feedback: progress a work order, close it, or mark it a false alarm."""
        f = get_finding(session, finding_id)
        if not f.is_anomaly:
            raise HTTPException(409, "normal modules have no work order")
        f.status = body.status
        f.status_note = body.note
        f.resolved_at = utcnow() if body.status in ("resolved", "false_alarm") else None
        session.commit()
        return f

    @app.get("/api/findings/{finding_id}/image.png", tags=["findings"])
    def finding_image(finding_id: int, session: SessionDep,
                      view: Annotated[str, Query(pattern="^(thermal|overlay|raw)$")] = "thermal",
                      scale: Annotated[int, Query(ge=1, le=16)] = 8):
        f = get_finding(session, finding_id)
        try:
            px = load_pixels(settings, f)
        except FileNotFoundError as exc:
            raise HTTPException(404, "image not stored") from exc
        return Response(render_png(px, view, scale), media_type="image/png",
                        headers={"Cache-Control": "private, max-age=86400"})

    # ------------------------------------------------------------------ analytics

    @app.get("/api/kpis", tags=["analytics"])
    def kpis(session: SessionDep, site: str | None = None) -> dict:
        return portfolio_kpis(session, site)

    @app.get("/api/sites", tags=["analytics"])
    def sites(session: SessionDep) -> list[str]:
        return list(session.scalars(select(Inspection.site_name).distinct().order_by(Inspection.site_name)))

    @app.post("/api/predict", response_model=PredictOut, tags=["analytics"], dependencies=[Depends(require_key)])
    def predict(request: Request, file: Annotated[UploadFile, File()]):
        """Score one image without storing anything (for integrations and quick checks)."""
        name = file.filename or "upload"
        data = file.file.read(int(settings.max_file_mb * 1024 * 1024) + 1)
        if len(data) > settings.max_file_mb * 1024 * 1024:
            raise HTTPException(413, "file too large")
        try:
            img = load_thermal(data, name, settings.radiometric_gain)
        except ImageError as exc:
            raise HTTPException(422, str(exc)) from exc
        p: Predictor = request.app.state.predictor
        pred = p.decide(p.predict_proba([img.pixels])[0])
        radio = radiometric_summary(img.temperature_c) if img.radiometric else None
        a = assess(pred.predicted_class, pred.is_anomaly, settings, radio["delta_t_c"] if radio else None)
        return PredictOut(filename=name, predicted_class=pred.predicted_class,
                          class_confidence=pred.class_confidence, anomaly_score=pred.anomaly_score,
                          is_anomaly=pred.is_anomaly, needs_review=pred.needs_review or bool(img.warnings),
                          priority=a.priority, top3=[list(t) for t in pred.top3], explanation=explain(img.pixels),
                          warnings=img.warnings, radiometric=radio, action=CLASSES[pred.predicted_class].action,
                          model_version=p.version)

    @app.post("/api/demo", response_model=InspectionDetail, status_code=201, tags=["inspections"],
              dependencies=[Depends(require_key)])
    def load_demo(request: Request, session: SessionDep):
        """Load the bundled sample (InfraredSolarModules test split, synthetic site layout)."""
        if not (settings.sample_dir / "layout.csv").exists():
            raise HTTPException(404, "sample data not available")
        insp = run_inspection(
            session, request.app.state.predictor, settings, sample_batch(settings.sample_dir),
            site_name=DEMO_SITE, inspected_on=dt.date.today(), source="demo", notes=DEMO_NOTES,
        )
        return detail(insp, session)

    # ------------------------------------------------------------------ dashboard

    app.mount("/static", StaticFiles(directory=STATIC), name="static")

    @app.get("/", include_in_schema=False)
    def index():
        return FileResponse(STATIC / "index.html")

    return app


def _cell(value) -> str:
    """CSV cell safe to open in Excel: neutralise formula injection from user-supplied names."""
    s = str(value)
    return "'" + s if s[:1] in ("=", "+", "-", "@", "\t", "\r") else s


app = create_app()
