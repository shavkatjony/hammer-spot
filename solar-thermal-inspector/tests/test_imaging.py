import io

import numpy as np
import pytest
from PIL import Image

from solar_inspector.imaging import (
    MODEL_H,
    MODEL_W,
    ImageError,
    label_components,
    load_thermal,
    radiometric_summary,
    render_png,
    segment_hotspots,
)
from tests.conftest import module_array, png_bytes


def test_png_module_loads_at_model_size():
    img = load_thermal(png_bytes(module_array()), "m.png")
    assert img.pixels.shape == (MODEL_H, MODEL_W)
    assert img.pixels.dtype == np.float32
    assert not img.radiometric and img.warnings == []


def test_landscape_crop_is_rotated_and_resized():
    arr = np.full((48, 80), 150, dtype=np.uint8)  # landscape, twice the model size
    img = load_thermal(png_bytes(arr), "wide.png")
    assert img.pixels.shape == (MODEL_H, MODEL_W)
    assert img.original_size == (80, 48)


def test_colour_palette_image_warns():
    rgb = np.zeros((40, 24, 3), dtype=np.uint8)
    rgb[..., 0], rgb[..., 2] = 200, 30  # red-ish "ironbow" style
    buf = io.BytesIO()
    Image.fromarray(rgb, "RGB").save(buf, format="PNG")
    img = load_thermal(buf.getvalue(), "palette.png")
    assert any("palette" in w for w in img.warnings)


def test_16bit_tiff_is_stretched():
    arr = (np.linspace(1000, 30000, 40 * 24).reshape(40, 24)).astype(np.uint16)
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="TIFF")
    img = load_thermal(buf.getvalue(), "raw.tiff")
    assert img.pixels.max() <= 255 and img.pixels.min() >= 0
    assert any("16-bit" in w for w in img.warnings)


@pytest.mark.parametrize("sep", [",", ";"])
def test_radiometric_csv(sep):
    t = np.full((40, 24), 45.0)
    t[10:13, 5:8] = 70.0  # a 25 C hot spot
    text = "\n".join(sep.join(f"{v:.1f}" for v in row) for row in t)
    img = load_thermal(text.encode(), "frame.csv")
    assert img.radiometric and img.temperature_c is not None
    s = radiometric_summary(img.temperature_c)
    assert s["delta_t_c"] == pytest.approx(25.0)
    assert s["t_max_c"] == pytest.approx(70.0)
    assert any("radiometric" in w for w in img.warnings)


def test_radiometric_npy():
    buf = io.BytesIO()
    np.save(buf, np.full((60, 40), 30.0, dtype=np.float32))
    img = load_thermal(buf.getvalue(), "frame.npy")
    assert img.radiometric and img.pixels.shape == (MODEL_H, MODEL_W)


@pytest.mark.parametrize(
    "data,name",
    [
        (b"not an image", "x.png"),
        (b"hello", "x.txt"),
        (b"1,2\n3,4", "tiny.csv"),  # smaller than 4 x 4
        ("\n".join(",".join(["400"] * 8) for _ in range(8)).encode(), "hot.csv"),  # 400 C: out of range
        (b"", "noext"),
    ],
)
def test_bad_inputs_raise(data, name):
    with pytest.raises(ImageError):
        load_thermal(data, name)


def test_npy_with_pickle_is_rejected():
    buf = io.BytesIO()
    np.save(buf, np.array([{"a": 1}], dtype=object), allow_pickle=True)
    with pytest.raises(ImageError):
        load_thermal(buf.getvalue(), "evil.npy")


def test_segmentation_finds_one_hot_square():
    px = module_array("hotspot").astype(np.float32)
    mask, spots = segment_hotspots(px)
    assert len(spots) == 1
    assert spots[0].area_px == 9
    assert spots[0].bbox == (20, 10, 22, 12)
    assert spots[0].peak_delta > 50
    assert mask.sum() == 9


def test_uniform_module_has_no_hotspots():
    _, spots = segment_hotspots(module_array("normal").astype(np.float32))
    assert spots == []


def test_components_are_four_connected():
    mask = np.zeros((5, 5), dtype=bool)
    mask[0, 0] = mask[1, 1] = True  # diagonal neighbours: two components
    mask[3, 3] = mask[3, 4] = True  # side neighbours: one component
    sizes = sorted(len(c) for c in label_components(mask))
    assert sizes == [1, 1, 2]


@pytest.mark.parametrize("view", ["thermal", "overlay", "raw"])
def test_render_png(view):
    data = render_png(module_array("hotspot").astype(np.float32), view, scale=4)
    img = Image.open(io.BytesIO(data))
    assert img.format == "PNG" and img.size == (24 * 4, 40 * 4)
