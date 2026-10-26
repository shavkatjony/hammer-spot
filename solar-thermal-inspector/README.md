# Solar Thermal Inspector

**Drone thermal (IR) inspection of solar PV modules, from image to work order.** It finds faulty modules,
names the fault, ranks the work by urgency and money at risk, and tracks it until a technician closes it.

Built end to end by one person on a public dataset: data cleaning, EDA, image processing, four models
compared on a held-out test set, a calibrated CNN served with ONNX Runtime, a FastAPI backend with
SQLite/PostgreSQL, a no-build web dashboard, 57 tests (run on both databases), Docker and CI.

![Inspection view: KPIs, fault mix, site map](docs/img/inspection.webp)

| | |
|---|---|
| ![Finding detail with thermal image and actions](docs/img/finding.webp) | ![Model card page](docs/img/model.webp) |

---

## Why this problem

A 100 MW solar plant has about 250,000 modules (at 400 W each). Operators fly drones with thermal cameras
over them because faults show up as heat: a module whose bypass diode has switched on runs a third of
its area hot and loses about a third of its output; an offline module is warm all over and produces
nothing; hot cells can burn through the backsheet. The bottleneck is not the flight. It is turning
thousands of IR crops into a short, ranked list of jobs that a technician can trust.

This app does that step:

1. **Score** every module image (CNN, about 2 ms per image on one CPU thread).
2. **Decide** with a threshold tuned for recall, because a missed dead module costs more than a check.
3. **Explain**: false-colour image, detected hot regions, contrast numbers, level against the rest of the flight.
4. **Prioritise**: P1 / P2 / P3 by fault type (escalated by delta T for radiometric input), with estimated W,
   kWh/year and KRW/year lost.
5. **Track**: work-order status, technician feedback (*resolved* or *false alarm*), and KPIs such as field
   precision, overdue jobs and time to resolve. Export to CSV for a maintenance system.

## Results

All numbers come from the **held-out test split** (2,995 images, half of them faulty). It was never used
for training or threshold choice, and the final model was chosen on validation. One caveat, stated plainly:
the first CNN's weakness to sensor noise was spotted on this split, and that is what prompted the second
candidate. A new site's data is the fully clean check. Full report:
[`reports/evaluation.md`](reports/evaluation.md). Data analysis: [`reports/eda.md`](reports/eda.md).

**Finding faulty modules** (each alert threshold set on validation for at least 95% recall):

| Model | ROC-AUC | Recall | Precision | False-alarm rate |
|---|---:|---:|---:|---:|
| Rule: peak contrast (image processing only) | 0.842 | 0.965 | 0.575 | 0.711 |
| Isolation Forest (normal modules only, no fault labels) | 0.779 | 0.959 | 0.526 | 0.859 |
| Gradient boosting on 30 hand-crafted thermal features | 0.935 | 0.965 | 0.661 | 0.493 |
| **CNN on raw pixels (served)** | **0.977** | 0.957 | **0.872** | **0.140** |

**Naming the fault (12 classes):** CNN accuracy **0.816**, macro-F1 0.673, top-2 accuracy 0.929, with
calibrated probabilities (ECE 0.016 after temperature scaling). Published results on this dataset are
about 0.83-0.86 accuracy with much larger networks (ResNet-50, ensembles; different splits). This model
has 647k parameters and a 2.6 MB ONNX file. It was picked from two candidates on **validation** macro-F1;
the comparison, including the test numbers of the one that lost, is in the evaluation report.

What the numbers mean in practice:

- **3.5x fewer wasted truck rolls.** At the same ~96% recall the CNN raises false alarms on 14.0% of
  healthy modules, against 49.3% for the feature model and 71.1% for a contrast rule.
- **Precision depends on how rare faults are.** The test split is 50% faulty; a real plant is not. With 5%
  faulty modules, about 26% of alerts are real faults (10,000 modules -> about 1,808 alerts, 478 faults
  caught, 22 missed). That is why every alert carries its image for a quick desk review, and why the
  *false alarm* button feeds a field-precision KPI and a retraining set.
- **Known weak spot: offline modules** (class recall 0.65; 21 of the 24 missed critical faults). A module
  that is warm all over looks normal on its own. An operator-selectable **safety policy** adds a lower alert
  bar for critical faults:

  | Policy | Recall | False-alarm rate | Critical faults missed (of 412) |
  |---|---:|---:|---:|
  | standard (default) | 0.957 | 0.140 | 24 |
  | safety (`ALERT_POLICY=safety`) | 0.981 | 0.397 | 6 |

