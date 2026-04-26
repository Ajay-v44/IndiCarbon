"""
libs/shared-logic/middleware.py
Global FastAPI middleware shared by all services:
  - RequestID injection
  - Structured JSON logging
  - Centralised exception → ApiErrorResponse translation
"""
from __future__ import annotations

import logging
import time
import traceback
import uuid
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .schemas import ApiErrorResponse, ErrorDetail

logger = logging.getLogger(__name__)


# ─── Request-ID Middleware ─────────────────────────────────────────────────────


async def request_id_middleware(request: Request, call_next):  # type: ignore[override]
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    request.state.start_time = time.perf_counter()

    response = await call_next(request)
    elapsed_ms = int((time.perf_counter() - request.state.start_time) * 1000)

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = str(elapsed_ms)

    logger.info(
        "method=%s path=%s status=%s duration_ms=%s request_id=%s",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
        request_id,
    )
    return response


# ─── Error Handler Helpers ────────────────────────────────────────────────────


def _error_response(
    request: Request,
    status_code: int,
    code: str,
    message: str,
    field: str | None = None,
    meta: dict[str, Any] | None = None,
) -> JSONResponse:
    body = ApiErrorResponse(
        error=ErrorDetail(code=code, message=message, field=field, meta=meta),
        request_id=getattr(request.state, "request_id", None),
    )
    return JSONResponse(status_code=status_code, content=body.model_dump(mode="json"))


# ─── Exception Handlers ───────────────────────────────────────────────────────


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    field = str(errors[0]["loc"][-1]) if errors else None
    return _error_response(
        request,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="VALIDATION_ERROR",
        message=errors[0]["msg"] if errors else "Validation failed",
        field=field,
        meta={"errors": errors},
    )


async def pydantic_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    return _error_response(
        request,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="SCHEMA_ERROR",
        message=str(exc),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception: %s\n%s", exc, traceback.format_exc())
    return _error_response(
        request,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected error occurred. Our team has been notified.",
    )


# ─── Registration Helper ──────────────────────────────────────────────────────


def register_middleware(app: FastAPI) -> None:
    """Call once during app creation to attach all middleware and handlers."""
    from starlette.middleware.base import BaseHTTPMiddleware

    app.add_middleware(BaseHTTPMiddleware, dispatch=request_id_middleware)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(ValidationError, pydantic_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, generic_exception_handler)  # type: ignore[arg-type]
