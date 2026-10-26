"""Model inference: ONNX Runtime only (no PyTorch at serving time).

`decide_batch` is the single definition of the alert rule. training/evaluate.py scores the model with
the same function, so the reported metrics are the metrics of what the API actually does.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import onnxruntime as ort

from .imaging import to_model_tensor

POLICIES = ("standard", "safety")


def decide_batch(
    proba: np.ndarray, normal_idx: int, critical_idx: list[int], threshold: float,
    critical_threshold: float | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Alert rule for a batch of probability vectors -> (is_anomaly, reported class index, anomaly score).

    standard : alert when P(any fault) = 1 - P(normal) >= threshold (set on validation for 95% recall).
    safety   : also alert when P(critical faults) >= critical_threshold, a lower bar for the classes
               that cost the most or can start fires (set on validation for 97% critical recall).
    An alerted module is reported as its most likely fault class, even when "normal" has the single
    highest probability; one raised only by the safety rule is reported as its most likely critical class.
    """
    score = 1.0 - proba[:, normal_idx]
    main = score >= threshold
    crit = np.zeros_like(main)
    if critical_threshold is not None:
        crit = proba[:, critical_idx].sum(axis=1) >= critical_threshold
    flag = main | crit
    masked = proba.copy()
    masked[:, normal_idx] = -1
    fault = masked.argmax(axis=1)
    only_crit = crit & ~main
    if only_crit.any():
        cmask = np.full_like(proba, -1)
        cmask[:, critical_idx] = proba[:, critical_idx]
        fault = np.where(only_crit, cmask.argmax(axis=1), fault)
    return flag, np.where(flag, fault, normal_idx), score


@dataclass
class Prediction:
    predicted_class: str
    class_confidence: float  # calibrated probability of the reported class
    anomaly_score: float  # 1 - P(No-Anomaly)
    is_anomaly: bool
    needs_review: bool
    top3: list[tuple[str, float]]


class Predictor:
    def __init__(self, model_dir: Path, policy: str = "standard"):
        if policy not in POLICIES:
            raise ValueError(f"ALERT_POLICY must be one of {POLICIES}")
        self.meta = json.loads((model_dir / "model_meta.json").read_text())
        so = ort.SessionOptions()
        so.intra_op_num_threads = 2
        self.session = ort.InferenceSession(
            str(model_dir / "thermal_cnn.onnx"), so, providers=["CPUExecutionProvider"]
        )
        self.classes: list[str] = self.meta["classes"]
        self.normal_idx = self.classes.index(self.meta["normal"])
        self.critical_idx = [self.classes.index(c) for c in self.meta["critical_classes"]]
        self.threshold: float = float(self.meta["anomaly_threshold"])
        self.critical_threshold = float(self.meta["critical_threshold"]) if policy == "safety" else None
        self.review_confidence: float = float(self.meta["review_confidence"])
        self.version: str = self.meta["version"]
        self.policy = policy

    def predict_proba(self, pixels_batch: list[np.ndarray]) -> np.ndarray:
        if not pixels_batch:
            return np.zeros((0, len(self.classes)), dtype=np.float32)
        x = np.concatenate([to_model_tensor(p) for p in pixels_batch])
        out = [self.session.run(None, {"pixels": x[i : i + 512]})[0] for i in range(0, len(x), 512)]
        return np.concatenate(out)

    def decide(self, proba: np.ndarray) -> Prediction:
        flag, reported, score = decide_batch(
            proba[None], self.normal_idx, self.critical_idx, self.threshold, self.critical_threshold
        )
        k, is_anomaly = int(reported[0]), bool(flag[0])
        order = np.argsort(-proba)[:3]
        return Prediction(
            predicted_class=self.classes[k],
            class_confidence=float(proba[k]),
            anomaly_score=float(score[0]),
            is_anomaly=is_anomaly,
            needs_review=bool(is_anomaly and float(proba.max()) < self.review_confidence),
            top3=[(self.classes[i], round(float(proba[i]), 4)) for i in order],
        )
