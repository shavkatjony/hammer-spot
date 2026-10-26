"""The inspection pipeline: files -> validated thermal images -> predictions -> findings in the database."""

from __future__ import annotations

import csv
import datetime as dt
import io
import time
import zipfile
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath

import numpy as np
from sqlalchemy.orm import Session

from .catalog import CLASSES
from .config import Settings
from .db import Finding, Inspection
from .features import explain
from .imaging import SUPPORTED_EXT, ImageError, ThermalImage, load_thermal, radiometric_summary
from .predictor import Predictor
from .scoring import assess

DEMO_SITE = "Demo Solar Farm (sample data)"
DEMO_NOTES = (
    "Images from the InfraredSolarModules test split (never used in training), class-balanced so every fault "
    "type appears. Block/row/position are synthetic. True labels are attached."
)


class UploadError(ValueError):
    """The upload as a whole is unusable (too big, too many files, nothing readable)."""


@dataclass
class ModuleMeta:
    block: str = ""
    row: str = ""
    position: str = ""
    label: str | None = None


@dataclass
class Batch:
    files: list[tuple[str, bytes]] = field(default_factory=list)
    layout: dict[str, ModuleMeta] = field(default_factory=dict)


def parse_layout(data: bytes) -> dict[str, ModuleMeta]:
    """CSV with a `filename` column and optional `block`, `row`, `position`, `label` columns."""
    try:
        reader = csv.DictReader(io.StringIO(data.decode("utf-8-sig")))
    except UnicodeDecodeError as exc:
        raise UploadError("layout CSV must be UTF-8") from exc
    if not reader.fieldnames or "filename" not in reader.fieldnames:
        raise UploadError("layout CSV needs a 'filename' column")
    out = {}
    for row in reader:
        name = PurePosixPath((row.get("filename") or "").strip()).name
        if not name:
            continue
        label = (row.get("label") or "").strip() or None
        if label is not None and label not in CLASSES:
            raise UploadError(f"unknown label '{label}' for {name}")
        out[name] = ModuleMeta(
            (row.get("block") or "").strip()[:40], (row.get("row") or "").strip()[:40],
            (row.get("position") or "").strip()[:40], label,
        )
    return out


def collect_files(uploads: list[tuple[str, bytes]], settings: Settings) -> Batch:
    """Flatten plain files and ZIP archives into (name, bytes); pick up layout/labels CSVs.

    ZIP safety: entries are read into memory with size limits and never extracted by their own
    path, so names like ../../etc/passwd are harmless (only the base name is kept, as a label).
    """
    max_file = int(settings.max_file_mb * 1024 * 1024)
    max_total = int(settings.max_upload_mb * 1024 * 1024)
    batch, total = Batch(), 0

    def add(name: str, data: bytes) -> None:
        nonlocal total
        base = PurePosixPath(name.replace("\\", "/")).name
        if not base or base.startswith("."):
            return
        if base.lower().endswith(".csv") and base.lower() in ("layout.csv", "labels.csv"):
            batch.layout.update(parse_layout(data))
            return
        total += len(data)
        if total > max_total:
            raise UploadError(f"upload larger than {settings.max_upload_mb:.0f} MB")
        batch.files.append((base, data))
        if len(batch.files) > settings.max_files:
            raise UploadError(f"more than {settings.max_files} files")

    for name, data in uploads:
        if name.lower().endswith(".zip"):
            try:
                zf = zipfile.ZipFile(io.BytesIO(data))
            except zipfile.BadZipFile as exc:
                raise UploadError(f"{name} is not a valid ZIP file") from exc
            with zf:
                for info in zf.infolist():
                    if info.is_dir() or "__MACOSX" in info.filename:
                        continue
                    if info.file_size > max_file:
                        raise UploadError(f"{info.filename} is larger than {settings.max_file_mb:.0f} MB")
                    if total + info.file_size > max_total:
                        raise UploadError(f"upload larger than {settings.max_upload_mb:.0f} MB uncompressed")
                    add(info.filename, zf.read(info))
        else:
            if len(data) > max_file:
                raise UploadError(f"{name} is larger than {settings.max_file_mb:.0f} MB")
            add(name, data)
    return batch


