import io
import zipfile
from dataclasses import replace

import pytest

from solar_inspector.api import _cell
from solar_inspector.config import Settings
from solar_inspector.services import UploadError, collect_files, parse_layout
from tests.conftest import module_array, png_bytes


def make_zip(entries: dict[str, bytes]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, data in entries.items():
            zf.writestr(name, data)
    return buf.getvalue()


def test_zip_is_flattened_safely_and_layout_picked_up():
    img = png_bytes(module_array())
    z = make_zip({
        "flight/a.png": img,
        "../../etc/evil.png": img,  # traversal attempt: only the base name survives
        "__MACOSX/._a.png": b"junk",
        "flight/.hidden.png": img,
        "layout.csv": b"filename,block,row,position,label\na.png,A,R01,03,Cell\n",
    })
    batch = collect_files([("survey.zip", z)], Settings())
    assert sorted(n for n, _ in batch.files) == ["a.png", "evil.png"]
    assert batch.layout["a.png"].block == "A" and batch.layout["a.png"].label == "Cell"


def test_upload_size_limits():
    s = replace(Settings(), max_upload_mb=0.001)  # ~1 KB
    with pytest.raises(UploadError):
        collect_files([("big.zip", make_zip({"a.png": bytes(5000)}))], s)


def test_file_count_limit():
    s = replace(Settings(), max_files=2)
    img = png_bytes(module_array())
    with pytest.raises(UploadError):
        collect_files([(f"{k}.png", img) for k in range(3)], s)


def test_bad_zip_rejected():
    with pytest.raises(UploadError):
        collect_files([("broken.zip", b"PK not really")], Settings())


def test_layout_validation():
    with pytest.raises(UploadError):
        parse_layout(b"name,block\na.png,A\n")
    with pytest.raises(UploadError):
        parse_layout(b"filename,label\na.png,Hot-Dog\n")
    layout = parse_layout(b"\xef\xbb\xbffilename,block\nsub/dir/b.png,B\n")  # BOM + path in name
    assert layout["b.png"].block == "B"


@pytest.mark.parametrize("value,expected", [("=HYPERLINK(1)", "'=HYPERLINK(1)"), ("+1", "'+1"), ("a.png", "a.png"),
                                            (12.5, "12.5")])
def test_csv_cells_neutralise_formulas(value, expected):
    assert _cell(value) == expected
