# Serving image: FastAPI + ONNX Runtime. No PyTorch and no training data, only the bundled demo sample.
FROM python:3.12-slim@sha256:a0f57064cbdcd6285fa45f51237ab0b35ea8ebaed06a1f5973e89e19dfb86704

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ src/
COPY models/thermal_cnn.onnx models/model_meta.json models/metrics.json models/
COPY data/sample/ data/sample/

RUN useradd --create-home --uid 10001 app && mkdir -p /data && chown app /data
USER app

ENV PYTHONPATH=/app/src \
    DATABASE_URL=sqlite:////data/inspector.db \
    STORAGE_DIR=/data/uploads \
    MODEL_DIR=/app/models \
    SAMPLE_DIR=/app/data/sample \
    PORT=8000 \
    WORKERS=1 \
    SEED_DEMO=0 \
    ALERT_POLICY=standard

EXPOSE 8000
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD python -c "import os,urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ[\"PORT\"]}/api/health', timeout=4)"

# SEED_DEMO=1 loads the bundled sample inspection on first start (empty database only).
CMD ["sh", "-c", "if [ \"$SEED_DEMO\" = 1 ]; then python -m solar_inspector.cli seed-demo --if-empty; fi && exec uvicorn solar_inspector.api:app --host 0.0.0.0 --port \"$PORT\" --workers \"$WORKERS\" --proxy-headers"]
