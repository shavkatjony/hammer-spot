"""Compare every model on the held-out test split and write the evaluation report.

    python training/evaluate.py

Protocol
- Operating threshold for "anomaly" is chosen on VALIDATION: the highest score threshold that still
  catches >= 95% of anomalous modules (a missed fault costs more than a technician's extra check).
- That threshold is then applied once to TEST. Test data is used for nothing else.
- Outputs: reports/evaluation.md, reports/figures/eval_*.png, models/metrics.json, models/model_meta.json
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import time

import numpy as np
import onnxruntime as ort
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_recall_fscore_support,
    roc_auc_score,
)

from common import CLASS_NAMES, CRITICAL, FIG, NORMAL, ROOT, load_dataset, write_json
from plotstyle import BLUES, INK2, SERIES, plt
from solar_inspector.predictor import decide_batch

RECALL_TARGET = 0.95
CRITICAL_RECALL_TARGET = 0.97  # the "safety" alert policy's extra rule is tuned to this on validation
REVIEW_CONFIDENCE = 0.5  # below this top-class probability, a finding is routed to human review
PREVALENCES = [0.01, 0.02, 0.05, 0.10, 0.50]
MODELS = ROOT / "models"
LABELS = {"rule": "Rule: peak contrast (image processing only)", "iforest": "Isolation Forest (normal-only)",
          "gbm": "Gradient boosting on 30 features", "cnn": "CNN on raw pixels (served)"}


def threshold_for_recall(score: np.ndarray, pos: np.ndarray, target: float) -> float:
    """Highest threshold whose recall on these samples is still >= target."""
    s = np.sort(score[pos])[::-1]
    k = int(np.ceil(target * len(s))) - 1
    return float(s[k])


def binary_metrics(score: np.ndarray, pos: np.ndarray, t: float, crit: np.ndarray) -> dict:
    flag = score >= t
    tp, fp = int((flag & pos).sum()), int((flag & ~pos).sum())
    fn, tn = int((~flag & pos).sum()), int((~flag & ~pos).sum())
    rec, fpr = tp / (tp + fn), fp / (fp + tn)
    prec = tp / max(tp + fp, 1)
    return {
        "roc_auc": float(roc_auc_score(pos, score)), "pr_auc": float(average_precision_score(pos, score)),
        "threshold": t, "recall": rec, "precision": prec, "fpr": fpr, "f1": 2 * prec * rec / max(prec + rec, 1e-9),
        "critical_recall": float(flag[crit].mean()), "critical_missed": int((~flag[crit]).sum()),
        "critical_total": int(crit.sum()), "tp": tp, "fp": fp, "fn": fn, "tn": tn,
    }


def flag_metrics(flag: np.ndarray, pos: np.ndarray, crit: np.ndarray) -> dict:
    rec, fpr = float(flag[pos].mean()), float(flag[~pos].mean())
    return {"recall": rec, "fpr": fpr, "precision": float((flag & pos).sum() / max(flag.sum(), 1)),
            "precision_at_5pct": precision_at(0.05, rec, fpr), "critical_missed": int((~flag[crit]).sum()),
            "critical_total": int(crit.sum())}


def critical_threshold_for(
    proba: np.ndarray, base: np.ndarray, crit: np.ndarray, idx: list[int], target: float
) -> float:
    """Highest P(critical) bar that, added to the base rule, flags >= target of critical modules (validation)."""
    s = proba[:, idx].sum(axis=1)
    for c in np.sort(np.unique(s[crit]))[::-1]:
        if (base | (s >= c))[crit].mean() >= target:
            return float(c)
    return 0.0


def precision_at(prevalence: float, tpr: float, fpr: float) -> float:
    return tpr * prevalence / (tpr * prevalence + fpr * (1 - prevalence))


def ece(proba: np.ndarray, y: np.ndarray, bins: int = 15) -> float:
    conf, pred = proba.max(1), proba.argmax(1)
    edges = np.linspace(0, 1, bins + 1)
    err = 0.0
    for lo, hi in zip(edges[:-1], edges[1:], strict=True):
        m = (conf > lo) & (conf <= hi)
        if m.any():
            err += m.mean() * abs((pred[m] == y[m]).mean() - conf[m].mean())
    return float(err)


def multiclass_metrics(proba: np.ndarray, y: np.ndarray) -> dict:
    pred = proba.argmax(1)
    p, r, f, s = precision_recall_fscore_support(y, pred, labels=range(len(CLASS_NAMES)), zero_division=0)
    top2 = np.argsort(-proba, axis=1)[:, :2]
    return {
        "accuracy": float((pred == y).mean()), "macro_f1": float(f1_score(y, pred, average="macro")),
        "weighted_f1": float(f1_score(y, pred, average="weighted")),
        "top2_accuracy": float((top2 == y[:, None]).any(1).mean()), "ece": ece(proba, y),
        "per_class": {c: {"precision": float(p[i]), "recall": float(r[i]), "f1": float(f[i]), "support": int(s[i])}
                      for i, c in enumerate(CLASS_NAMES)},
    }


def onnx_session() -> ort.InferenceSession:
    so = ort.SessionOptions()
    so.intra_op_num_threads = 1
    return ort.InferenceSession(str(MODELS / "thermal_cnn.onnx"), so, providers=["CPUExecutionProvider"])


def run_onnx(sess: ort.InferenceSession, X: np.ndarray) -> np.ndarray:
    x = (X.astype(np.float32) / 255.0)[:, None]
    return np.concatenate([sess.run(None, {"pixels": x[i : i + 512]})[0] for i in range(0, len(x), 512)])


def latency(sess: ort.InferenceSession, X: np.ndarray) -> dict:
    one = (X[:1].astype(np.float32) / 255.0)[:, None]
    for _ in range(20):
        sess.run(None, {"pixels": one})
    t = time.perf_counter()
    for _ in range(300):
        sess.run(None, {"pixels": one})
    single_ms = (time.perf_counter() - t) / 300 * 1000
    batch = (X[:256].astype(np.float32) / 255.0)[:, None]
    sess.run(None, {"pixels": batch})
    t = time.perf_counter()
    for _ in range(10):
        sess.run(None, {"pixels": batch})
    per_img = (time.perf_counter() - t) / (10 * len(batch)) * 1000
    return {"single_image_ms": round(single_ms, 3), "batched_ms_per_image": round(per_img, 3),
            "images_per_second_batched": round(1000 / per_img), "threads": 1}


def perturb(X: np.ndarray, kind: str, rng: np.random.Generator) -> np.ndarray:
    Xf = X.astype(np.float32)
    if kind == "offset -10":
        Xf = Xf - 10
    elif kind == "offset +10":
        Xf = Xf + 10
    elif kind == "noise sd 5":
        Xf = Xf + rng.normal(0, 5, Xf.shape)
    elif kind == "blur 3x3":
        p = np.pad(Xf, ((0, 0), (1, 1), (1, 1)), mode="edge")
        Xf = sum(p[:, i : i + X.shape[1], j : j + X.shape[2]] for i in range(3) for j in range(3)) / 9
    elif kind == "contrast x0.8":
        med = np.median(Xf, axis=(1, 2), keepdims=True)
        Xf = med + (Xf - med) * 0.8
    return np.clip(Xf, 0, 255)


# ----------------------------------------------------------------------------- figures


def fig_pr(curves: dict, pos: np.ndarray, ops: dict) -> None:
    fig, ax = plt.subplots(figsize=(6.4, 4.6))
    for k, (name, score) in enumerate(curves.items()):
        p, r, _ = precision_recall_curve(pos, score)
        ax.plot(r, p, color=SERIES[k], lw=2, label=f"{LABELS[name]} (AP {average_precision_score(pos, score):.3f})")
        ax.plot(ops[name]["recall"], ops[name]["precision"], "o", ms=8, color=SERIES[k], mec="#fcfcfb", mew=2)
    ax.axvline(RECALL_TARGET, color="#c3c2b7", lw=1, ls="--")
    ax.text(RECALL_TARGET - 0.01, 0.52, "recall target 0.95", rotation=90, ha="right", color=INK2, fontsize=8)
    ax.set_xlim(0, 1.01), ax.set_ylim(0.45, 1.01)
    ax.set_xlabel("Recall (share of faulty modules caught)")
    ax.set_ylabel("Precision (share of alerts that are real)")
    ax.set_title("Anomaly vs normal on the test split (dots = chosen operating point)")
    ax.legend(loc="lower left", fontsize=8)
    fig.savefig(FIG / "eval_pr_curves.png")
    plt.close(fig)


def fig_confusion(y: np.ndarray, pred: np.ndarray, order: list[int]) -> None:
    cm = confusion_matrix(y, pred, labels=order)
    norm = cm / cm.sum(1, keepdims=True)
    names = [CLASS_NAMES[i] for i in order]
    fig, ax = plt.subplots(figsize=(8, 6.8))
    ax.imshow(norm, cmap=BLUES, vmin=0, vmax=1)
    for i in range(len(order)):
        for j in range(len(order)):
            if cm[i, j]:
                ax.text(j, i, cm[i, j], ha="center", va="center", fontsize=7.5,
                        color="#ffffff" if norm[i, j] > 0.55 else "#0b0b0b")
    ax.set_xticks(range(len(names)), names, rotation=45, ha="right")
    ax.set_yticks(range(len(names)), names)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.grid(False)
    ax.set_title("CNN confusion matrix, test split (counts; shade = row share)")
    fig.savefig(FIG / "eval_confusion_cnn.png")
    plt.close(fig)


def fig_per_class(mc: dict, order: list[int]) -> None:
    names = [CLASS_NAMES[i] for i in order]
    fig, ax = plt.subplots(figsize=(7, 5.2))
    ys = np.arange(len(names))
    h = 0.38
    for k, (model, key) in enumerate((("gbm", "Gradient boosting (features)"), ("cnn", "CNN (served)"))):
        vals = [mc[model]["per_class"][n]["recall"] for n in names]
        ax.barh(ys + (k - 0.5) * (h + 0.02), vals, height=h, color=SERIES[k], label=key)
    for i, n in enumerate(names):
        ax.text(mc["cnn"]["per_class"][n]["recall"] + 0.01, i + 0.5 * (h + 0.02),
                f"{mc['cnn']['per_class'][n]['recall']:.2f}", va="center", fontsize=7.5, color=INK2)
    ax.set_yticks(ys, names)
    ax.invert_yaxis()
    ax.set_xlim(0, 1.08)
    ax.set_xlabel("Recall on the test split")
    ax.grid(axis="y", visible=False)
    ax.set_title("Per-class recall: which faults each model finds")
    ax.legend(loc="lower right")
    fig.savefig(FIG / "eval_per_class_recall.png")
    plt.close(fig)


# ----------------------------------------------------------------------------- main


def main() -> None:
    d = load_dataset()
    y, split, X = d["y"], d["split"], d["X"]
    normal = CLASS_NAMES.index(NORMAL)
    va, te = split == "val", split == "test"
    yv, yt = y[va], y[te]
    pos_v, pos_t = yv != normal, yt != normal
    crit_idx = [CLASS_NAMES.index(c) for c in CRITICAL]
    crit_t = np.isin(yt, crit_idx)

    pr = {n: np.load(ROOT / f"data/processed/preds_{n}.npz") for n in ("rule", "iforest", "gbm", "cnn")}
    cnn_info = json.loads((ROOT / "reports/cnn_training.json").read_text())
    tta = "tta" if cnn_info["use_tta"] else "plain"
    proba = {"gbm": (pr["gbm"]["val_proba"], pr["gbm"]["test_proba"]),
             "cnn": (pr["cnn"][f"val_proba_{tta}"], pr["cnn"][f"test_proba_{tta}"])}

    # the exported ONNX graph must reproduce the PyTorch probabilities used below
    sess = onnx_session()
    onnx_test = run_onnx(sess, X[te])
    max_diff = float(np.abs(onnx_test - proba["cnn"][1]).max())
    assert max_diff < 1e-4, f"ONNX differs from PyTorch by {max_diff}"

    scores = {
        "rule": (pr["rule"]["val_score"], pr["rule"]["test_score"]),
        "iforest": (pr["iforest"]["val_score"], pr["iforest"]["test_score"]),
        "gbm": (1 - proba["gbm"][0][:, normal], 1 - proba["gbm"][1][:, normal]),
        "cnn": (1 - proba["cnn"][0][:, normal], 1 - proba["cnn"][1][:, normal]),
    }
    binary = {}
    for name, (sv, st) in scores.items():
        t = threshold_for_recall(sv, pos_v, RECALL_TARGET)
        binary[name] = binary_metrics(st, pos_t, t, crit_t)
    mc = {name: multiclass_metrics(pt, yt) for name, (_pv, pt) in proba.items()}

    cnn_b = binary["cnn"]
    prevalence = [{"prevalence": p, "precision": precision_at(p, cnn_b["recall"], cnn_b["fpr"])} for p in PREVALENCES]
    fleet, p5 = 10_000, 0.05
    faults = fleet * p5
    workload = {
        "modules": fleet, "assumed_prevalence": p5, "faulty": faults,
        "caught": round(faults * cnn_b["recall"]), "missed": round(faults * (1 - cnn_b["recall"])),
        "false_alarms": round((fleet - faults) * cnn_b["fpr"]),
        "alerts": round(faults * cnn_b["recall"] + (fleet - faults) * cnn_b["fpr"]),
    }

    # what the app actually reports, under both alert policies (same function as the API: decide_batch)
    pv, pt = proba["cnn"]
    crit_v = np.isin(yv, crit_idx)
    base_v = (1 - pv[:, normal]) >= cnn_b["threshold"]
    t_crit = critical_threshold_for(pv, base_v, crit_v, crit_idx, CRITICAL_RECALL_TARGET)
    policies = {}
    for policy, tc in (("standard", None), ("safety", t_crit)):
        flag, reported, _ = decide_batch(pt, normal, crit_idx, cnn_b["threshold"], tc)
        policies[policy] = flag_metrics(flag, pos_t, crit_t) | {
            "critical_threshold": tc, "accuracy": float((reported == yt).mean()),
            "macro_f1": float(f1_score(yt, reported, average="macro"))}
    flag, reported, _ = decide_batch(pt, normal, crit_idx, cnn_b["threshold"])
    served = {"accuracy": policies["standard"]["accuracy"], "macro_f1": policies["standard"]["macro_f1"]}
    confident = pt.max(1) >= REVIEW_CONFIDENCE
    auto, rev = flag & confident, flag & ~confident
    review = {"threshold": REVIEW_CONFIDENCE, "flagged": int(flag.sum()), "auto_share": float(auto.sum() / flag.sum()),
              "auto_accuracy": float((reported[auto] == yt[auto]).mean()),
              "review_accuracy": float((reported[rev] == yt[rev]).mean())}

    rng = np.random.default_rng(0)
    robustness = []
    for kind in ("none", "noise sd 5", "blur 3x3", "contrast x0.8", "offset -10", "offset +10"):
        pk = onnx_test if kind == "none" else run_onnx(sess, perturb(X[te], kind, rng))
        flag = (1 - pk[:, normal]) >= cnn_b["threshold"]
        robustness.append({
            "perturbation": kind, "accuracy": float((pk.argmax(1) == yt).mean()),
            "macro_f1": float(f1_score(yt, pk.argmax(1), average="macro")),
            "recall": float(flag[pos_t].mean()), "fpr": float(flag[~pos_t].mean()),
        })

    lat = latency(sess, X[te])

    # ---- figures
    FIG.mkdir(parents=True, exist_ok=True)
    order = list(np.argsort(-np.bincount(y, minlength=len(CLASS_NAMES))))
    fig_pr({n: s[1] for n, s in scores.items()}, pos_t, binary)
    fig_confusion(yt, pt.argmax(1), order)
    fig_per_class(mc, order)

    # ---- machine-readable outputs (served by the API)
    onnx_bytes = (MODELS / "thermal_cnn.onnx").read_bytes()
    version = "cnn-" + hashlib.sha256(onnx_bytes).hexdigest()[:10]
    meta = {
        "version": version, "created": dt.date.today().isoformat(), "classes": CLASS_NAMES, "normal": NORMAL,
        "anomaly_threshold": cnn_b["threshold"], "critical_threshold": t_crit, "critical_classes": CRITICAL,
        "review_confidence": REVIEW_CONFIDENCE, "temperature": cnn_info.get("temperature", 1.0),
        "input": {"name": "pixels", "shape": [None, 1, 40, 24], "range": "[0, 1] = grey level / 255"},
        "tta": cnn_info["use_tta"], "onnx_sha256": hashlib.sha256(onnx_bytes).hexdigest(),
    }
    write_json(MODELS / "model_meta.json", meta)
    dq = json.loads((ROOT / "reports/data_quality.json").read_text())
    metrics = {
        "model_version": version, "evaluated": dt.date.today().isoformat(),
        "dataset": {"name": "InfraredSolarModules (Raptor Maps, MIT)", "images_kept": dq["images_kept"],
                    "split_sizes": dq["split_sizes"], "test_anomalies": int(pos_t.sum()),
                    "test_normal": int((~pos_t).sum())},
        "recall_target": RECALL_TARGET, "critical_classes": CRITICAL,
        "binary": binary, "multiclass": mc, "served_decision": served, "policies": policies,
        "critical_recall_target": CRITICAL_RECALL_TARGET, "prevalence_precision": prevalence,
        "workload_10k": workload,
        "review": review, "robustness": robustness, "latency": lat, "onnx_max_abs_diff": max_diff,
        "cnn_training": {k: v for k, v in cnn_info.items() if k != "history"},
    }
    write_json(MODELS / "metrics.json", metrics)
    write_report(metrics, order)
    write_model_card(metrics, meta)
    print(json.dumps({k: binary[k] | {} for k in binary}, indent=1)[:1500])
    print({k: (round(v["accuracy"], 4), round(v["macro_f1"], 4)) for k, v in mc.items()})


def write_report(m: dict, order: list[int]) -> None:
    b, mc, w = m["binary"], m["multiclass"], m["workload_10k"]
    cnn, pol, ct = mc["cnn"], m["policies"], m["cnn_training"]
    rob = {r["perturbation"]: r for r in m["robustness"]}
    worst = min((r for r in m["robustness"] if r["perturbation"] != "none"), key=lambda r: r["recall"])
    offset_drop = max(abs(rob["none"]["recall"] - rob[k]["recall"]) for k in ("offset -10", "offset +10"))
    argmax_acc = cnn["accuracy"]
    served_vs = "below" if m["served_decision"]["accuracy"] < argmax_acc else "at or above"
    lines = [
        "# Model evaluation",
        "",
        f"Generated by `python training/evaluate.py` on {m['evaluated']}. Served model: `{m['model_version']}`.",
        "",
        f"Test split: **{m['dataset']['test_anomalies'] + m['dataset']['test_normal']:,} images** "
        f"({m['dataset']['test_anomalies']:,} anomalous, {m['dataset']['test_normal']:,} normal), never used for "
        "training or threshold choice; the final model was chosen on validation (see *Model selection*).",
        "",
        "## 1. Can it find faulty modules? (anomaly vs normal)",
        "",
        f"Each model's alert threshold was set on the **validation** split to catch at least "
        f"{m['recall_target']:.0%} of faulty modules, then applied once to the test split.",
        "",
        "| Model | ROC-AUC | PR-AUC | Recall | Precision | False-alarm rate | Critical faults missed |",
        "|---|---:|---:|---:|---:|---:|---:|",
        *(f"| {LABELS[k]} | {v['roc_auc']:.3f} | {v['pr_auc']:.3f} | {v['recall']:.3f} | {v['precision']:.3f} | "
          f"{v['fpr']:.3f} | {v['critical_missed']} of {v['critical_total']} |" for k, v in b.items()),
        "",
        f"*Critical* = {', '.join(m['critical_classes'])} (P1 priority or at least a third of the module's output "
        "lost).",
        "",
        "![PR curves](figures/eval_pr_curves.png)",
        "",
        "## 2. Can it tell which fault it is? (12 classes)",
        "",
        "| Model | Accuracy | Macro-F1 | Weighted-F1 | Top-2 accuracy | Calibration error (ECE) |",
        "|---|---:|---:|---:|---:|---:|",
        *(f"| {LABELS[k]} | {v['accuracy']:.3f} | {v['macro_f1']:.3f} | {v['weighted_f1']:.3f} | "
          f"{v['top2_accuracy']:.3f} | {v['ece']:.3f} |" for k, v in mc.items()),
        "",
        f"**Calibration.** The CNN's probabilities are temperature-scaled (T = {ct.get('temperature', 1.0)}, fitted on "
        f"validation log-loss), which cut validation ECE from {ct['val_ece']['before']:.3f} to "
        f"{ct['val_ece']['after']:.3f} without changing any prediction. A displayed confidence of 80% is right about "
        "80% of the time, which matters because confidence drives the *needs review* flag.",
        "",
        "For context, published 12-class accuracies on this dataset are about 0.83-0.86 (ResNet-50 about 0.83, "
        "ResPNet 0.846, a 13-model ensemble 0.859; Sun & Li 2023). Their splits differ from this one, so treat "
        "the comparison as indicative.",
        "",
        "| Class | Test images | Precision | Recall | F1 |",
        "|---|---:|---:|---:|---:|",
        *(f"| {CLASS_NAMES[i]} | {cnn['per_class'][CLASS_NAMES[i]]['support']} | "
          f"{cnn['per_class'][CLASS_NAMES[i]]['precision']:.3f} | {cnn['per_class'][CLASS_NAMES[i]]['recall']:.3f} | "
          f"{cnn['per_class'][CLASS_NAMES[i]]['f1']:.3f} |" for i in order),
        "",
        "![per-class recall](figures/eval_per_class_recall.png)",
        "",
        "![confusion](figures/eval_confusion_cnn.png)",
        "",
        "## 3. What it means in the field",
        "",
        "The test split is 50% faulty modules; a real plant has far fewer. Precision falls as faults get rarer, "
        "because false alarms come from the (much larger) healthy population. Using the CNN's test recall "
        f"({b['cnn']['recall']:.3f}) and false-alarm rate ({b['cnn']['fpr']:.3f}):",
        "",
        "| Share of modules that are faulty | Expected precision of alerts |",
        "|---:|---:|",
        *(f"| {p['prevalence']:.0%} | {p['precision']:.2f} |" for p in m["prevalence_precision"]),
        "",
        f"Example: a {w['modules']:,}-module survey with {w['assumed_prevalence']:.0%} faulty modules gives about "
        f"**{w['alerts']:,} alerts**: {w['caught']:,} real faults caught, {w['missed']} missed and "
        f"{w['false_alarms']:,} false alarms. In practice the false alarms are cheap to clear because every alert "
        "comes with its image, and the dashboard's *false alarm* button records them for retraining.",
        "",
        "**What the app reports.** The app first applies the recall-oriented threshold, then names the most "
        "likely fault class. Scored that way, the served decision has accuracy "
        f"{m['served_decision']['accuracy']:.3f} and macro-F1 {m['served_decision']['macro_f1']:.3f} on the test "
        f"split, {served_vs} plain arg-max ({argmax_acc:.3f}), because it deliberately raises borderline modules "
        "as faults rather than calling them normal.",
        "",
        "**Alert policy.** Operators choose per deployment (`ALERT_POLICY`). *standard* is the single "
        "95%-recall threshold. *safety* adds a second, lower bar on the summed probability of the critical "
        f"classes, tuned on validation to catch {m['critical_recall_target']:.0%} of them "
        f"(bar = {pol['safety']['critical_threshold']:.3f}).",
        "",
        "| Policy | Recall | False-alarm rate | Precision (test) | Precision at 5% faulty | Critical missed |",
        "|---|---:|---:|---:|---:|---:|",
        *(f"| {k} | {v['recall']:.3f} | {v['fpr']:.3f} | {v['precision']:.3f} | {v['precision_at_5pct']:.2f} | "
          f"{v['critical_missed']} of {v['critical_total']} |" for k, v in pol.items()),
        "",
        "Most missed critical faults are **Offline-Module** (class recall "
        f"{cnn['per_class']['Offline-Module']['recall']:.2f}): "
        "a whole module running warm looks like a normal module on its own, and only stands out next to its "
        "neighbours. That is why each finding also reports *level vs batch*, and why *safety* is the better "
        "choice for sites where a dead module is expensive and a technician check is cheap.",
        "",
        f"**Human review routing.** Alerts whose top-class probability is below {m['review']['threshold']} are "
        f"marked *needs review*. Of the {m['review']['flagged']:,} test alerts, {m['review']['auto_share']:.0%} are "
        f"confident and their fault label is right {m['review']['auto_accuracy']:.1%} of the time, against "
        f"{m['review']['review_accuracy']:.1%} for the alerts routed to review.",
        "",
        *model_selection_lines(),
        "## 4. Robustness (CNN, same threshold)",
        "",
        "| Perturbation | Accuracy | Macro-F1 | Recall | False-alarm rate |",
        "|---|---:|---:|---:|---:|",
        *(f"| {r['perturbation']} | {r['accuracy']:.3f} | {r['macro_f1']:.3f} | {r['recall']:.3f} | {r['fpr']:.3f} |"
          for r in m["robustness"]),
        "",
        f"The largest recall drop comes from **{worst['perturbation']}** ({rob['none']['recall']:.3f} -> "
        f"{worst['recall']:.3f}). Global brightness offsets of +/-10 grey levels, which mimic a flight with "
        f"different 8-bit scaling, move recall by at most {offset_drop:.3f}. Training with noise and shift "
        "augmentation is what keeps the noise row close to the clean one (see model selection above).",
        "",
        "## 5. Speed",
        "",
        f"ONNX Runtime, CPU, {m['latency']['threads']} thread: **{m['latency']['single_image_ms']} ms** per single "
        f"image, {m['latency']['batched_ms_per_image']} ms per image in batches of 256 "
        f"(about {m['latency']['images_per_second_batched']:,} images/s). A 10,000-module site takes about "
        f"{10_000 / m['latency']['images_per_second_batched']:.0f} s on one thread (the API uses two), so upload "
        "and storage, not inference, set the pace.",
        "",
        f"The exported ONNX graph matches PyTorch to within {m['onnx_max_abs_diff']:.1e} (max absolute difference "
        "in probability).",
        "",
        "## 6. Limitations",
        "",
        "- **One data source.** All images come from one provider's pipeline; there are no site or flight IDs, "
        "so the split can't hold out whole sites. Expect lower numbers on a new site or camera until you "
        "fine-tune on a few hundred of its modules.",
        "- **Non-radiometric input.** Pixel values are relative temperatures; the model can't give delta T in "
        "degrees C. The app accepts radiometric CSV/NPY matrices for that and flags them for review.",
        "- **Label noise.** Six groups of identical images carried conflicting labels. That was removed, but "
        "near-duplicates with different labels may remain.",
        "- **Rare classes** (Diode-Multi, Soiling, Hot-Spot, Hot-Spot-Multi) have 27-37 test images each, so "
        "their per-class numbers carry wide uncertainty.",
        "",
    ]
    (ROOT / "reports/evaluation.md").write_text("\n".join(lines))
    print("wrote reports/evaluation.md")


def model_selection_lines() -> list[str]:
    """Candidate CNNs and why the served one won (reports/model_selection.json, if present)."""
    path = ROOT / "reports/model_selection.json"
    if not path.exists():
        return []
    sel = json.loads(path.read_text())
    lines = [
        "**Model selection.** Two CNN candidates were trained. The winner was fixed in advance as the one with "
        "the higher **validation** macro-F1; test numbers are shown only for transparency.",
        "",
        "| Candidate | Params | Augmentation | Val macro-F1 (selection) | Test accuracy | Test macro-F1 | "
        "Test recall, noise sd 5 | Test ECE | Latency (ms) |",
        "|---|---:|---|---:|---:|---:|---:|---:|---:|",
    ]
    for c in sel["candidates"]:
        name = f"**{c['name']} (served)**" if c["selected"] else c["name"]
        lines.append(
            f"| {name} | {c['parameters']:,} | {c['augmentation']}{', flip TTA' if c['tta'] else ''} | "
            f"{c['val_macro_f1_selection']:.3f} | {c['test_accuracy']:.3f} | {c['test_macro_f1']:.3f} | "
            f"{c['test_recall_noise_sd5']:.3f} | {c['test_ece']:.3f} | {c['latency_ms']:.1f} |")
    a, b = sel["candidates"]
    lines += [
        "",
        f"B won on validation. On the clean test split the two are within about one point of each other "
        f"(accuracy {b['test_accuracy']:.3f} vs {a['test_accuracy']:.3f}), but B keeps its recall under sensor "
        f"noise ({b['test_recall_noise_sd5']:.2f} vs {a['test_recall_noise_sd5']:.2f}), is better calibrated, and "
        "needs one forward pass instead of four.",
        "",
        "Caveat: A's weakness to noise was first seen in this report's test-split robustness table, and that "
        "prompted training B. The choice between them used validation only, but the idea for B came from a "
        "test-set observation, so a fresh hold-out (for example a new site) is the fully clean check.",
        "",
    ]
    return lines


def write_model_card(m: dict, meta: dict) -> None:
    ct, b, mc, pol = m["cnn_training"], m["binary"]["cnn"], m["multiclass"]["cnn"], m["policies"]
    noise = f"sd up to {ct['noise_max']}" if "noise_max" in ct else "sd 2"  # older runs used a fixed level
    aug = f"horizontal/vertical flips, Gaussian noise ({noise} grey levels)"
    if ct.get("shift"):
        aug += f", random translation up to {ct['shift']} px"
    lines = [
        f"# Model card: `{m['model_version']}`",
        "",
        "Generated by `training/evaluate.py`. Numbers are from the held-out test split unless stated.",
        "",
        "## Intended use",
        "",
        "Triage of drone infrared images of **single PV module crops**: flag modules that need attention, "
        "suggest the fault type and a priority, and route uncertain cases to a person. A technician confirms "
        "every work order on site. It is not meant for unattended shutdown decisions, for safety "
        "certification, or for image types it was not trained on (full frames, visible-light images, other "
        "equipment).",
        "",
        "## Model",
        "",
        f"- Small CNN, {ct['parameters']:,} parameters (width {ct['width']}), input 1 x 40 x 24 grey levels / 255, "
        "12 softmax outputs.",
        f"- Trained {ct['epochs']} epochs (best epoch {ct['best_epoch']} by validation macro-F1), AdamW + OneCycle "
        f"(max LR {ct['max_lr']}), batch {ct['batch']}, label smoothing 0.05, square-root inverse-frequency class "
        f"weights; augmentation: {aug}.",
        f"- Flip test-time augmentation: {'yes' if ct['use_tta'] else 'no'}. Temperature scaling T = "
        f"{ct.get('temperature', 1.0)} (validation ECE {ct['val_ece']['before']:.3f} -> {ct['val_ece']['after']:.3f}).",
        f"- Exported to ONNX (opset 17), served with ONNX Runtime on CPU, SHA-256 `{meta['onnx_sha256'][:16]}...`.",
        "",
        "## Decision rule",
        "",
        f"- Alert when P(fault) = 1 - P(No-Anomaly) >= **{meta['anomaly_threshold']:.3f}** (validation recall 95%).",
        f"- `ALERT_POLICY=safety` also alerts when P(critical classes) >= **{meta['critical_threshold']:.3f}** "
        f"(validation critical recall {m['critical_recall_target']:.0%}). "
        f"Critical: {', '.join(meta['critical_classes'])}.",
        f"- Alerts with top-class probability < {meta['review_confidence']} are marked *needs review*.",
        "",
        "## Performance (test split)",
        "",
        "| Metric | Value |",
        "|---|---:|",
        f"| Anomaly ROC-AUC / PR-AUC | {b['roc_auc']:.3f} / {b['pr_auc']:.3f} |",
        f"| Recall / precision / false-alarm rate (standard) | {b['recall']:.3f} / {b['precision']:.3f} / "
        f"{b['fpr']:.3f} |",
        f"| Critical faults missed, standard / safety | {pol['standard']['critical_missed']} / "
        f"{pol['safety']['critical_missed']} of {pol['standard']['critical_total']} |",
        f"| 12-class accuracy / macro-F1 / top-2 | {mc['accuracy']:.3f} / {mc['macro_f1']:.3f} / "
        f"{mc['top2_accuracy']:.3f} |",
        f"| Expected calibration error | {mc['ece']:.3f} |",
        f"| Latency, 1 CPU thread | {m['latency']['single_image_ms']} ms / image |",
        "",
        "Per-class results, robustness and the field-prevalence analysis: `reports/evaluation.md`.",
        "",
        "## Data",
        "",
        f"InfraredSolarModules (Raptor Maps, MIT): {m['dataset']['images_kept']:,} images after removing exact "
        "duplicates and 6 groups of identical images with conflicting labels; split 70/15/15 stratified by class, "
        "seed 42 (`data/splits.csv`).",
        "",
        "## Known limitations",
        "",
        f"- Offline-Module recall is {mc['per_class']['Offline-Module']['recall']:.2f}: a uniformly warm module is "
        "hard to tell from a normal one without its neighbours. Use the safety policy or the *level vs batch* value.",
        f"- Soiling recall is {mc['per_class']['Soiling']['recall']:.2f} on {mc['per_class']['Soiling']['support']} "
        "test images; rare classes have wide uncertainty.",
        "- Strong sensor noise degrades recall (see robustness table). Global brightness offsets do not.",
        "- Trained on one provider's 8-bit crops with no site IDs; validate and fine-tune on a new camera or site "
        "before relying on it.",
        "",
    ]
    (MODELS / "MODEL_CARD.md").write_text("\n".join(lines))


if __name__ == "__main__":
    main()