- **Robust to noise and camera scaling, by design.** The first CNN candidate lost recall under sensor noise
  (0.96 -> 0.80 at sd 5). Retraining with noise and shift augmentation fixed it: the served model keeps 0.95,
  and brightness offsets of +/-10 grey levels move recall by at most 0.009.
- **Data quality matters.** The dataset has 22 groups of pixel-identical images and **6 of them carry
  conflicting labels** (the same image labelled e.g. Cell-Multi and Cracking). They were removed before
  splitting, so no image sits in both train and test.

## Architecture

```mermaid
flowchart LR
  subgraph Offline["Offline (training/)"]
    D[(InfraredSolarModules<br/>20,000 IR crops)] --> P[prepare_data.py<br/>checksum, dedupe,<br/>stratified split]
    P --> E[eda.py]
    P --> B[train_baselines.py<br/>rule, GBM, IsolationForest]
    P --> C[train_cnn.py<br/>PyTorch CNN + temperature scaling]
    B & C --> V[evaluate.py<br/>thresholds on val, metrics on test]
    C --> X[thermal_cnn.onnx]
    V --> M[model_meta.json<br/>metrics.json]
  end
  subgraph Serving["Serving (src/solar_inspector, one container)"]
    U[Upload: images, ZIP,<br/>radiometric CSV/NPY] --> I[imaging.py<br/>decode, validate, resize,<br/>hot-spot segmentation]
    I --> R[predictor.py<br/>ONNX Runtime + alert rule]
    R --> S[scoring.py<br/>priority, W, kWh, KRW]
    S --> DB[(SQLite / PostgreSQL)]
    DB --> K[kpis.py<br/>SQL aggregations]
    K --> A[FastAPI REST API]
    A --> W[Dashboard<br/>vanilla JS]
    A --> CSV[Work-order CSV]
    W -- technician feedback --> A
  end
  X & M --> R
```

| Layer | Choice | Why |
|---|---|---|
| Model serving | ONNX Runtime (no PyTorch in the image) | 2.6 MB model, about 2 ms/image on CPU, no GPU needed |
| Decision rule | `decide_batch()` shared by the API and the evaluation script | the metrics in the report are the metrics of what the API does |
| Backend | FastAPI + SQLAlchemy 2.0 | typed, self-documenting API (`/docs`); same code on SQLite and PostgreSQL |
| KPIs | computed in SQL (`GROUP BY`, `CASE`) | they scale with the database, not with Python memory |
| Dashboard | static HTML/CSS/JS served by FastAPI | one process, no build step, strict CSP, works on a phone |
| Storage | pixels as `.npy` per finding + rows in the DB | images can be re-rendered, re-scored and used for retraining |

## Quick start

**Docker (one container, SQLite, demo data loaded):**

```bash
docker build -t solar-thermal-inspector .
docker run --rm -p 8000:8000 -e SEED_DEMO=1 -v sti-data:/data solar-thermal-inspector
# open http://localhost:8000  (API docs: http://localhost:8000/docs)
```

**Docker Compose (app + PostgreSQL 16, persistent volumes):**

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -hex 16)" > .env
docker compose up --build -d
```

**Local development (Python 3.11+):**

```bash
make setup          # venv + runtime and test dependencies
make demo           # load the bundled sample inspection (627 modules)
make run            # http://localhost:8000 with auto-reload
make test           # 57 tests
```

**Reproduce the model from raw data** (about an hour on 4 CPU cores, no GPU):

```bash
make setup-train    # + pandas, scikit-learn, matplotlib, torch
make retrain        # download, clean, split -> baselines + CNN -> evaluation -> tests
make eda            # optional: reports/eda.md and figures
```

The dataset zip is checked against a pinned SHA-256, the split is fixed by seed and committed
(`data/splits.csv`), and the evaluation script refuses to run if the exported ONNX graph disagrees with
PyTorch by more than 1e-4.

## Using it

**Upload** (dashboard *New inspection*, or `POST /api/inspections`): one image per module, as

- 8-bit or 16-bit IR crops (JPG, PNG, TIFF, BMP), any size (rotated to portrait and resized to 24 x 40);
- **radiometric** temperature matrices in degrees C (CSV as exported by FLIR Thermal Studio and similar, or
  NPY). These add an absolute delta T (T_max minus the module median) that escalates priority at 10 C and
  20 C, a common O&M triage convention, not an IEC limit. They are always flagged for review, because
  the classifier was trained on 8-bit crops;
- or a ZIP of the above. A `layout.csv` inside the ZIP (or uploaded separately) maps files to site
  positions: `filename,block,row,position[,label]`. With `label`, the inspection also reports agreement
  with ground truth.

Uploads are validated: size and file-count limits, Pillow decompression-bomb guard, ZIP entries read in
memory and never extracted by name (no path traversal), unreadable files listed as rejected.

```bash
curl -F site_name="Yeongam Block A" -F inspected_on=2026-09-01 \
     -F files=@flight_0901.zip http://localhost:8000/api/inspections
