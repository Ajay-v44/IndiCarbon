# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY libs /build/libs
COPY services/ai-agent/requirements.txt /build/requirements.txt

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /build/requirements.txt \
    && pip install --no-cache-dir /build/libs

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM python:3.12-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends curl libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /usr/local/bin /usr/local/bin

COPY services/ai-agent/app /app/app
COPY services/ai-agent/agent.py /app/agent.py
COPY .envs /app/.envs

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8003

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8003/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003", "--workers", "1"]
