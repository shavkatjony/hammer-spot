"""Command line helpers.

    python -m solar_inspector.cli seed-demo [--if-empty]   # load the bundled sample inspection
    python -m solar_inspector.cli init-db                  # create tables
"""

from __future__ import annotations

import argparse
import datetime as dt

from sqlalchemy import func, select

from .config import get_settings
from .db import Inspection, init_db, make_engine, make_session_factory
from .predictor import Predictor
from .services import DEMO_NOTES, DEMO_SITE, run_inspection, sample_batch


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(prog="solar_inspector")
    sub = ap.add_subparsers(dest="cmd", required=True)
    seed = sub.add_parser("seed-demo", help="load the bundled sample inspection")
    seed.add_argument("--if-empty", action="store_true", help="only when the database has no inspections")
    sub.add_parser("init-db", help="create tables")
    args = ap.parse_args(argv)

    settings = get_settings()
    engine = make_engine(settings.database_url)
    init_db(engine)
    if args.cmd == "init-db":
        print("tables ready")
        return
    sessions = make_session_factory(engine)
    with sessions() as session:
        if args.if_empty and session.scalar(select(func.count()).select_from(Inspection)):
            print("database already has inspections: demo not loaded")
            return
        settings.storage_dir.mkdir(parents=True, exist_ok=True)
        insp = run_inspection(
            session, Predictor(settings.model_dir, settings.alert_policy), settings, sample_batch(settings.sample_dir),
            site_name=DEMO_SITE, inspected_on=dt.date.today(), source="demo", notes=DEMO_NOTES,
        )
        print(f"demo inspection #{insp.id}: {insp.n_images} modules in {insp.processing_ms:.0f} ms")


if __name__ == "__main__":
    main()