curl -O http://localhost:8000/api/inspections/1/workorders.csv
```

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | status, model version, alert policy, database |
| `POST` | `/api/inspections` | upload and score a survey (multipart) |
| `GET` | `/api/inspections` | list surveys |
| `GET` | `/api/inspections/{id}` | survey detail + KPIs |
| `GET` | `/api/inspections/{id}/findings` | work orders; filters `priority`, `predicted_class`, `status`, `needs_review`; sort `priority`, `loss`, `score`, `location`; paging |
| `GET` | `/api/inspections/{id}/workorders.csv` | CSV export (formula-injection safe) |
| `DELETE` | `/api/inspections/{id}` | delete a survey and its stored images |
| `GET` | `/api/findings/{id}` | one finding: top-3, explanation, action, warnings |
| `PATCH` | `/api/findings/{id}` | technician feedback: `open`, `in_progress`, `resolved`, `false_alarm` + note |
| `GET` | `/api/findings/{id}/image.png` | `view=thermal` (false colour), `overlay` (hot regions), `raw` |
| `POST` | `/api/predict` | score one image without storing it |
| `GET` | `/api/kpis` | fleet KPIs (optional `site`) |
| `GET` | `/api/model`, `/api/catalog` | model card and fault catalogue |
| `POST` | `/api/demo` | load the bundled sample inspection |

When `API_KEY` is set, every write endpoint requires `X-API-Key`. Reads stay open.

## KPIs

| KPI | Definition | Why it matters |
|---|---|---|
| Anomaly rate | anomalous modules / modules scored | plant health trend between flights |
| Open work orders, open P1 | alerts with status `open` or `in_progress` | the backlog |
| Overdue | open and older than the priority deadline (P1 7 days, P2 30, P3 90) | SLA compliance |
| Power at risk | sum over open alerts of module rating x share of output lost | what the backlog costs right now (kW) |
| Energy / revenue at risk | power at risk x specific yield (x tariff) | MWh/year and KRW/year, to justify the work |
| Field precision | resolved / (resolved + false alarm) | does the model keep the technicians' trust? |
| Mean time to resolve | upload to *resolved*, averaged | O&M responsiveness |
| Needs review | alerts with top-class probability < 0.5 or input warnings | human-in-the-loop workload |
| Label agreement / fault recall | only when labels are supplied | live check of the model on new data |

Economics use site settings (`MODULE_POWER_W` 400, `SPECIFIC_YIELD` 1300 kWh/kWp/yr, `TARIFF_KRW_PER_KWH`
150). These defaults are **placeholders**: set them from the datasheet, the yield history and the offtake
price. Output lost per fault comes from the dataset's own definitions for Diode (1/3), Diode-Multi (2/3) and
Offline-Module (whole module). For the other classes it is a stated planning assumption
(`src/solar_inspector/catalog.py`) to be replaced with I-V curve or SCADA data.

## Data and model

- **Data:** [InfraredSolarModules](https://github.com/RaptorMaps/InfraredSolarModules) (Raptor Maps, MIT
  licence), 20,000 IR crops of 24 x 40 px in 12 classes (11 faults + normal). After cleaning: 19,972
  images, split 70/15/15 stratified by class (13,981 / 2,996 / 2,995).
- **Image processing:** robust z-score (median and MAD) hot-spot segmentation with 4-connected
  components, plus 30 features: level, contrast, hot-region size and shape, thirds and halves of the
  module (bypass-diode substrings), border vs centre, gradient and Laplacian texture.
- **CNN:** 3 conv blocks (48-96-192 channels, BatchNorm, max-pool), global average pooling, dropout,
  647k parameters. Raw 0-255 levels (whole-module faults are about absolute warmth); augmentation with
  flips, +/-2 px shifts and sensor noise up to sd 6; square-root inverse-frequency class weights, label
  smoothing, OneCycle LR over 50 epochs, best epoch by validation macro-F1, and a softmax temperature
  (T = 0.75) fitted on validation.
- **Decision rule:** alert when P(fault) >= 0.32 (95% recall on validation). The reported class is the most
  likely fault. *needs review* below 0.5 confidence. Optional safety rule as above.
- Model card: [`models/MODEL_CARD.md`](models/MODEL_CARD.md).

## Testing and CI

`make test` runs 57 tests in under 30 seconds:

- **image processing:** decoding of every format, rotation and resizing, palette and 16-bit warnings,
  radiometric parsing, bad and malicious inputs (pickled NPY, out-of-range temperatures), exact
  hot-spot segmentation on synthetic modules, 4-connectivity;
- **features and scoring:** fault signatures, catalogue consistency, economics arithmetic, delta-T escalation;
- **upload safety:** ZIP path traversal, hidden and `__MACOSX` entries, size and count limits, CSV formula
  injection, early refusal of oversized requests;
- **API end to end:** upload with rejected files, filtering and sorting, image rendering, the feedback loop
  and KPIs, CSV export, overdue SLA logic, delete, API-key protection, radiometric prediction, demo seeding;
- **model contract and quality gate:** ONNX hash matches the metadata, probabilities are valid and
  deterministic, unit test of the decision rule, and minimum recall, false-alarm rate and accuracy on 627
  test-split images, so a worse model fails CI.

GitHub Actions (`.github/workflows/solar-inspector.yml`) runs lint, the full suite on **SQLite and
PostgreSQL 16**, builds the image and smoke-tests the running container over HTTP.

## Deployment

The image (`python:3.12-slim`, pinned by digest) runs as a non-root user with a healthcheck and stores
everything under `/data`. Free or cheap options for a public demo: any Docker host, Hugging Face Spaces
(Docker SDK, port 8000), Render or Fly.io. For a real site, use Compose with PostgreSQL, set `API_KEY`, and put
it behind HTTPS and a reverse proxy that also caps request size (the app refuses bodies over `MAX_UPLOAD_MB`, but
only after the headers arrive).

| Variable | Default | |
|---|---|---|
| `DATABASE_URL` | `sqlite:////data/inspector.db` | e.g. `postgresql+psycopg://user:pass@host/db` |
| `API_KEY` | empty (writes open) | set before exposing the service |
| `ALERT_POLICY` | `standard` | or `safety` |
| `SEED_DEMO` | `0` | `1` loads the sample inspection into an empty database |
| `WORKERS` | `1` | uvicorn workers (use more with PostgreSQL) |
| `MODULE_POWER_W`, `SPECIFIC_YIELD`, `TARIFF_KRW_PER_KWH` | 400, 1300, 150 | site economics |
| `MAX_FILES`, `MAX_FILE_MB`, `MAX_UPLOAD_MB` | 5000, 20, 200 | upload limits |

