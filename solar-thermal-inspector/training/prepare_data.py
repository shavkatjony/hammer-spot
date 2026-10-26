"""Download InfraredSolarModules, check it, remove bad duplicates and write a reproducible split.

    python training/prepare_data.py

Outputs
- data/raw/InfraredSolarModules.zip          (downloaded once, SHA-256 verified)
- data/processed/dataset.npz                 (uint8 images N x 40 x 24, labels, ids, split)
- data/splits.csv                            (image_id, label, split): committed, so the split is fixed
- data/sample/                               (30 test-split images per class for the demo and tests)
- reports/data_quality.json                  (what was removed and why)

Reads images straight from the zip; nothing from the archive is extracted to disk.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
URL = "https://raw.githubusercontent.com/RaptorMaps/InfraredSolarModules/master/2020-02-14_InfraredSolarModules.zip"
SHA256 = "b82c706bc719b045ac4f8930570d81767a8a170d0998ca3e09283b585db05b5e"
ZIP_PATH = ROOT / "data/raw/InfraredSolarModules.zip"
SEED = 42
SPLIT = {"train": 0.70, "val": 0.15, "test": 0.15}
SAMPLE_PER_CLASS = 30
SAMPLE_NORMAL = 300


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def download() -> None:
    if not ZIP_PATH.exists():
        ZIP_PATH.parent.mkdir(parents=True, exist_ok=True)
        print(f"downloading {URL}")
        urllib.request.urlretrieve(URL, ZIP_PATH)  # noqa: S310 (fixed https URL)
    digest = sha256(ZIP_PATH)
    if digest != SHA256:
        raise SystemExit(f"checksum mismatch for {ZIP_PATH}: {digest}")


def read_all() -> tuple[list[str], list[str], np.ndarray]:
    with zipfile.ZipFile(ZIP_PATH) as zf:
        meta = json.loads(zf.read("InfraredSolarModules/module_metadata.json"))
        ids = sorted(meta, key=int)
        labels = [meta[i]["anomaly_class"] for i in ids]
        images = np.empty((len(ids), 40, 24), dtype=np.uint8)
        for n, i in enumerate(ids):
            raw = zf.read("InfraredSolarModules/" + meta[i]["image_filepath"])
            img = Image.open(io.BytesIO(raw)).convert("L")
            if img.size != (24, 40):
                raise SystemExit(f"unexpected size {img.size} for image {i}")
            images[n] = np.asarray(img)
    return ids, labels, images


def stratified_split(labels: list[str], rng: np.random.Generator) -> list[str]:
    """70/15/15 split, stratified by label. Run after de-duplication, so no image appears twice."""
    by_label: dict[str, list[int]] = defaultdict(list)
    for n, lab in enumerate(labels):
        by_label[lab].append(n)
    assign = [""] * len(labels)
    for _lab, members in sorted(by_label.items()):
        members = list(members)
        rng.shuffle(members)
        n_train = round(len(members) * SPLIT["train"])
        n_val = round(len(members) * SPLIT["val"])
        for k, m in enumerate(members):
            assign[m] = "train" if k < n_train else "val" if k < n_train + n_val else "test"
    return assign


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-sample", action="store_true", help="don't rewrite data/sample")
    args = ap.parse_args()

    download()
    ids, labels, images = read_all()
    hashes = [hashlib.sha1(im.tobytes()).hexdigest() for im in images]

    groups: dict[str, list[int]] = defaultdict(list)
    for n, h in enumerate(hashes):
        groups[h].append(n)
    keep = np.ones(len(ids), dtype=bool)
    conflicting, redundant = [], []
    for members in groups.values():
        if len(members) < 2:
            continue
        labs = {labels[m] for m in members}
        if len(labs) > 1:  # same pixels, different labels: we can't know which is right, drop all
            conflicting.append([(ids[m], labels[m]) for m in members])
            keep[members] = False
        else:  # identical copies: keep the first only
            redundant.extend(ids[m] for m in members[1:])
            keep[members[1:]] = False

    idx = np.flatnonzero(keep)
    ids_k = [ids[i] for i in idx]
    labels_k = [labels[i] for i in idx]
    split = stratified_split(labels_k, np.random.default_rng(SEED))

    out = ROOT / "data/processed"
    out.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        out / "dataset.npz",
        images=images[idx],
        labels=np.array(labels_k),
        ids=np.array(ids_k),
        split=np.array(split),
    )
    with (ROOT / "data/splits.csv").open("w") as f:
        f.write("image_id,label,split\n")
        for row in zip(ids_k, labels_k, split, strict=True):
            f.write(",".join(row) + "\n")

    quality = {
        "source": URL,
        "sha256": SHA256,
        "images_in_metadata": len(ids),
        "exact_duplicate_groups": sum(1 for m in groups.values() if len(m) > 1),
        "conflicting_label_groups": len(conflicting),
        "dropped_conflicting_images": sum(len(c) for c in conflicting),
        "dropped_redundant_copies": len(redundant),
        "images_kept": len(ids_k),
        "conflicts": conflicting,
        "split_sizes": {s: split.count(s) for s in SPLIT},
        "seed": SEED,
    }
    (ROOT / "reports").mkdir(exist_ok=True)
    (ROOT / "reports/data_quality.json").write_text(json.dumps(quality, indent=2))
    print(json.dumps({k: v for k, v in quality.items() if k != "conflicts"}, indent=2))

    if not args.no_sample:
        write_sample(ids_k, labels_k, split, images[idx])


def write_sample(ids: list[str], labels: list[str], split: list[str], images: np.ndarray) -> None:
    """A small, fixed demo/test set drawn from the TEST split only (never seen in training).

    300 normal modules plus up to 30 of each fault class, so every fault type appears in the demo.
    The site layout (block / row / position) is synthetic: the dataset has no location data.
    """
    rng = np.random.default_rng(SEED)
    sample = ROOT / "data/sample"
    if (sample / "images").exists():
        for old in (sample / "images").glob("*.png"):
            old.unlink()
    (sample / "images").mkdir(parents=True, exist_ok=True)
    rows = []
    for lab in sorted(set(labels)):
        cand = [n for n, (lb, s) in enumerate(zip(labels, split, strict=True)) if lb == lab and s == "test"]
        k = SAMPLE_NORMAL if lab == "No-Anomaly" else SAMPLE_PER_CLASS
        for n in sorted(rng.choice(cand, size=min(k, len(cand)), replace=False)):
            name = f"{ids[n]}.png"  # PNG: lossless copy of the decoded pixels
            Image.fromarray(images[n]).save(sample / "images" / name)
            rows.append((name, lab))
    slots = rng.permutation(len(rows))  # synthetic layout: 4 blocks x 8 rows x up to 20 modules
    with (sample / "layout.csv").open("w") as f:
        f.write("filename,block,row,position,label\n")
        for (name, lab), slot in sorted(zip(rows, slots, strict=True), key=lambda r: r[1]):
            block, rest = divmod(int(slot), 160)
            row, pos = divmod(rest, 20)
            f.write(f"{name},{'ABCD'[block]},R{row + 1:02d},{pos + 1:02d},{lab}\n")
    print(f"sample: {len(rows)} images in {sample}")


if __name__ == "__main__":
    main()
