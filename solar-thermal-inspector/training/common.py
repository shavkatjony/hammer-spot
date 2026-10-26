"""Shared helpers for the offline scripts (data loading, feature matrix cache, metrics)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from solar_inspector.catalog import CLASSES, CRITICAL, NORMAL  # noqa: E402
from solar_inspector.features import FEATURE_NAMES, feature_vector  # noqa: E402

CLASS_NAMES = sorted(CLASSES)  # fixed label order shared by every model and the API
FIG = ROOT / "reports/figures"
SEED = 42


def load_dataset() -> dict[str, np.ndarray]:
    path = ROOT / "data/processed/dataset.npz"
    if not path.exists():
        raise SystemExit("run `python training/prepare_data.py` first")
    d = np.load(path)
    y = np.array([CLASS_NAMES.index(lab) for lab in d["labels"]])
    return {"X": d["images"], "y": y, "ids": d["ids"], "split": d["split"], "labels": d["labels"]}


def feature_matrix(images: np.ndarray) -> np.ndarray:
    """Hand-crafted features for every image, cached next to the dataset (they take ~1 min to compute)."""
    cache = ROOT / "data/processed/features.npy"
    if cache.exists():
        F = np.load(cache)
        if F.shape == (len(images), len(FEATURE_NAMES)):
            return F
    F = np.stack([feature_vector(im.astype(np.float32)) for im in images])
    np.save(cache, F)
    return F


def write_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2))


__all__ = ["CLASS_NAMES", "CLASSES", "CRITICAL", "NORMAL", "FEATURE_NAMES", "ROOT", "FIG", "SEED",
           "load_dataset", "feature_matrix", "write_json"]
