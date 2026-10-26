"""Thermal image I/O and processing: decode, normalise, segment hot regions, render false colour.

Two kinds of input are accepted:
- 8-bit (or 16-bit) IR images (JPG/PNG/TIFF/BMP): pixel value = relative temperature. This is what the
  InfraredSolarModules dataset and most drone exports give you.
- Radiometric temperature matrices in degrees C (.csv as exported by FLIR Thermal Studio or similar, or
  .npy). These also give an absolute temperature rise (delta T in C), which is how inspectors grade severity.
"""

from __future__ import annotations

import io
from collections import deque
from dataclasses import dataclass, field

import numpy as np
from PIL import Image

# The model's input geometry: InfraredSolarModules crops are 24 px wide and 40 px tall (portrait).
MODEL_W, MODEL_H = 24, 40
NORMAL_MEDIAN = 155.0  # median intensity of a nominal module in the training data (see reports/eda.md)
MAX_PIXELS = 4096 * 4096
Image.MAX_IMAGE_PIXELS = MAX_PIXELS  # Pillow raises on larger images (decompression-bomb guard)

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
RADIOMETRIC_EXT = {".csv", ".npy"}
SUPPORTED_EXT = IMAGE_EXT | RADIOMETRIC_EXT


class ImageError(ValueError):
    """The file can't be decoded as a thermal image."""


@dataclass
class ThermalImage:
    pixels: np.ndarray  # float32, MODEL_H x MODEL_W, 0-255 intensity domain the model was trained on
    radiometric: bool = False
    temperature_c: np.ndarray | None = None  # full-resolution degrees C (radiometric input only)
    original_size: tuple[int, int] = (MODEL_W, MODEL_H)  # (width, height)
    warnings: list[str] = field(default_factory=list)


def _ext(filename: str) -> str:
    name = filename.lower()
    dot = name.rfind(".")
    return name[dot:] if dot >= 0 else ""


def _to_model_size(arr: np.ndarray) -> np.ndarray:
    """Rotate landscape crops to portrait, then resize to the model grid (bilinear)."""
    if arr.shape[1] > arr.shape[0]:
        arr = np.rot90(arr)
    if arr.shape != (MODEL_H, MODEL_W):
        img = Image.fromarray(np.ascontiguousarray(arr, dtype=np.float32), mode="F")
        arr = np.asarray(img.resize((MODEL_W, MODEL_H), Image.Resampling.BILINEAR))
    return np.clip(arr, 0, 255).astype(np.float32)


def _decode_raster(data: bytes, warnings: list[str]) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except Image.DecompressionBombError as exc:
        raise ImageError("image is too large") from exc
    except Exception as exc:  # Pillow raises many types for corrupt files
        raise ImageError("not a readable image") from exc
    if img.mode in ("RGB", "RGBA", "P"):
        rgb = np.asarray(img.convert("RGB"), dtype=np.int16)
        if np.abs(rgb[..., 0] - rgb[..., 2]).mean() > 8:
            # A colour palette (ironbow, rainbow...) is not monotonic in luminance, so grey is only approximate.
            warnings.append("colour-palette image: converted to grey, export greyscale for reliable results")
        return np.asarray(img.convert("L"), dtype=np.float32)
    arr = np.asarray(img, dtype=np.float32)
    if arr.ndim != 2:
        arr = np.asarray(img.convert("L"), dtype=np.float32)
    if arr.max() > 255:  # 16-bit counts: stretch into the 8-bit range
        lo, hi = float(arr.min()), float(arr.max())
        arr = (arr - lo) / max(hi - lo, 1e-6) * 255.0
        warnings.append("16-bit image stretched to 8-bit")
    return arr


def _decode_matrix(data: bytes, ext: str) -> np.ndarray:
    try:
        if ext == ".npy":
            arr = np.load(io.BytesIO(data), allow_pickle=False)
        else:
            text = data.decode("utf-8-sig")
            delimiter = ";" if text.count(";") > text.count(",") else ","
            arr = np.loadtxt(io.StringIO(text), delimiter=delimiter, dtype=np.float32, ndmin=2)
    except Exception as exc:
        raise ImageError("not a readable temperature matrix") from exc
    arr = np.asarray(arr, dtype=np.float32)
    if arr.ndim != 2 or min(arr.shape) < 4 or arr.size > MAX_PIXELS:
        raise ImageError("temperature matrix must be 2-D and at least 4x4")
    if not np.isfinite(arr).all() or arr.min() < -50 or arr.max() > 250:
        raise ImageError("temperatures must be finite degrees C between -50 and 250")
    return arr


