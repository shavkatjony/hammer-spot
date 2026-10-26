"""Database schema (SQLAlchemy 2.0). SQLite by default, PostgreSQL in docker-compose.

Tables
- inspections : one drone survey (site, date, totals, model version)
- findings    : one row per module image, with prediction, explanation, economics and work-order status
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    create_engine,
    event,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker


def utcnow() -> dt.datetime:
    return dt.datetime.now(dt.UTC).replace(tzinfo=None)


class Base(DeclarativeBase):
    pass


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    site_name: Mapped[str] = mapped_column(String(120), index=True)
    inspected_on: Mapped[dt.date] = mapped_column(index=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=utcnow)
    notes: Mapped[str] = mapped_column(Text, default="")
    source: Mapped[str] = mapped_column(String(20), default="upload")  # upload | demo
    model_version: Mapped[str] = mapped_column(String(40))
    n_images: Mapped[int] = mapped_column(Integer, default=0)
    n_rejected: Mapped[int] = mapped_column(Integer, default=0)
    rejected: Mapped[list] = mapped_column(JSON, default=list)  # [{"file": ..., "reason": ...}]
    batch_median: Mapped[float] = mapped_column(Float, default=0.0)
    processing_ms: Mapped[float] = mapped_column(Float, default=0.0)

    findings: Mapped[list[Finding]] = relationship(back_populates="inspection", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    inspection_id: Mapped[int] = mapped_column(ForeignKey("inspections.id", ondelete="CASCADE"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    image_key: Mapped[str] = mapped_column(String(255))  # path under STORAGE_DIR (pixels as .npy)
    # where the module is on site (optional, from the layout CSV)
    block: Mapped[str] = mapped_column(String(40), default="")
    row: Mapped[str] = mapped_column(String(40), default="")
    position: Mapped[str] = mapped_column(String(40), default="")

    predicted_class: Mapped[str] = mapped_column(String(40), index=True)
    class_confidence: Mapped[float] = mapped_column(Float)
    anomaly_score: Mapped[float] = mapped_column(Float)
    is_anomaly: Mapped[bool] = mapped_column(Boolean, index=True)
    needs_review: Mapped[bool] = mapped_column(Boolean, default=False)
    top3: Mapped[list] = mapped_column(JSON, default=list)
    explanation: Mapped[dict] = mapped_column(JSON, default=dict)
    warnings: Mapped[list] = mapped_column(JSON, default=list)
    delta_vs_batch: Mapped[float] = mapped_column(Float, default=0.0)
    radiometric: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    priority: Mapped[str] = mapped_column(String(4), index=True)  # P1 | P2 | P3 | -
    est_loss_w: Mapped[float] = mapped_column(Float, default=0.0)
    est_kwh_year: Mapped[float] = mapped_column(Float, default=0.0)
    est_krw_year: Mapped[float] = mapped_column(Float, default=0.0)

    # work order lifecycle: open -> in_progress -> resolved | false_alarm
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    status_note: Mapped[str] = mapped_column(Text, default="")
    resolved_at: Mapped[dt.datetime | None] = mapped_column(DateTime, nullable=True)
    ground_truth: Mapped[str | None] = mapped_column(String(40), nullable=True)  # if labels were supplied
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=utcnow)

    inspection: Mapped[Inspection] = relationship(back_populates="findings")

    __table_args__ = (Index("ix_findings_insp_anom_prio", "inspection_id", "is_anomaly", "priority"),)


def make_engine(url: str):
    kwargs = {"pool_pre_ping": True}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    engine = create_engine(url, **kwargs)
    if url.startswith("sqlite"):
        @event.listens_for(engine, "connect")
        def _fk_on(dbapi_conn, _):  # SQLite ignores ON DELETE CASCADE unless this is on
            dbapi_conn.execute("PRAGMA foreign_keys=ON")
    return engine


def make_session_factory(engine):
    return sessionmaker(bind=engine, expire_on_commit=False)


def init_db(engine) -> None:
    Base.metadata.create_all(engine)
