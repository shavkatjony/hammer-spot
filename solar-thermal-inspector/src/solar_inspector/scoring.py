"""From a model decision to an O&M work order: priority and estimated cost of leaving it alone."""

from __future__ import annotations

from dataclasses import dataclass

from .catalog import CLASSES, NORMAL
from .config import Settings


@dataclass
class Assessment:
    priority: str
    est_loss_w: float
    est_kwh_year: float
    est_krw_year: float
    escalated_by: str = ""


def assess(predicted_class: str, is_anomaly: bool, settings: Settings, delta_t_c: float | None = None) -> Assessment:
    """Priority from the fault type, escalated by absolute delta T when the input is radiometric.

    Energy = module rating x share lost x specific yield. All three inputs are site settings
    (see config.py); the share lost per class is documented in catalog.py.
    """
    if not is_anomaly or predicted_class == NORMAL:
        return Assessment("-", 0.0, 0.0, 0.0)
    cls = CLASSES[predicted_class]
    priority, escalated = cls.priority, ""
    if delta_t_c is not None:
        if delta_t_c >= settings.delta_t_severe_c and priority != "P1":
            priority, escalated = "P1", f"delta T {delta_t_c:.1f} C >= {settings.delta_t_severe_c:.0f} C"
        elif delta_t_c >= settings.delta_t_moderate_c and priority == "P3":
            priority, escalated = "P2", f"delta T {delta_t_c:.1f} C >= {settings.delta_t_moderate_c:.0f} C"
    loss_w = settings.module_power_w * cls.loss_fraction
    kwh = loss_w / 1000 * settings.specific_yield_kwh_per_kwp
    return Assessment(priority, round(loss_w, 1), round(kwh, 1), round(kwh * settings.tariff_krw_per_kwh), escalated)
