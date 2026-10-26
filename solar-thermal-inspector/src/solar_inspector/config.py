"""Runtime settings, all overridable with environment variables (12-factor style)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _env(name: str, default: str) -> str:
    return os.environ.get(name, default)


@dataclass(frozen=True)
class Settings:
    database_url: str = field(default_factory=lambda: _env(
        "DATABASE_URL", f"sqlite:///{PROJECT_ROOT / 'data' / 'inspector.db'}"))
    storage_dir: Path = field(default_factory=lambda: Path(_env("STORAGE_DIR", str(PROJECT_ROOT / "data" / "uploads"))))
    model_dir: Path = field(default_factory=lambda: Path(_env("MODEL_DIR", str(PROJECT_ROOT / "models"))))
    sample_dir: Path = field(default_factory=lambda: Path(_env("SAMPLE_DIR", str(PROJECT_ROOT / "data" / "sample"))))
    # "standard" = one 95%-recall threshold; "safety" = also alert on a lower bar for critical faults
    # (more false alarms, fewer missed dead modules). Trade-off measured in reports/evaluation.md.
    alert_policy: str = field(default_factory=lambda: _env("ALERT_POLICY", "standard"))
    # If set, write endpoints require the header `X-API-Key: <value>`. Leave empty for local use.
    api_key: str = field(default_factory=lambda: _env("API_KEY", ""))

    # Upload guards
    max_files: int = field(default_factory=lambda: int(_env("MAX_FILES", "5000")))
    max_file_mb: float = field(default_factory=lambda: float(_env("MAX_FILE_MB", "20")))
    max_upload_mb: float = field(default_factory=lambda: float(_env("MAX_UPLOAD_MB", "200")))

    # Site economics used to turn findings into kW, MWh/yr and KRW/yr. Defaults are planning
    # placeholders: set them from the site's datasheet, yield history and offtake price.
    module_power_w: float = field(default_factory=lambda: float(_env("MODULE_POWER_W", "400")))
    specific_yield_kwh_per_kwp: float = field(default_factory=lambda: float(_env("SPECIFIC_YIELD", "1300")))
    tariff_krw_per_kwh: float = field(default_factory=lambda: float(_env("TARIFF_KRW_PER_KWH", "150")))

    # Radiometric input: delta T bands (industry triage convention, not a normative IEC limit)
    delta_t_moderate_c: float = 10.0
    delta_t_severe_c: float = 20.0
    radiometric_gain: float = field(default_factory=lambda: float(_env("RADIOMETRIC_GAIN", "4.0")))


def get_settings() -> Settings:
    return Settings()
