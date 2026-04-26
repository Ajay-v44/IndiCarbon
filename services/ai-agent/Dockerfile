# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY libs/shared-logic /build/shared-logic
COPY services/ai-agent/requirements.txt /build/requirements.txt

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /build/requirements.txt \
    && pip install --no-cache-dir -e /build/shared-logic

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM python:3.12-slim AS production

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /usr/local/bin /usr/local/bin

COPY services/ai-agent/agent.py /app/agent.py
COPY services/ai-agent/main.py /app/main.py

# Create empty __init__ so relative import works
RUN touch /app/__init__.py

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
    CMD curl -f http://localhost:8003/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003", "--workers", "1"]
