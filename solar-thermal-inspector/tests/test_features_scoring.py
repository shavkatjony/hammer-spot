import numpy as np
import pytest

from solar_inspector.catalog import CLASSES, CRITICAL, NORMAL, PRIORITY_SLA_DAYS
from solar_inspector.config import Settings
from solar_inspector.features import FEATURE_NAMES, explain, extract_features, feature_vector
from solar_inspector.scoring import assess
from tests.conftest import module_array


def test_feature_vector_is_complete_and_finite():
    v = feature_vector(module_array("normal").astype(np.float32))
    assert v.shape == (len(FEATURE_NAMES),)
    assert np.isfinite(v).all()


def test_hotspot_raises_contrast_and_count():
    normal = extract_features(module_array("normal").astype(np.float32))
    hot = extract_features(module_array("hotspot").astype(np.float32))
    assert hot["contrast_max"] > normal["contrast_max"] + 40
    assert hot["n_hot"] == 1 and normal["n_hot"] == 0


def test_diode_pattern_shows_in_column_thirds():
    f = extract_features(module_array("diode").astype(np.float32))
    assert f["col_third_range"] > 15
    assert f["col_third_range"] > 3 * abs(f["row_third_range"])


def test_explain_has_technician_fields():
    e = explain(module_array("hotspot").astype(np.float32))
    assert e["hotspot_count"] == 1
    assert set(e) >= {"hot_area_pct", "peak_contrast", "warm_area_pct", "warmest_third_delta", "module_median"}


def test_catalog_is_consistent():
    assert NORMAL in CLASSES and len(CLASSES) == 12
    for c in CLASSES.values():
        assert 0.0 <= c.loss_fraction <= 1.0
        assert c.action
        assert c.priority in PRIORITY_SLA_DAYS or c.name == NORMAL
    assert {"Offline-Module", "Diode-Multi", "Diode"} <= set(CRITICAL)
    assert NORMAL not in CRITICAL


def test_normal_module_costs_nothing():
    a = assess(NORMAL, False, Settings())
    assert (a.priority, a.est_loss_w, a.est_krw_year) == ("-", 0.0, 0.0)


def test_diode_economics():
    s = Settings()
    a = assess("Diode", True, s)
    assert a.priority == "P2"
    assert a.est_loss_w == pytest.approx(0.33 * s.module_power_w)
    assert a.est_kwh_year == pytest.approx(a.est_loss_w / 1000 * s.specific_yield_kwh_per_kwp, abs=0.1)
    assert a.est_krw_year == pytest.approx(a.est_kwh_year * s.tariff_krw_per_kwh, rel=1e-3)


@pytest.mark.parametrize(
    "cls,delta_t,expected",
    [("Soiling", 12.0, "P2"), ("Cell", 25.0, "P1"), ("Cell", 5.0, "P3"), ("Offline-Module", 30.0, "P1"),
     ("Diode", 12.0, "P2")],
)
def test_delta_t_escalation(cls, delta_t, expected):
    a = assess(cls, True, Settings(), delta_t_c=delta_t)
    assert a.priority == expected
    assert bool(a.escalated_by) == (expected != CLASSES[cls].priority)
