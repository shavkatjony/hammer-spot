"""Train the production model: a small CNN on raw 40 x 24 IR crops, exported to ONNX.

    python training/train_cnn.py            # ~10 min on 4 CPU cores

Choices (see reports/evaluation.md for the evidence):
- Raw 0-255 levels, not per-image normalisation: whole-module faults (Offline, Diode-Multi) are
  about the absolute level, so normalising each image would erase them.
- Flip augmentation only (a flipped module is the same fault; a rotated one is not), plus mild noise.
- Class-weighted loss (inverse square-root frequency) so rare classes count without over-correcting.
- Best epoch picked on validation macro-F1; the test split is never touched here.
- Exported with normalisation and softmax inside the graph, so the API only needs onnxruntime.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import numpy as np
import torch
from sklearn.metrics import f1_score
from torch import nn

from common import CLASS_NAMES, ROOT, SEED, load_dataset, write_json

MEAN, STD = 0.62, 0.156  # training pixels / 255 (printed at the start of every run as a check)


class ThermalCNN(nn.Module):
    def __init__(self, n_classes: int, width: int = 32, dropout: float = 0.3):
        super().__init__()

        def block(cin: int, cout: int) -> nn.Sequential:
            return nn.Sequential(
                nn.Conv2d(cin, cout, 3, padding=1, bias=False), nn.BatchNorm2d(cout), nn.ReLU(inplace=True),
                nn.Conv2d(cout, cout, 3, padding=1, bias=False), nn.BatchNorm2d(cout), nn.ReLU(inplace=True),
                nn.MaxPool2d(2),
            )

        self.features = nn.Sequential(block(1, width), block(width, width * 2), block(width * 2, width * 4))
        self.head = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Dropout(dropout),
                                  nn.Linear(width * 4, n_classes))

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # x: (N, 1, 40, 24), already normalised
        return self.head(self.features(x))


class Deployable(nn.Module):
    """What gets exported: [0, 1] pixels in, calibrated class probabilities out (flip TTA optional)."""

    def __init__(self, net: nn.Module, tta: bool, temperature: float = 1.0):
        super().__init__()
        self.net, self.tta, self.temperature = net, tta, temperature

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = (x - MEAN) / STD
        if not self.tta:
            return torch.softmax(self.net(x) / self.temperature, dim=1)
        views = [x, torch.flip(x, [3]), torch.flip(x, [2]), torch.flip(x, [2, 3])]
        return torch.stack([torch.softmax(self.net(v) / self.temperature, dim=1) for v in views]).mean(0)


def augment(xb: torch.Tensor, gen: torch.Generator, shift: int = 0, noise_max: float = 2.0) -> torch.Tensor:
    n = xb.shape[0]
    hflip = torch.rand(n, generator=gen) < 0.5
    vflip = torch.rand(n, generator=gen) < 0.5
    xb = torch.where(hflip[:, None, None, None], torch.flip(xb, [3]), xb)
    xb = torch.where(vflip[:, None, None, None], torch.flip(xb, [2]), xb)
    if shift:  # crops are not perfectly aligned: translate each image by up to `shift` px (edge padded)
        h, w = xb.shape[2:]
        t = (torch.randint(-shift, shift + 1, (n, 2), generator=gen).float() * 2 / torch.tensor([w, h]))
        theta = torch.zeros(n, 2, 3)
        theta[:, 0, 0] = theta[:, 1, 1] = 1
        theta[:, :, 2] = t
        grid = nn.functional.affine_grid(theta, list(xb.shape), align_corners=False)
        xb = nn.functional.grid_sample(xb, grid, mode="nearest", padding_mode="border", align_corners=False)
    # sensor noise: each image gets its own level, uniform in [0, noise_max] grey levels
    sigma = torch.rand(n, 1, 1, 1, generator=gen) * (noise_max / 255 / STD)
    return xb + torch.randn(xb.shape, generator=gen) * sigma


@torch.no_grad()
def predict(model: nn.Module, X: torch.Tensor, bs: int = 1024) -> np.ndarray:
    model.eval()
    return np.concatenate([model(X[i : i + bs]).numpy() for i in range(0, len(X), bs)])


def nll(proba: np.ndarray, y: np.ndarray) -> float:
    return float(-np.log(np.clip(proba[np.arange(len(y)), y], 1e-7, 1)).mean())


def ece(proba: np.ndarray, y: np.ndarray, bins: int = 15) -> float:
    """Expected calibration error: average |accuracy - confidence| over confidence bins."""
    conf, correct = proba.max(1), proba.argmax(1) == y
    edges = np.linspace(0, 1, bins + 1)
    err = 0.0
    for lo, hi in zip(edges[:-1], edges[1:], strict=True):
        m = (conf > lo) & (conf <= hi)
        if m.any():
            err += m.mean() * abs(correct[m].mean() - conf[m].mean())
    return float(err)


def finalize(net: nn.Module, X: torch.Tensor, y: np.ndarray, split: np.ndarray, info: dict) -> None:
    """Pick TTA and a softmax temperature on VALIDATION, then save predictions and export ONNX."""
    net.eval()
    va, te = torch.from_numpy(split == "val"), torch.from_numpy(split == "test")
    yva = y[split == "val"]
    raw = {tta: predict(Deployable(net, tta), X[va]) for tta in (False, True)}
    f1 = {tta: f1_score(yva, raw[tta].argmax(1), average="macro") for tta in raw}
    tta_gain = f1[True] - f1[False]
    use_tta = bool(tta_gain > 0.002)
    print(f"flip TTA changes val macro-F1 by {tta_gain:+.4f} -> use_tta={use_tta}")

    # temperature scaling (Guo et al. 2017): one scalar fitted by validation log-loss; logits computed once
    xv = (X[va] - MEAN) / STD
    views = [xv, torch.flip(xv, [3]), torch.flip(xv, [2]), torch.flip(xv, [2, 3])] if use_tta else [xv]
    logits = np.stack([predict(net, v) for v in views])  # (views, N, classes)

    def calibrated(t: float) -> np.ndarray:
        z = logits / t
        e = np.exp(z - z.max(axis=2, keepdims=True))
        return (e / e.sum(axis=2, keepdims=True)).mean(axis=0)

    grid = np.round(np.arange(0.5, 3.01, 0.05), 2)
    losses = [nll(calibrated(float(t)), yva) for t in grid]
    temperature = float(grid[int(np.argmin(losses))])
    print(f"temperature {temperature}: val NLL {nll(raw[use_tta], yva):.4f} -> {min(losses):.4f}")

    out = {}
    for tta in (False, True):
        model = Deployable(net, tta, temperature)
        key = "tta" if tta else "plain"
        out[f"val_proba_{key}"] = predict(model, X[va])
        out[f"test_proba_{key}"] = predict(model, X[te])
    np.savez_compressed(ROOT / "data/processed/preds_cnn.npz", **out)

    torch.save(net.state_dict(), ROOT / "data/processed/cnn_state.pt")
    models = ROOT / "models"
    models.mkdir(exist_ok=True)
    torch.onnx.export(
        Deployable(net, use_tta, temperature).eval(), torch.zeros(1, 1, 40, 24), models / "thermal_cnn.onnx",
        input_names=["pixels"], output_names=["probabilities"],
        dynamic_axes={"pixels": {0: "batch"}, "probabilities": {0: "batch"}}, opset_version=17, dynamo=False,
    )
    calibrated = out["val_proba_tta" if use_tta else "val_proba_plain"]
    info |= {"use_tta": use_tta, "tta_val_macro_f1_gain": tta_gain, "temperature": temperature,
             "val_nll": {"before": nll(raw[use_tta], yva), "after": nll(calibrated, yva)},
             "val_ece": {"before": ece(raw[use_tta], yva), "after": ece(calibrated, yva)},
             "normalisation": {"mean": MEAN, "std": STD}, "torch": torch.__version__}
    write_json(ROOT / "reports/cnn_training.json", info)
    print("exported models/thermal_cnn.onnx")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=40)
    ap.add_argument("--batch", type=int, default=128)
    ap.add_argument("--lr", type=float, default=3e-3)
    ap.add_argument("--width", type=int, default=32)
    ap.add_argument("--shift", type=int, default=0, help="max random translation in pixels (augmentation)")
    ap.add_argument("--noise-max", type=float, default=2.0, help="max sensor-noise sd in grey levels (augmentation)")
    ap.add_argument("--export-only", metavar="STATE", help="skip training: calibrate + export a saved state_dict")
    ap.add_argument("--info", metavar="JSON", help="with --export-only: the training log (cnn_training.json) to keep")
    args = ap.parse_args()

    torch.manual_seed(SEED)
    np.random.seed(SEED)
    d = load_dataset()
    X = torch.from_numpy(d["X"].astype(np.float32) / 255.0)[:, None]
    y = torch.from_numpy(d["y"]).long()
    split = d["split"]
    tr, va, te = (torch.from_numpy(split == s) for s in ("train", "val", "test"))
    print(f"train pixel mean {X[tr].mean():.3f} std {X[tr].std():.3f} (constants: {MEAN}, {STD})")

    if args.export_only:
        info = json.loads(Path(args.info).read_text()) if args.info else {}
        net = ThermalCNN(len(CLASS_NAMES), width=info.get("width", args.width))
        net.load_state_dict(torch.load(args.export_only, weights_only=True))
        finalize(net, X, y.numpy(), split, info)
        return

    Xn = (X - MEAN) / STD
    counts = torch.bincount(y[tr], minlength=len(CLASS_NAMES)).float()
    weights = (counts.sum() / counts).sqrt()
    weights = weights / weights.mean()
    net = ThermalCNN(len(CLASS_NAMES), width=args.width)
    n_params = sum(p.numel() for p in net.parameters())
    print(f"parameters: {n_params:,}")

    opt = torch.optim.AdamW(net.parameters(), lr=args.lr, weight_decay=1e-3)
    steps = args.epochs * int(np.ceil(int(tr.sum()) / args.batch))
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=args.lr, total_steps=steps, pct_start=0.15)
    loss_fn = nn.CrossEntropyLoss(weight=weights, label_smoothing=0.05)
    gen = torch.Generator().manual_seed(SEED)
    Xtr, ytr = Xn[tr], y[tr]
    Xva, yva = Xn[va], y[va].numpy()

    best = {"f1": -1.0}
    history = []
    t0 = time.time()
    for epoch in range(1, args.epochs + 1):
        net.train()
        perm = torch.randperm(len(Xtr), generator=gen)
        total = 0.0
        for i in range(0, len(perm), args.batch):
            idx = perm[i : i + args.batch]
            xb = augment(Xtr[idx], gen, args.shift, args.noise_max)
            loss = loss_fn(net(xb), ytr[idx])
            opt.zero_grad()
            loss.backward()
            opt.step()
            sched.step()
            total += loss.item() * len(idx)
        logits = predict(net, Xva)
        f1 = f1_score(yva, logits.argmax(1), average="macro")
        acc = float((logits.argmax(1) == yva).mean())
        history.append({"epoch": epoch, "train_loss": total / len(Xtr), "val_macro_f1": f1, "val_acc": acc})
        print(f"epoch {epoch:2d} loss {total / len(Xtr):.4f} val acc {acc:.4f} macro-F1 {f1:.4f} "
              f"({time.time() - t0:.0f}s)", flush=True)
        if f1 > best["f1"]:
            best = {"f1": f1, "acc": acc, "epoch": epoch,
                    "state": {k: v.detach().clone() for k, v in net.state_dict().items()}}

    net.load_state_dict(best["state"])
    print(f"best epoch {best['epoch']}: val macro-F1 {best['f1']:.4f} acc {best['acc']:.4f}")
    finalize(net, X, y.numpy(), split, {
        "parameters": n_params, "epochs": args.epochs, "batch": args.batch, "max_lr": args.lr,
        "width": args.width, "shift": args.shift, "noise_max": args.noise_max, "best_epoch": best["epoch"],
        "val_macro_f1": best["f1"], "val_acc": best["acc"], "class_weights": weights.tolist(),
        "train_seconds": round(time.time() - t0), "history": history,
    })


if __name__ == "__main__":
    main()
