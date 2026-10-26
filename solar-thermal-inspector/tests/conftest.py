from __future__ import annotations

import csv
import io
import os
from dataclasses import replace
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from solar_inspector.api import create_app
from solar_inspector.config import Settings
from solar_inspector.db import Base, make_engine

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "data" / "sample"


def module_array(kind: str = "normal", seed: int = 0) -> np.ndarray:
    """A synthetic 40 x 24 module: warm body, cooler frame, sensor noise, optional fault pattern."""
    rng = np.random.default_rng(seed)
    a = 155 + rng.normal(0, 2, (40, 24))
    a[:2], a[-2:], a[:, :2], a[:, -2:] = 125, 125, 125, 125
    if kind == "hotspot":
        a[20:23, 10:13] += 60
    elif kind == "diode":
        a[2:-2, 2:9] += 25
    elif kind == "offline":
        a[2:-2, 2:-2] += 30
    return np.clip(a, 0, 255).astype(np.uint8)


def png_bytes(arr: np.ndarray) -> bytes:
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="PNG")
    return buf.getvalue()


def sample_rows() -> list[dict]:
    with (SAMPLE / "layout.csv").open() as f:
        return list(csv.DictReader(f))


def pick_sample(labels: dict[str, int]) -> list[dict]:
    """First n sample images of each requested label, e.g. {"Offline-Module": 3}."""
    out = []
    for lab, n in labels.items():
        out += [r for r in sample_rows() if r["label"] == lab][:n]
    return out


@pytest.fixture()
def settings(tmp_path: Path) -> Settings:
    # TEST_DATABASE_URL=postgresql+psycopg://... runs the suite against PostgreSQL (schema reset per test)
    url = os.environ.get("TEST_DATABASE_URL") or f"sqlite:///{tmp_path / 'test.db'}"
    if url.startswith("postgresql"):
        engine = make_engine(url)
        Base.metadata.drop_all(engine)
        engine.dispose()
    return replace(
        Settings(),
        database_url=url,
        storage_dir=tmp_path / "uploads",
        model_dir=ROOT / "models",
        sample_dir=SAMPLE,
        api_key="",
    )


@pytest.fixture()
def client(settings: Settings):
    with TestClient(create_app(settings)) as c:
        yield c