def _decode(files: list[tuple[str, bytes]], settings: Settings) -> tuple[list[tuple[str, ThermalImage]], list[dict]]:
    ok, rejected = [], []
    for name, data in files:
        ext = name[name.rfind(".") :].lower() if "." in name else ""
        if ext not in SUPPORTED_EXT:
            rejected.append({"file": name, "reason": f"unsupported type {ext or '(none)'}"})
            continue
        try:
            ok.append((name, load_thermal(data, name, settings.radiometric_gain)))
        except ImageError as exc:
            rejected.append({"file": name, "reason": str(exc)})
    return ok, rejected


def run_inspection(
    session: Session, predictor: Predictor, settings: Settings, batch: Batch, *, site_name: str,
    inspected_on: dt.date, notes: str = "", source: str = "upload",
) -> Inspection:
    t0 = time.perf_counter()
    images, rejected = _decode(batch.files, settings)
    if not images:
        reason = f" ({rejected[0]['reason']})" if rejected else ""
        raise UploadError("no readable thermal images in the upload" + reason)

    proba = predictor.predict_proba([img.pixels for _, img in images])
    medians = np.array([float(np.median(img.pixels)) for _, img in images])
    batch_median = float(np.median(medians))

    insp = Inspection(
        site_name=site_name.strip()[:120] or "Unnamed site", inspected_on=inspected_on, notes=notes[:2000],
        source=source, model_version=predictor.version, n_images=len(images), n_rejected=len(rejected),
        rejected=rejected[:200], batch_median=round(batch_median, 2),
    )
    session.add(insp)
    session.flush()  # assigns insp.id for the storage folder

    folder = settings.storage_dir / str(insp.id)
    folder.mkdir(parents=True, exist_ok=True)
    for k, ((name, img), p, med) in enumerate(zip(images, proba, medians, strict=True)):
        pred = predictor.decide(p)
        radio = radiometric_summary(img.temperature_c) if img.radiometric else None
        a = assess(pred.predicted_class, pred.is_anomaly, settings, radio["delta_t_c"] if radio else None)
        key = f"{insp.id}/{k:06d}.npy"
        np.save(settings.storage_dir / key, img.pixels.astype(np.float32))
        meta = batch.layout.get(name, ModuleMeta())
        warnings = list(img.warnings) + ([f"priority escalated: {a.escalated_by}"] if a.escalated_by else [])
        session.add(Finding(
            inspection_id=insp.id, filename=name[:255], image_key=key, block=meta.block, row=meta.row,
            position=meta.position, predicted_class=pred.predicted_class,
            class_confidence=round(pred.class_confidence, 4), anomaly_score=round(pred.anomaly_score, 4),
            is_anomaly=pred.is_anomaly, needs_review=pred.needs_review or (pred.is_anomaly and bool(img.warnings)),
            top3=[list(t) for t in pred.top3], explanation=explain(img.pixels), warnings=warnings,
            delta_vs_batch=round(float(med) - batch_median, 2), radiometric=radio, priority=a.priority,
            est_loss_w=a.est_loss_w, est_kwh_year=a.est_kwh_year, est_krw_year=a.est_krw_year,
            status="open" if pred.is_anomaly else "ok", ground_truth=meta.label,
        ))
    insp.processing_ms = round((time.perf_counter() - t0) * 1000, 1)
    session.commit()
    return insp


def load_pixels(settings: Settings, finding: Finding) -> np.ndarray:
    path = (settings.storage_dir / finding.image_key).resolve()
    if settings.storage_dir.resolve() not in path.parents:
        raise FileNotFoundError(finding.image_key)
    return np.load(path, allow_pickle=False)


def sample_batch(sample_dir: Path) -> Batch:
    """The bundled demo set: test-split images plus a synthetic site layout and the true labels."""
    files = [(p.name, p.read_bytes()) for p in sorted((sample_dir / "images").glob("*.png"))]
    layout = parse_layout((sample_dir / "layout.csv").read_bytes())
    return Batch(files=files, layout=layout)
