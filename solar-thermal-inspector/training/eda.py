"""Exploratory analysis of the cleaned dataset -> reports/eda.md + reports/figures/eda_*.png

    python training/eda.py
"""

from __future__ import annotations

import json

import numpy as np
from sklearn.metrics import roc_auc_score

from common import CLASS_NAMES, CLASSES, FIG, NORMAL, ROOT, feature_matrix, load_dataset
from plotstyle import BLUES, INK2, SERIES, STATUS, plt
from solar_inspector.features import FEATURE_NAMES
from solar_inspector.imaging import _LUT


def order_by_count(y: np.ndarray) -> list[int]:
    counts = np.bincount(y, minlength=len(CLASS_NAMES))
    return list(np.argsort(-counts))


def fig_class_counts(y: np.ndarray, order: list[int]) -> None:
    counts = np.bincount(y, minlength=len(CLASS_NAMES))
    fig, ax = plt.subplots(figsize=(7.5, 3.8))
    names = [CLASS_NAMES[i] for i in order][::-1]
    vals = [counts[i] for i in order][::-1]
    colors = [STATUS.get(CLASSES[n].priority, STATUS["OK"]) for n in names]
    ax.barh(names, vals, color=colors, height=0.7)
    for k, v in enumerate(vals):
        ax.text(v + 80, k, f"{v:,}", va="center", color=INK2, fontsize=8.5)
    ax.set_xlim(0, max(vals) * 1.12)
    ax.grid(axis="y", visible=False)
    ax.set_title("Images per class (after cleaning). Bar colour = O&M priority")
    handles = [plt.Rectangle((0, 0), 1, 1, color=STATUS[p]) for p in ("P1", "P2", "P3", "OK")]
    ax.legend(handles, ["P1 urgent", "P2 soon", "P3 scheduled", "Normal"], loc="lower right")
    fig.savefig(FIG / "eda_class_counts.png")
    plt.close(fig)


def false_colour(im: np.ndarray) -> np.ndarray:
    lo, hi = np.percentile(im, 1), np.percentile(im, 99.5)
    return _LUT[(np.clip((im - lo) / max(hi - lo, 1e-6), 0, 1) * 255).astype(np.uint8)]


def fig_examples(X: np.ndarray, y: np.ndarray, order: list[int], rng: np.random.Generator) -> None:
    k = 8
    fig, axes = plt.subplots(len(order), k, figsize=(k * 0.8 + 1.2, len(order) * 1.25), layout="compressed")
    for r, c in enumerate(order):
        idx = rng.choice(np.flatnonzero(y == c), size=k, replace=False)
        for j, i in enumerate(idx):
            ax = axes[r, j]
            ax.imshow(false_colour(X[i].astype(np.float32)), interpolation="nearest")
            ax.set_xticks([]), ax.set_yticks([])
            for s in ax.spines.values():
                s.set_visible(False)
        axes[r, 0].set_ylabel(CLASS_NAMES[c], rotation=0, ha="right", va="center", fontsize=8.5, color=INK2)
    fig.suptitle("Random examples per class (false colour, each image on its own range)", fontsize=10.5)
    fig.savefig(FIG / "eda_examples.png")
    plt.close(fig)


def fig_mean_images(X: np.ndarray, y: np.ndarray, order: list[int]) -> None:
    """Average image per class, on ONE shared scale: shows where each fault puts its heat."""
    means = [X[y == c].astype(np.float32).mean(axis=0) for c in order]
    lo, hi = min(m.min() for m in means), max(m.max() for m in means)
    fig, axes = plt.subplots(1, len(order), figsize=(len(order) * 0.95 + 0.8, 2.4), layout="compressed")
    for ax, c, m in zip(axes, order, means, strict=True):
        im = ax.imshow(m, cmap="inferno", vmin=lo, vmax=hi, interpolation="nearest")
        ax.set_title(CLASS_NAMES[c].replace("-", "-\n", 1), fontsize=7.5, loc="center", fontweight="normal")
        ax.set_xticks([]), ax.set_yticks([])
        ax.grid(False)
    cb = fig.colorbar(im, ax=axes, fraction=0.012, pad=0.01)
    cb.set_label("mean pixel (0-255)", fontsize=8)
    fig.suptitle("Mean image per class, shared scale", fontsize=10.5)
    fig.savefig(FIG / "eda_mean_images.png")
    plt.close(fig)