## Limitations and next steps

Honest scope of this MVP:

- One public dataset from one provider: no site or flight IDs, so the split can't hold out whole sites.
  Expect lower accuracy on a new camera or site until it is fine-tuned on a few hundred of its modules.
- The input is a **module crop**. Cutting modules out of full drone frames or orthomosaics is upstream and not
  included.
- Inspections are scored synchronously in the request (fine for a few thousand modules per upload).
- Loss fractions for 8 of 11 classes are planning assumptions, and tariff and yield are placeholders.

Next steps, in order:

- **NOW:** fine-tune on the operator's own labelled modules, starting with the *false alarm* and *resolved*
  feedback the app already stores, and compare each module with its neighbours on the same flight to catch offline modules.
- **SOON:** module detection on full IR frames (e.g. a small YOLO model) to remove manual cropping; a
  background job queue for large flights; Alembic migrations; per-site economics in the database.
- **LATER:** flight-to-flight tracking of the same physical module (degradation trends), GPS/orthomosaic
  map view, and CMMS integration through the existing CSV/REST endpoints.

## Project structure

```
solar-thermal-inspector/
  src/solar_inspector/   api.py (FastAPI) · services.py (pipeline) · predictor.py (ONNX + alert rule)
                         imaging.py · features.py · scoring.py · kpis.py · db.py · catalog.py · cli.py
                         static/ (dashboard)
  training/              prepare_data.py · eda.py · train_baselines.py · train_cnn.py · evaluate.py
  models/                thermal_cnn.onnx · model_meta.json · metrics.json · MODEL_CARD.md
  reports/               eda.md · evaluation.md · figures/ · data_quality.json
  data/                  splits.csv (committed) · sample/ (627 test images + synthetic layout, MIT)
  tests/                 57 tests
  Dockerfile · docker-compose.yml · Makefile
```

## Credits

Dataset: Raptor Maps, *InfraredSolarModules* (ICLR 2020 AI for Earth Sciences workshop), MIT licence;
bundled sample images keep its notice ([`data/sample/README.md`](data/sample/README.md)). Comparison
figures: Sun and Li (2023), *Laser & Optoelectronics Progress* 60(24).
