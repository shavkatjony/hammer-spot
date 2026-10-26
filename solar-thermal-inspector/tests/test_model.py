"""Model contract and quality gate.

The gate runs the served ONNX model through the real decision rule on the bundled sample: 627 images
from the TEST split, never used for training or tuning. The floors sit a few points under the measured
values (see reports/evaluation.md), so a retrained or re-exported model that silently gets worse fails CI.
"""

import hashlib
import json
from pathlib import Path

import numpy as np
import pytest

from solar_inspector.imaging import load_thermal
from solar_inspector.predictor import Predictor, decide_batch
from tests.conftest import ROOT, SAMPLE, module_array, sample_rows

MODELS = ROOT / "models"

# measured on the sample with the shipped model: standard recall 0.96, false-alarm rate 0.19,
# fault-label accuracy 0.68; safety critical recall 0.99
FLOORS = {"recall": 0.92, "max_fpr": 0.25, "fault_accuracy": 0.62, "safety_critical_recall": 0.96}


@pytest.fixture(scope="module")
def sample():
    rows = sample_rows()
    px = [load_thermal((SAMPLE / "images" / r["filename"]).read_bytes(), r["filename"]).pixels for r in rows]
    return np.array([r["label"] for r in rows]), px


def run(policy: str, sample) -> dict:
    labels, px = sample
    p = Predictor(MODELS, policy)
    decisions = [p.decide(row) for row in p.predict_proba(px)]
    flag = np.array([d.is_anomaly for d in decisions])
    pred = np.array([d.predicted_class for d in decisions])
    pos = labels != "No-Anomaly"
    crit = np.isin(labels, p.meta["critical_classes"])
    return {"recall": flag[pos].mean(), "fpr": flag[~pos].mean(), "critical_recall": flag[crit].mean(),
            "fault_accuracy": (pred[pos] == labels[pos]).mean()}


def test_artifacts_are_consistent():
    meta = json.loads((MODELS / "model_meta.json").read_text())
    metrics = json.loads((MODELS / "metrics.json").read_text())
    assert hashlib.sha256((MODELS / "thermal_cnn.onnx").read_bytes()).hexdigest() == meta["onnx_sha256"]
    assert metrics["model_version"] == meta["version"]
    assert len(meta["classes"]) == 12 and meta["normal"] in meta["classes"]
    assert 0 < meta["critical_threshold"] < meta["anomaly_threshold"] < 1


def test_probabilities_are_valid_and_deterministic():
    p = Predictor(MODELS)
    batch = [module_array(k, i).astype(np.float32) for i, k in enumerate(["normal", "hotspot", "diode", "offline"])]
    a, b = p.predict_proba(batch), p.predict_proba(batch)
    assert a.shape == (4, 12)
    assert np.allclose(a.sum(axis=1), 1, atol=1e-5) and (a >= 0).all()
    assert np.array_equal(a, b)


def test_quality_gate_standard_policy(sample):
    m = run("standard", sample)
    assert m["recall"] >= FLOORS["recall"], m
    assert m["fpr"] <= FLOORS["max_fpr"], m
    assert m["fault_accuracy"] >= FLOORS["fault_accuracy"], m


def test_safety_policy_catches_more_critical_faults(sample):
    std, safe = run("standard", sample), run("safety", sample)
    assert safe["critical_recall"] >= FLOORS["safety_critical_recall"], safe
    assert safe["critical_recall"] >= std["critical_recall"]
    assert safe["recall"] >= std["recall"]


def test_unknown_policy_is_rejected():
    with pytest.raises(ValueError):
        Predictor(Path(MODELS), "yolo")


def test_decision_rule():
    # classes: 0 = normal, 1 = minor fault, 2 = critical fault
    proba = np.array([
        [0.90, 0.05, 0.05],  # clearly normal
        [0.30, 0.60, 0.10],  # fault
        [0.55, 0.40, 0.05],  # normal is top-1, but P(fault) = 0.45 clears the 0.4 threshold
        [0.70, 0.05, 0.25],  # only the safety rule (P(critical) 0.25 >= 0.2) raises it
    ])
    flag, reported, score = decide_batch(proba, 0, [2], threshold=0.4)
    assert flag.tolist() == [False, True, True, False]
    assert reported.tolist() == [0, 1, 1, 0]
    assert np.allclose(score, [0.10, 0.70, 0.45, 0.30])
    flag, reported, _ = decide_batch(proba, 0, [2], threshold=0.4, critical_threshold=0.2)
    assert flag.tolist() == [False, True, True, True]
    assert reported[3] == 2  # raised by the critical rule -> reported as the critical class