def fig_feature_boxes(F: np.ndarray, y: np.ndarray, order: list[int]) -> None:
    show = [("median", "Module median (absolute level)"), ("contrast_max", "Peak above module median"),
            ("warm10_frac", "Share of pixels > median + 10"), ("col_third_range", "Warmest minus coolest third")]
    fig, axes = plt.subplots(1, len(show), figsize=(13, 4.2), sharey=True)
    names = [CLASS_NAMES[c] for c in order]
    for ax, (feat, title) in zip(axes, show, strict=True):
        j = FEATURE_NAMES.index(feat)
        data = [F[y == c, j] for c in order]
        bp = ax.boxplot(data, orientation="horizontal", widths=0.6, showfliers=False, patch_artist=True,
                        medianprops={"color": "#0b0b0b", "linewidth": 1.2})
        for patch in bp["boxes"]:
            patch.set(facecolor="#cde2fb", edgecolor=SERIES[0], linewidth=1)
        for part in ("whiskers", "caps"):
            for line in bp[part]:
                line.set(color=SERIES[0], linewidth=1)
        ax.set_title(title, fontsize=9.5)
        ax.grid(axis="y", visible=False)
    axes[0].set_yticks(range(1, len(names) + 1), names)
    axes[0].invert_yaxis()
    fig.suptitle("Hand-crafted thermal features by class (box = IQR, whiskers = 1.5 IQR)", x=0.02, ha="left")
    fig.savefig(FIG / "eda_features.png")
    plt.close(fig)


def fig_correlation(F: np.ndarray) -> None:
    corr = np.corrcoef(F, rowvar=False)
    fig, ax = plt.subplots(figsize=(7.5, 6.5))
    ax.imshow(np.abs(corr), cmap=BLUES, vmin=0, vmax=1)
    ax.set_xticks(range(len(FEATURE_NAMES)), FEATURE_NAMES, rotation=90, fontsize=7)
    ax.set_yticks(range(len(FEATURE_NAMES)), FEATURE_NAMES, fontsize=7)
    ax.grid(False)
    ax.set_title("|Pearson correlation| between features")
    fig.savefig(FIG / "eda_feature_corr.png")
    plt.close(fig)


