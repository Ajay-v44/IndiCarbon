# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY libs /build/libs
COPY services/gateway/requirements.txt /build/requirements.txt

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /build/requirements.txt \
    && pip install --no-cache-dir /build/libs

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM python:3.12-slim AS production

# Non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /usr/local/bin /usr/local/bin

COPY services/gateway/main.py /app/main.py
COPY .envs /app/.envs

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
