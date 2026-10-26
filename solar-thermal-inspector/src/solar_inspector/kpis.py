"""Operational KPIs, computed in SQL so they scale with the database rather than with Python memory.

Inspection level : modules, anomaly rate, findings by priority/class, power and energy at risk,
                   work-order status, field-confirmed precision, agreement with labels (if supplied).
Portfolio level  : the same across inspections, plus backlog, overdue work orders, time to resolve.
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy import Integer, case, func, or_, select
from sqlalchemy.orm import Session

from .catalog import PRIORITY_SLA_DAYS
from .db import Finding, Inspection, utcnow

OPEN_STATES = ("open", "in_progress")


def _counts(session: Session, column, *where) -> dict[str, int]:
    rows = session.execute(select(column, func.count()).where(*where).group_by(column)).all()
    return {str(k): int(v) for k, v in rows}


def inspection_kpis(session: Session, inspection_id: int) -> dict:
    f = Finding
    anomaly = f.is_anomaly.is_(True)
    row = session.execute(
        select(
            func.count(),
            func.sum(case((anomaly, 1), else_=0)),
            func.sum(case((anomaly & f.needs_review.is_(True), 1), else_=0)),
            func.coalesce(func.sum(f.est_loss_w), 0.0),
            func.coalesce(func.sum(f.est_kwh_year), 0.0),
            func.coalesce(func.sum(f.est_krw_year), 0.0),
            func.sum(case((f.ground_truth.is_not(None), 1), else_=0)),
            func.sum(case((f.ground_truth == f.predicted_class, 1), else_=0)),
            func.sum(case(((f.ground_truth != "No-Anomaly") & anomaly, 1), else_=0)),
            func.sum(case((f.ground_truth != "No-Anomaly", 1), else_=0)),
        ).where(f.inspection_id == inspection_id)
    ).one()
    modules, anomalies, review, loss_w, kwh, krw, labelled, agree, caught, faulty = (v or 0 for v in row)
    status = _counts(session, f.status, f.inspection_id == inspection_id, anomaly)
    confirmed, false_alarm = status.get("resolved", 0), status.get("false_alarm", 0)
    out = {
        "modules": modules,
        "anomalies": anomalies,
        "anomaly_rate": anomalies / modules if modules else 0.0,
        "needs_review": review,
        "by_priority": _counts(session, f.priority, f.inspection_id == inspection_id, anomaly),
        "by_class": _counts(session, f.predicted_class, f.inspection_id == inspection_id, anomaly),
        "by_status": status,
        "power_at_risk_kw": round(loss_w / 1000, 2),
        "energy_at_risk_mwh_year": round(kwh / 1000, 2),
        "revenue_at_risk_krw_year": round(krw),
        # of the alerts technicians have closed, how many were real faults?
        "field_precision": confirmed / (confirmed + false_alarm) if confirmed + false_alarm else None,
        "labelled": labelled,
    }
    if labelled:
        out["label_agreement"] = agree / labelled
        out["label_recall"] = caught / faulty if faulty else None
    return out


def portfolio_kpis(session: Session, site: str | None = None) -> dict:
    f, i = Finding, Inspection
    site_filter = (i.site_name == site,) if site else ()
    open_wo = (f.is_anomaly.is_(True)) & (f.status.in_(OPEN_STATES))

    totals = session.execute(
        select(
            func.count(func.distinct(i.id)), func.count(f.id),
            func.sum(case((f.is_anomaly.is_(True), 1), else_=0)),
            func.sum(case((open_wo, 1), else_=0)),
            func.sum(case((open_wo & (f.priority == "P1"), 1), else_=0)),
            func.coalesce(func.sum(case((open_wo, f.est_loss_w), else_=0.0)), 0.0),
            func.coalesce(func.sum(case((open_wo, f.est_krw_year), else_=0.0)), 0.0),
        ).select_from(f).join(i).where(*site_filter)
    ).one()
    n_insp, modules, anomalies, open_n, open_p1, open_loss_w, open_krw = (v or 0 for v in totals)

    # overdue = still open and older than the priority's SLA (counted from upload time)
    now = utcnow()
    late = or_(*[(f.priority == p) & (f.created_at < now - dt.timedelta(days=d)) for p, d in PRIORITY_SLA_DAYS.items()])
    overdue = session.scalar(select(func.count(f.id)).join(i).where(*site_filter, open_wo, late)) or 0

    resolved = session.execute(
        select(f.created_at, f.resolved_at).join(i).where(*site_filter, f.status == "resolved",
                                                          f.resolved_at.is_not(None))
    ).all()
    hours = [(r.resolved_at - r.created_at).total_seconds() / 3600 for r in resolved]
    closed = session.execute(
        select(func.sum(case((f.status == "resolved", 1), else_=0)),
               func.sum(case((f.status == "false_alarm", 1), else_=0))).join(i).where(*site_filter)
    ).one()
    confirmed, false_alarm = (v or 0 for v in closed)

    trend = [
        {"inspection_id": r.id, "site_name": r.site_name, "inspected_on": r.inspected_on.isoformat(),
         "modules": int(r.modules), "anomalies": int(r.anomalies or 0),
         "anomaly_rate": (r.anomalies or 0) / r.modules if r.modules else 0.0}
        for r in session.execute(
            select(i.id, i.site_name, i.inspected_on, func.count(f.id).label("modules"),
                   func.sum(case((f.is_anomaly.is_(True), 1), else_=0)).cast(Integer).label("anomalies"))
            .join(f).where(*site_filter).group_by(i.id).order_by(i.inspected_on, i.id)
        )
    ]
    return {
        "inspections": n_insp,
        "modules_inspected": modules,
        "anomalies": anomalies,
        "anomaly_rate": anomalies / modules if modules else 0.0,
        "open_work_orders": open_n,
        "open_p1": open_p1,
        "overdue_work_orders": overdue,
        "open_power_at_risk_kw": round(open_loss_w / 1000, 2),
        "open_revenue_at_risk_krw_year": round(open_krw),
        "resolved": confirmed,
        "false_alarms": false_alarm,
        "field_precision": confirmed / (confirmed + false_alarm) if confirmed + false_alarm else None,
        "mean_hours_to_resolve": round(sum(hours) / len(hours), 1) if hours else None,
        "open_by_priority": _counts(session, f.priority, f.id.in_(select(f.id).join(i).where(*site_filter, open_wo))),
        "trend": trend,
    }