def main() -> None:
    FIG.mkdir(parents=True, exist_ok=True)
    d = load_dataset()
    X, y, split = d["X"], d["y"], d["split"]
    F = feature_matrix(X)
    rng = np.random.default_rng(7)
    order = order_by_count(y)

    fig_class_counts(y, order)
    fig_examples(X, y, order, rng)
    fig_mean_images(X, y, order)
    fig_feature_boxes(F, y, order)
    fig_correlation(F)

    quality = json.loads((ROOT / "reports/data_quality.json").read_text())
    normal = CLASS_NAMES.index(NORMAL)
    rows = []
    for c in order:
        m = y == c
        j = {k: FEATURE_NAMES.index(k) for k in ("median", "contrast_max", "warm10_frac", "n_hot")}
        rows.append((
            CLASS_NAMES[c], int(m.sum()),
            *(int((m & (split == s)).sum()) for s in ("train", "val", "test")),
            float(np.median(F[m, j["median"]])), float(np.median(F[m, j["contrast_max"]])),
            float(np.median(F[m, j["warm10_frac"]]) * 100), float(np.mean(F[m, j["n_hot"]] > 0) * 100),
        ))

    # how separable is "anomaly vs normal" with a single feature? (tie-aware ROC-AUC, no fitting;
    # ids are grouped by class in the source, so rank ties must never be broken by row order)
    pos = y != normal
    aucs = [roc_auc_score(pos, F[:, k]) for k in range(len(FEATURE_NAMES))]
    single = sorted(((max(a, 1 - a), n, a < 0.5) for a, n in zip(aucs, FEATURE_NAMES, strict=True)),
                    reverse=True)[:8]

    hottest = X.reshape(len(X), -1).argmax(axis=1)
    hot_rows = hottest // X.shape[2]
    loc = [(CLASS_NAMES[c], float(np.mean(hot_rows[y == c] >= 30) * 100), float(np.mean(hot_rows[y == c] < 10) * 100))
           for c in order]

    lines = [
        "# Exploratory data analysis: InfraredSolarModules",
        "",
        "Generated by `python training/eda.py` from the cleaned dataset (`training/prepare_data.py`).",
        "",
        "## Data quality",
        "",
        f"- Images in metadata: **{quality['images_in_metadata']:,}**, all 24 x 40 px, 8-bit greyscale.",
        f"- Exact pixel duplicates: **{quality['exact_duplicate_groups']} groups**. "
        f"**{quality['conflicting_label_groups']}** of them carry *different* labels for identical pixels "
        f"(dropped: {quality['dropped_conflicting_images']} images). "
        f"The other {quality['dropped_redundant_copies']} redundant copies were dropped so no image sits in "
        "both train and test.",
        f"- Kept: **{quality['images_kept']:,}** images. Split 70/15/15 stratified by class (seed "
        f"{quality['seed']}): train {quality['split_sizes']['train']:,}, val {quality['split_sizes']['val']:,}, "
        f"test {quality['split_sizes']['test']:,}.",
        "- The class counts in the dataset README differ from `module_metadata.json` by 1-2 images in five "
        "classes; this project uses the JSON.",
        "- Conflicting-label pairs (image id, label): "
        + "; ".join(" / ".join(f"{i} {lab}" for i, lab in grp) for grp in quality["conflicts"]) + ".",
        "",
        "## Class balance",
        "",
        "Half the images are normal modules. Among the anomalies, three classes have fewer than 260 images "
        "(Hot-Spot, Hot-Spot-Multi, Soiling) and Diode-Multi has 175, so per-class metrics on those are noisy "
        "(about 26-38 test images each).",
        "",
        "![class counts](figures/eda_class_counts.png)",
        "",
        "| Class | Images | Train | Val | Test | Median module level | Peak above median | Pixels > median+10 "
        "(%) | Has a hot spot (%) |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
        *(f"| {r[0]} | {r[1]:,} | {r[2]:,} | {r[3]:,} | {r[4]:,} | {r[5]:.0f} | {r[6]:.0f} | {r[7]:.1f} | "
          f"{r[8]:.0f} |" for r in rows),
        "",
        "## What the images show",
        "",
        "![examples](figures/eda_examples.png)",
        "",
        "Averaging each class on one shared colour scale separates the *whole-module* faults from the *local* "
        "ones. Hot-Spot-Multi, Diode-Multi and Offline-Module are warmer across the whole module, Diode shows "
        "faint vertical bands (the bypassed substring sits in a different third in each image), Shadowing is "
        "cooler than normal, and single-cell faults average out because the hot cell moves from image to image.",
        "",
        "![mean images](figures/eda_mean_images.png)",
        "",
        "Where is the hottest pixel? For **Vegetation** it is in the bottom quarter of the module in "
        f"{dict((n, b) for n, b, _ in loc)['Vegetation']:.0f}% of images, against "
        f"{dict((n, b) for n, b, _ in loc)[NORMAL]:.0f}% for normal modules: plants shade the lowest cells, "
        "which then heat up. Single-cell hot spots show the same bias.",
        "",
        "| Class | Hottest pixel in bottom quarter (%) | in top quarter (%) |",
        "|---|---:|---:|",
        *(f"| {n} | {b:.0f} | {t:.0f} |" for n, b, t in loc),
        "",
        "## Features",
        "",
        "Thirty hand-crafted features (`src/solar_inspector/features.py`) describe level, contrast, hot-region "
        "size and shape, and where on the module the heat sits (thirds, halves, border).",
        "",
        "![features](figures/eda_features.png)",
        "",
        "Best single features for *anomaly vs normal* (ROC-AUC of the raw feature, no model):",
        "",
        "| Feature | AUC | Direction |",
        "|---|---:|---|",
        *(f"| `{n}` | {a:.3f} | {'lower = anomaly' if neg else 'higher = anomaly'} |" for a, n, neg in single),
        "",
        "The best single feature (peak contrast) reaches about 0.84 AUC: useful, but far from enough to send "
        "technicians on, which is why the features are combined in a model. Many features are strongly "
        "correlated (percentiles, contrast measures); that matters for linear models, not for the tree "
        "ensemble used as the feature baseline.",
        "",
        "![correlation](figures/eda_feature_corr.png)",
        "",
        "## Implications for modelling",
        "",
        "1. **Absolute level matters.** Offline-Module and Diode-Multi modules are warmer overall, not locally. "
        "Per-image normalisation would erase that signal, so the CNN sees raw 0-255 values. The catch: absolute "
        "level depends on how each flight's camera scaled temperature to 8 bits. In production, compare each "
        "module against its neighbours on the same flight (the API reports `delta_vs_batch` for this).",
        "2. **Imbalance.** Train with class weights, and report macro-F1 and per-class recall, not just accuracy.",
        "3. **Flip symmetry.** A module flipped left-right or upside-down is the same fault, so flips are safe "
        "augmentation. Rotations are not (a diode third would turn into a horizontal band).",
        "4. **Small rare classes.** Treat per-class numbers for the four smallest classes as indicative.",
        "",
    ]
    (ROOT / "reports/eda.md").write_text("\n".join(lines))
    print("wrote reports/eda.md")


if __name__ == "__main__":
    main()
