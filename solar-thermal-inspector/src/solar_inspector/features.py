"""Hand-crafted thermal features of one module crop.

They feed the interpretable baselines (rule, gradient boosting, isolation forest) and the
explanation shown next to every finding in the dashboard. Each one maps to something an
inspector looks for: how hot is the hottest region, how big is it, is a whole third of the
module warm (bypass diode), is the whole module warm (offline), is warmth at the edge (vegetation).
"""

from __future__ import annotations

import numpy as np

from .imaging import robust_scale, segment_hotspots

FEATURE_NAMES = [
    "median", "mean", "std", "p05", "p95", "p99", "max", "iqr",
    "contrast_p99", "contrast_max", "cold_p01", "skew",
    "hot_frac", "n_hot", "largest_hot_frac", "largest_hot_elong", "largest_hot_fill", "cold_frac",
    "warm10_frac", "col_third_max", "col_third_range", "row_third_max", "row_third_range",
    "top_bottom", "left_right", "border_center", "grad_mean", "lap_var",
    "row_profile_range", "col_profile_range",
]


def _bands(px: np.ndarray, axis: int, med: float) -> np.ndarray:
    """Median of three equal bands along `axis`, relative to the module median."""
    parts = np.array_split(px, 3, axis=axis)
    return np.array([np.median(p) - med for p in parts], dtype=np.float32)


def extract_features(px: np.ndarray) -> dict[str, float]:
    px = px.astype(np.float32)
    med, scale = robust_scale(px)
    p01, p05, p25, p75, p95, p99 = np.percentile(px, [1, 5, 25, 75, 95, 99])
    std = float(px.std())
    mask, spots = segment_hotspots(px)
    cold = ((px - med) / scale < -3.5) & (med - px > 8.0)
    n = px.size

    largest = spots[0] if spots else None
    if largest:
        r0, c0, r1, c1 = largest.bbox
        bh, bw = r1 - r0 + 1, c1 - c0 + 1
        elong = max(bh, bw) / min(bh, bw)
        fill = largest.area_px / (bh * bw)
    else:
        elong, fill = 0.0, 0.0

    cols, rows = _bands(px, 1, med), _bands(px, 0, med)
    h, w = px.shape
    border = np.concatenate([px[:2].ravel(), px[-2:].ravel(), px[2:-2, :2].ravel(), px[2:-2, -2:].ravel()])
    gy, gx = np.gradient(px)
    lap = px[1:-1, 1:-1] * -4 + px[:-2, 1:-1] + px[2:, 1:-1] + px[1:-1, :-2] + px[1:-1, 2:]
    row_means, col_means = px.mean(axis=1), px.mean(axis=0)

    feats = {
        "median": med,
        "mean": float(px.mean()),
        "std": std,
        "p05": float(p05),
        "p95": float(p95),
        "p99": float(p99),
        "max": float(px.max()),
        "iqr": float(p75 - p25),
        "contrast_p99": float(p99 - med),
        "contrast_max": float(px.max() - med),
        "cold_p01": float(med - p01),
        "skew": float((px.mean() - med) / (std + 1e-6)),
        "hot_frac": float(mask.sum() / n),
        "n_hot": float(len(spots)),
        "largest_hot_frac": float(largest.area_px / n) if largest else 0.0,
        "largest_hot_elong": float(elong),
        "largest_hot_fill": float(fill),
        "cold_frac": float(cold.sum() / n),
        "warm10_frac": float((px > med + 10).mean()),
        "col_third_max": float(cols.max()),
        "col_third_range": float(cols.max() - cols.min()),
        "row_third_max": float(rows.max()),
        "row_third_range": float(rows.max() - rows.min()),
        "top_bottom": float(np.median(px[: h // 2]) - np.median(px[h // 2 :])),
        "left_right": float(np.median(px[:, : w // 2]) - np.median(px[:, w // 2 :])),
        "border_center": float(np.median(border) - np.median(px[2:-2, 2:-2])),
        "grad_mean": float(np.hypot(gx, gy).mean()),
        "lap_var": float(lap.var()),
        "row_profile_range": float(row_means.max() - row_means.min()),
        "col_profile_range": float(col_means.max() - col_means.min()),
    }
    return feats


def feature_vector(px: np.ndarray) -> np.ndarray:
    f = extract_features(px)
    return np.array([f[k] for k in FEATURE_NAMES], dtype=np.float32)


def explain(px: np.ndarray) -> dict[str, float | int]:
    """The few numbers shown to a technician next to a finding."""
    f = extract_features(px)
    return {
        "hotspot_count": int(f["n_hot"]),
        "hot_area_pct": round(100 * f["hot_frac"], 1),
        "peak_contrast": round(f["contrast_max"], 1),
        "warm_area_pct": round(100 * f["warm10_frac"], 1),
        "warmest_third_delta": round(max(f["col_third_max"], f["row_third_max"]), 1),
        "module_median": round(f["median"], 1),
    }
