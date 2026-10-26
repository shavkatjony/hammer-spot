"""What each anomaly class means for an O&M team: likely power loss, priority and the action to take.

`loss_fraction` is the share of one module's output assumed lost while the fault is present.
Only three values come from the dataset's own class definitions (Diode = about 1/3 of the module,
Diode-Multi = about 2/3, Offline-Module = the whole module). Every other value is a planning
assumption for ranking work, not a measurement. Replace them with I-V curve or SCADA data per site.
"""

from __future__ import annotations

from dataclasses import dataclass

NORMAL = "No-Anomaly"


@dataclass(frozen=True)
class AnomalyClass:
    name: str
    description: str
    group: str
    loss_fraction: float
    loss_basis: str  # "dataset definition" or "planning assumption"
    priority: str  # P1 = dispatch within 7 days, P2 = within 30 days, P3 = next scheduled visit
    safety: bool  # can escalate to burn marks / fire if left alone
    action: str


CLASSES: dict[str, AnomalyClass] = {
    c.name: c
    for c in [
        AnomalyClass(
            "Offline-Module", "Entire module is heated: it produces nothing for its string.",
            "Module offline", 1.00, "dataset definition", "P1", True,
            "Check module connectors, cabling and string fuse; replace the module if it is dead.",
        ),
        AnomalyClass(
            "Diode-Multi", "Multiple activated bypass diodes, typically 2/3 of the module.",
            "Bypass diode", 0.67, "dataset definition", "P1", True,
            "Inspect the junction box and bypass diodes; plan module replacement.",
        ),
        AnomalyClass(
            "Hot-Spot-Multi", "Multiple hot spots on a thin-film module.",
            "Hot spot", 0.10, "planning assumption", "P1", True,
            "Inspect for burn marks and delamination; replace the module if damaged.",
        ),
        AnomalyClass(
            "Diode", "Activated bypass diode, typically 1/3 of the module.",
            "Bypass diode", 0.33, "dataset definition", "P2", True,
            "Inspect the junction box; check the bypassed substring for shading or cell damage.",
        ),
        AnomalyClass(
            "Hot-Spot", "Hot spot on a thin-film module.",
            "Hot spot", 0.05, "planning assumption", "P2", True,
            "Visual check for burn marks; re-measure under stable irradiance.",
        ),
        AnomalyClass(
            "Cell-Multi", "Hot spots with square geometry in multiple cells.",
            "Cell defect", 0.10, "planning assumption", "P2", True,
            "Electroluminescence or I-V test; warranty claim if cells are defective.",
        ),
        AnomalyClass(
            "Cracking", "Cracking on the module surface.",
            "Cell defect", 0.05, "planning assumption", "P2", False,
            "Visual inspection for glass or cell cracks; monitor or replace (moisture ingress risk).",
        ),
        AnomalyClass(
            "Vegetation", "Panels blocked by vegetation.",
            "Obstruction", 0.15, "planning assumption", "P2", False,
            "Vegetation management around the affected rows.",
        ),
        AnomalyClass(
            "Cell", "Hot spot with square geometry in a single cell.",
            "Cell defect", 0.05, "planning assumption", "P3", False,
            "Monitor and re-inspect next survey; escalate if it grows.",
        ),
        AnomalyClass(
            "Shadowing", "Sunlight blocked by vegetation, structures or adjacent rows.",
            "Obstruction", 0.10, "planning assumption", "P3", False,
            "Find the shading source; review row spacing or remove the obstruction.",
        ),
        AnomalyClass(
            "Soiling", "Dirt, dust or other debris on the module surface.",
            "Soiling", 0.05, "planning assumption", "P3", False,
            "Add to the cleaning schedule.",
        ),
        AnomalyClass(
            NORMAL, "Nominal solar module.", "Normal", 0.0, "dataset definition", "-", False,
            "No action.",
        ),
    ]
}

PRIORITY_ORDER = {"P1": 1, "P2": 2, "P3": 3, "-": 9}
PRIORITY_SLA_DAYS = {"P1": 7, "P2": 30, "P3": 90}

# Classes where a miss is expensive or unsafe: the model is judged on recall for these separately.
CRITICAL = sorted(n for n, c in CLASSES.items() if c.priority == "P1" or c.loss_fraction >= 0.33)