def load_thermal(data: bytes, filename: str, radiometric_gain: float = 4.0) -> ThermalImage:
    """Decode an uploaded file into the model's input grid.

    `radiometric_gain` maps 1 C above the module median to this many intensity units. It is an
    uncalibrated bridge between a radiometric camera and a model trained on 8-bit crops, so
    radiometric results are flagged for review.
    """
    ext = _ext(filename)
    if ext not in SUPPORTED_EXT:
        raise ImageError(f"unsupported file type {ext or '(none)'}")
    warnings: list[str] = []
    if ext in RADIOMETRIC_EXT:
        temp = _decode_matrix(data, ext)
        med = float(np.median(temp))
        intensity = NORMAL_MEDIAN + (temp - med) * radiometric_gain
        warnings.append("radiometric input: classifier is uncalibrated for this camera, verify on site")
        return ThermalImage(
            pixels=_to_model_size(intensity),
            radiometric=True,
            temperature_c=temp,
            original_size=(temp.shape[1], temp.shape[0]),
            warnings=warnings,
        )
    arr = _decode_raster(data, warnings)
    if arr.size > 0 and float(arr.max() - arr.min()) < 3:
        warnings.append("almost no thermal contrast: check camera focus and exposure")
    return ThermalImage(
        pixels=_to_model_size(arr),
        original_size=(arr.shape[1], arr.shape[0]),
        warnings=warnings,
    )


# --------------------------------------------------------------------------- segmentation


def robust_scale(px: np.ndarray, floor: float = 2.0) -> tuple[float, float]:
    """Median and a MAD-based spread (floored so flat modules don't explode the z-score)."""
    med = float(np.median(px))
    mad = float(np.median(np.abs(px - med))) * 1.4826
    return med, max(mad, floor)


def label_components(mask: np.ndarray) -> list[list[tuple[int, int]]]:
    """4-connected components of a boolean mask (BFS). Small grids, so plain Python is fast enough."""
    seen = np.zeros_like(mask, dtype=bool)
    h, w = mask.shape
    comps: list[list[tuple[int, int]]] = []
    for r, c in np.argwhere(mask):
        if seen[r, c]:
            continue
        seen[r, c] = True
        queue, comp = deque([(int(r), int(c))]), []
        while queue:
            y, x = queue.popleft()
            comp.append((y, x))
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))
        comps.append(comp)
    return comps


@dataclass
class Hotspot:
    area_px: int
    bbox: tuple[int, int, int, int]  # (row0, col0, row1, col1) inclusive
    peak_delta: float  # peak above the module median, in input units
    mean_delta: float


def segment_hotspots(
    px: np.ndarray, z_thresh: float = 3.5, min_delta: float = 8.0, min_area: int = 1
) -> tuple[np.ndarray, list[Hotspot]]:
    """Hot pixels = robust z-score above `z_thresh` AND at least `min_delta` above the module median."""
    med, scale = robust_scale(px)
    delta = px - med
    mask = (delta / scale > z_thresh) & (delta > min_delta)
    spots = []
    for comp in label_components(mask):
        if len(comp) < min_area:
            continue
        rows = [p[0] for p in comp]
        cols = [p[1] for p in comp]
        vals = delta[rows, cols]
        spots.append(
            Hotspot(len(comp), (min(rows), min(cols), max(rows), max(cols)), float(vals.max()), float(vals.mean()))
        )
    spots.sort(key=lambda s: s.area_px, reverse=True)
    return mask, spots


def radiometric_summary(temp_c: np.ndarray, hot_delta_c: float = 3.0) -> dict[str, float]:
    """Absolute temperatures for radiometric input. delta T = T_max - T_median of the module."""
    med = float(np.median(temp_c))
    return {
        "t_median_c": round(med, 2),
        "t_max_c": round(float(temp_c.max()), 2),
        "delta_t_c": round(float(temp_c.max()) - med, 2),
        "hot_area_frac_c": round(float((temp_c - med > hot_delta_c).mean()), 4),
    }


# --------------------------------------------------------------------------- rendering

# Inferno-like palette anchors (dark = cool, bright = hot), interpolated to a 256-entry LUT.
_ANCHORS = np.array(
    [[0, 0, 4], [40, 11, 84], [101, 21, 110], [159, 42, 99], [212, 72, 66], [245, 125, 21], [250, 193, 39],
     [252, 255, 164]],
    dtype=np.float32,
)
_LUT = np.stack(
    [np.interp(np.linspace(0, 1, 256), np.linspace(0, 1, len(_ANCHORS)), _ANCHORS[:, i]) for i in range(3)], axis=1
).astype(np.uint8)


def _stretch(px: np.ndarray) -> np.ndarray:
    lo, hi = np.percentile(px, 1), np.percentile(px, 99.5)
    return np.clip((px - lo) / max(hi - lo, 1e-6), 0, 1)


def render_png(px: np.ndarray, view: str = "thermal", scale: int = 8) -> bytes:
    """PNG for the dashboard: 'thermal' false colour, 'overlay' grey with hot pixels marked, 'raw' grey."""
    norm = _stretch(px)
    if view == "thermal":
        rgb = _LUT[(norm * 255).astype(np.uint8)]
    else:
        grey = (norm * 255).astype(np.uint8)
        rgb = np.stack([grey] * 3, axis=-1)
        if view == "overlay":
            mask, _ = segment_hotspots(px)
            rgb[mask] = (0.35 * rgb[mask] + 0.65 * np.array([0, 229, 255])).astype(np.uint8)
    img = Image.fromarray(rgb, "RGB").resize((px.shape[1] * scale, px.shape[0] * scale), Image.Resampling.NEAREST)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def to_model_tensor(pixels: np.ndarray) -> np.ndarray:
    """(1, 1, H, W) float32 in [0, 1]. The ONNX graph applies its own mean/std normalisation."""
    return (pixels.astype(np.float32) / 255.0)[None, None]
