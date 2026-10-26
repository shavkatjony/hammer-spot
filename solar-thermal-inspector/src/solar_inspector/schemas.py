"""API response and request models (they also drive the OpenAPI docs at /docs)."""

from __future__ import annotations

import datetime as dt
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Status = Literal["open", "in_progress", "resolved", "false_alarm"]


class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    inspection_id: int
    filename: str
    block: str
    row: str
    position: str
    predicted_class: str
    class_confidence: float
    anomaly_score: float
    is_anomaly: bool
    needs_review: bool
    priority: str
    est_loss_w: float
    est_kwh_year: float
    est_krw_year: float
    status: str
    status_note: str
    resolved_at: dt.datetime | None
    ground_truth: str | None
    delta_vs_batch: float
    created_at: dt.datetime


class FindingDetail(FindingOut):
    top3: list[list]
    explanation: dict
    warnings: list[str]
    radiometric: dict | None
    action: str
    description: str
    loss_basis: str
    safety: bool


class FindingUpdate(BaseModel):
    status: Status
    note: str = Field(default="", max_length=2000)


class InspectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    site_name: str
    inspected_on: dt.date
    created_at: dt.datetime
    notes: str
    source: str
    model_version: str
    n_images: int
    n_rejected: int
    processing_ms: float


class InspectionDetail(InspectionOut):
    rejected: list[dict]
    batch_median: float
    kpis: dict


class FindingPage(BaseModel):
    total: int
    items: list[FindingOut]


class PredictOut(BaseModel):
    filename: str
    predicted_class: str
    class_confidence: float
    anomaly_score: float
    is_anomaly: bool
    needs_review: bool
    priority: str
    top3: list[list]
    explanation: dict
    warnings: list[str]
    radiometric: dict | None
    action: str
    model_version: str
