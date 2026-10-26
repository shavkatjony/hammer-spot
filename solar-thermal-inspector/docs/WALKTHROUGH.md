# How this project works, step by step

A plain-language walkthrough of the build, in the order it was done. Each step says **what** was built,
**why**, **where** it lives, and the **one thing to remember** if someone asks about it.

---

## Step 1. Define the job, not the model

**What.** An O&M team flies a drone over a solar plant and gets thousands of thermal crops, one per module.
They need a short, ranked list of modules to visit, with the reason and the money at stake.

**Why it shapes everything.** It sets the measures of success before any code exists:

- A missed dead module costs a year of output, and a false alarm costs a few minutes of a technician's time,
  so the alert threshold targets **recall** (95%) first.
- Technicians stop trusting a tool that cries wolf, so **precision and the false-alarm rate** are tracked too,
  in the lab and in the field (the *false alarm* button).
- The output is a **work order** (priority, location, action, deadline), not a probability.

**Remember:** start from the decision the user has to make, then choose metrics that price its errors.

## Step 2. Get data you can trust

**What.** `training/prepare_data.py` downloads InfraredSolarModules, checks a pinned SHA-256, reads the images
straight from the zip, hashes every image, and writes a fixed 70/15/15 split stratified by class.

**Finding.** 22 groups of pixel-identical images, and **6 groups whose copies have different labels**. Those
were dropped, and the remaining duplicates were kept once, so no image can sit in both train and test (leakage).

**Remember:** check duplicates and label conflicts before modelling. It takes a minute and changes the conclusions.

## Step 3. Look before you model (EDA)

**What.** `training/eda.py` -> `reports/eda.md`: class balance, example images, mean image per class, and
feature distributions.

**What it showed and what it changed:**

- Half the data is normal and four classes have fewer than 260 images -> class weights and macro-F1.
- Whole-module faults (Offline, Diode-Multi) are about **absolute warmth** -> no per-image normalisation.
- Flipping a module doesn't change the fault, but rotating it does -> flip augmentation only.
- Vegetation heats the **bottom edge** (hottest pixel in the bottom quarter in 63% of images vs 29% for normal).

**Remember:** every modelling choice should point back to something the data showed.

## Step 4. Classic image processing first

**What.** `src/solar_inspector/imaging.py` and `features.py`.

- **Hot-spot segmentation:** a pixel is "hot" when it is more than 3.5 robust standard deviations (median + MAD)
  *and* at least 8 grey levels above the module's median; connected regions are found with a 4-neighbour BFS.
- **30 features:** level, contrast, size and shape of hot regions, warmth of each third of the module (a bypass
  diode heats one substring = one third), border vs centre, texture.

**Why.** It gives a cheap baseline and, more importantly, the **explanation** shown on every finding
("1 hot region, 3% of the module, +60 grey levels").

**Remember:** median and MAD are robust to the very outliers you're looking for, while mean and std aren't.

## Step 5. Compare models honestly

**What.** `train_baselines.py` and `train_cnn.py`, scored by `evaluate.py`.

| Model | Idea | Anomaly ROC-AUC |
|---|---|---:|
| Rule | "peak contrast above a threshold" | 0.842 |
| Isolation Forest | trained on normal modules only, no fault labels | 0.779 |
| Gradient boosting | 30 hand-crafted features | 0.935 |
| CNN | learns its own features from raw pixels | **0.980** |

**Protocol.** Thresholds are chosen on **validation** (95% recall); the **test** split is used once, at the end.
At equal recall the CNN raises 3.3x fewer false alarms than gradient boosting.

**Remember:** "which model is best" only means something at a fixed operating point on held-out data.

## Step 6. Make the probabilities mean something

- **Calibration:** label smoothing and test-time augmentation made the CNN under-confident (ECE 0.12).
  One temperature (T = 0.7), fitted on validation log-loss, brought ECE down to about 0.02 without changing any
  prediction. So "80% confident" now means right about 80% of the time, which matters because confidence
  decides which alerts go to human review.
- **Prevalence:** the test split is 50% faulty; a plant may be 5%. Precision = TPR·p / (TPR·p + FPR·(1-p)),
  so at 5% only about 1 alert in 4 is a real fault. The fix is a workflow, not a bigger model: every alert carries
  its image, and the false-alarm feedback is stored.
- **Weak spot:** offline modules (recall 0.63) look normal on their own. The **safety policy** adds a lower alert
  bar for critical classes: critical misses fall from 22 to 8 out of 412, while false alarms roughly double.
  It's a business choice, so it's a setting (`ALERT_POLICY`), not a hidden constant.

**Remember:** a model is a probability plus a decision rule. Put the rule (`decide_batch`) in one place and
evaluate exactly what you serve.

## Step 7. Serve it like a product

**What.** `src/solar_inspector/`:

- `predictor.py`: ONNX Runtime, no PyTorch at serving time (1.2 MB model, about 3-4 ms per image on one CPU thread).
- `services.py`: upload pipeline, with ZIP flattening without path traversal, size limits, per-file rejection
  reasons, and batch-relative level.
- `scoring.py` + `catalog.py`: fault -> priority (P1/P2/P3 with deadlines), W / kWh / KRW at risk, recommended action.
- `db.py` + `kpis.py`: SQLAlchemy models; KPIs as SQL aggregations (`COUNT`, `SUM(CASE ...)`, `GROUP BY`).
- `api.py`: FastAPI with typed responses (`/docs`), optional API key, CSP and security headers, CSV export.
- `static/`: dashboard in plain HTML/CSS/JS. All user text goes in through `textContent`, never as HTML.

**Remember:** the API returns decisions (priority, action, money) and evidence (image, top-3, explanation),
not just a label.

## Step 8. Prove it works, then ship it

- **Tests (57):** image I/O and malicious inputs, segmentation, scoring, upload safety, the full API
  workflow, and a **model quality gate** that fails CI if a retrained model gets worse on 627 held-out images.
- **Two databases:** the same suite runs on SQLite and PostgreSQL 16 (`TEST_DATABASE_URL`).
- **Docker:** pinned base image, non-root user, healthcheck, demo seeding; Compose adds PostgreSQL.
- **CI:** lint, both test runs, image build, and a real-HTTP smoke test of the container.

**Remember:** "it works" means a test proves it, on the same artefact you deploy.

---

## Check yourself (answer out loud, then check the code)

1. Why is the alert threshold chosen on validation and not on test? What goes wrong otherwise?
2. With recall 0.96 and a false-alarm rate of 0.15, what share of alerts are real when 2% of modules are faulty?
3. Why median/MAD instead of mean/std for hot-spot detection?
4. Why don't we normalise each image to [0, 1] before the CNN?
5. What does temperature scaling change, and what does it leave unchanged?
6. Which SQL pattern computes "open P1 work orders" and "power at risk" in a single query? (`kpis.py`)
7. How does the upload code stop a ZIP entry named `../../etc/passwd` from writing outside the storage folder?
8. When would you switch `ALERT_POLICY` to `safety`, and what does it cost?

Answers to 2: 0.96·0.02 / (0.96·0.02 + 0.15·0.98) ≈ **0.12**. For the rest, the file named in each step has the answer.
