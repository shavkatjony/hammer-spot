"""Baselines that don't need a neural network.

    python training/train_baselines.py

1. rule        : image processing only. Anomaly score = peak contrast above the module median.
2. gbm         : HistGradientBoosting on the 30 hand-crafted features (12 classes).
3. iforest     : Isolation Forest fitted on NORMAL training modules only (no fault labels at all).

Every model writes its validation and test scores to data/processed/preds_<name>.npz;
training/evaluate.py turns those into one comparable report.
"""

from __future__ import annotations

import time

import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier, IsolationForest
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

from common import CLASS_NAMES, FEATURE_NAMES, NORMAL, ROOT, SEED, feature_matrix, load_dataset, write_json

OUT = ROOT / "data/processed"


def save(name: str, **arrays) -> None:
    np.savez_compressed(OUT / f"preds_{name}.npz", **arrays)


def main() -> None:
    d = load_dataset()
    F, y, split = feature_matrix(d["X"]), d["y"], d["split"]
    normal = CLASS_NAMES.index(NORMAL)
    tr, va, te = (split == "train"), (split == "val"), (split == "test")
    is_anom = y != normal
    log = {}

    # 1. rule: one image-processing feature, no learning beyond picking the threshold later on val
    j = FEATURE_NAMES.index("contrast_max")
    save("rule", val_score=F[va, j], test_score=F[te, j])
    log["rule"] = {"feature": "contrast_max", "val_auc": roc_auc_score(is_anom[va], F[va, j])}

    # 2. gradient boosting on features, small grid tuned on validation macro-F1
    best = None
    for lr in (0.05, 0.1):
        for leaves in (31, 63):
            t = time.time()
            clf = HistGradientBoostingClassifier(
                learning_rate=lr, max_leaf_nodes=leaves, max_iter=600, early_stopping=True,
                validation_fraction=0.1, n_iter_no_change=30, l2_regularization=1.0, random_state=SEED,
            )
            clf.fit(F[tr], y[tr], sample_weight=compute_sample_weight("balanced", y[tr]))
            f1 = f1_score(y[va], clf.predict(F[va]), average="macro")
            print(f"gbm lr={lr} leaves={leaves} iters={clf.n_iter_} val macro-F1={f1:.4f} ({time.time() - t:.0f}s)")
            if best is None or f1 > best[0]:
                best = (f1, lr, leaves, clf)
    f1, lr, leaves, clf = best
    save("gbm", val_proba=clf.predict_proba(F[va]), test_proba=clf.predict_proba(F[te]))
    log["gbm"] = {"learning_rate": lr, "max_leaf_nodes": leaves, "iterations": int(clf.n_iter_),
                  "val_macro_f1": f1}

    # 3. isolation forest on normal modules only: how far do you get with zero fault labels?
    scaler = StandardScaler().fit(F[tr & ~is_anom])
    iso = IsolationForest(n_estimators=400, contamination="auto", random_state=SEED, n_jobs=-1)
    iso.fit(scaler.transform(F[tr & ~is_anom]))
    val_s = -iso.score_samples(scaler.transform(F[va]))
    save("iforest", val_score=val_s, test_score=-iso.score_samples(scaler.transform(F[te])))
    log["iforest"] = {"n_estimators": 400, "fit_on": "normal training modules only",
                      "val_auc": roc_auc_score(is_anom[va], val_s)}

    write_json(ROOT / "reports/baselines_training.json", log)
    print(log)


if __name__ == "__main__":
    main()
