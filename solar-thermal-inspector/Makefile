# Common tasks. `make help` lists them.
PY ?= .venv/bin/python
PIP ?= .venv/bin/pip
export PYTHONPATH := src

.PHONY: help setup setup-train data eda train evaluate retrain test lint run demo docker compose-up compose-down

help:
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-14s %s\n", $$1, $$2}'

setup: ## runtime + test dependencies
	python3 -m venv .venv && $(PIP) install -r requirements-dev.txt

setup-train: ## + training dependencies (pandas, scikit-learn, matplotlib, torch)
	python3 -m venv .venv && $(PIP) install -r requirements-train.txt

data: ## download, verify, de-duplicate and split the dataset
	$(PY) training/prepare_data.py

eda: ## exploratory analysis -> reports/eda.md
	cd training && ../$(PY) eda.py

train: ## baselines + CNN -> models/thermal_cnn.onnx
	cd training && ../$(PY) train_baselines.py && ../$(PY) train_cnn.py

evaluate: ## test-split evaluation -> reports/evaluation.md, models/metrics.json
	cd training && ../$(PY) evaluate.py

retrain: data train evaluate test ## full pipeline from raw data to a tested model

test: ## unit, API and model-quality tests
	$(PY) -m pytest

lint:
	.venv/bin/ruff check src training tests

run: ## dev server on http://localhost:8000 (SQLite)
	.venv/bin/uvicorn solar_inspector.api:app --reload --port 8000

demo: ## load the bundled sample inspection into the local database
	$(PY) -m solar_inspector.cli seed-demo

docker: ## build and run the single container (SQLite inside a volume)
	docker build -t solar-thermal-inspector . && docker run --rm -p 8000:8000 -e SEED_DEMO=1 -v sti-data:/data solar-thermal-inspector

compose-up: ## app + PostgreSQL
	docker compose up --build -d

compose-down:
	docker compose down
