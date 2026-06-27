"""
libs/shared-logic/middleware.py
Global FastAPI middleware shared by all services:
  - RequestID injection
  - Structured JSON logging
  - Centralised exception → ApiErrorResponse translation
  - Automatic system log capture (background, non-blocking)
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

    # Capture slow requests and server errors to system logs
    _capture_response_log(request, response.status_code, elapsed_ms)

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
    msg = errors[0]["msg"] if errors else "Validation failed"

    _capture_error(
        request=request,
        level="WARNING",
        code="VALIDATION_ERROR",
        message=f"Validation error on field '{field}': {msg}",
        status_code=422,
    )

    return _error_response(
        request,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="VALIDATION_ERROR",
        message=msg,
        field=field,
        meta={"errors": errors},
    )


async def pydantic_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    _capture_error(
        request=request,
        level="WARNING",
        code="SCHEMA_ERROR",
        message=str(exc),
        status_code=422,
    )
    return _error_response(
        request,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="SCHEMA_ERROR",
        message=str(exc),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception: %s\n%s", exc, traceback.format_exc())

    _capture_error(
        request=request,
        level="ERROR",
        code="INTERNAL_SERVER_ERROR",
        message=f"{type(exc).__name__}: {exc}",
        status_code=500,
        stack_trace=traceback.format_exc(),
    )

    return _error_response(
        request,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected error occurred. Our team has been notified.",
    )


# ─── System Log Capture Helpers ──────────────────────────────────────────────


def _get_service_name(request: Request) -> str:
    """Extract service name from app title or fall back to 'unknown'."""
    try:
        return getattr(request.app, "title", "unknown").lower().replace(" ", "-")
    except Exception:
        return "unknown"


def _extract_org_id(request: Request) -> str | None:
    """Pull organization ID from gateway-injected headers or auth context."""
    org_id = request.headers.get("X-Organization-ID")
    if org_id:
        return org_id
    auth_ctx = getattr(request.state, "auth_context", None)
    if auth_ctx and isinstance(auth_ctx, dict):
        return auth_ctx.get("organization_id")
    return None


def _extract_user_id(request: Request) -> str | None:
    user_id = request.headers.get("X-User-ID")
    if user_id:
        return user_id
    auth_ctx = getattr(request.state, "auth_context", None)
    if auth_ctx and isinstance(auth_ctx, dict):
        return auth_ctx.get("user_id")
    return None


def _capture_error(
    *,
    request: Request,
    level: str,
    code: str,
    message: str,
    status_code: int,
    stack_trace: str | None = None,
) -> None:
    """Non-blocking error capture to system_logs."""
    try:
        from .system_logger import SystemLogger
        syslog = SystemLogger.get_instance()

        elapsed_ms = None
        start = getattr(request.state, "start_time", None)
        if start:
            elapsed_ms = int((time.perf_counter() - start) * 1000)

        syslog.capture(
            level=level,
            service=_get_service_name(request),
            message=message,
            organization_id=_extract_org_id(request),
            user_id=_extract_user_id(request),
            request_id=getattr(request.state, "request_id", None),
            http_method=request.method,
            http_path=str(request.url.path),
            http_status=status_code,
            duration_ms=elapsed_ms,
            stack_trace=stack_trace,
            metadata={"error_code": code},
        )
    except Exception:
        pass


def _capture_response_log(request: Request, status_code: int, elapsed_ms: int) -> None:
    """Capture 4xx/5xx responses and slow requests (>1s) as system logs."""
    try:
        if status_code < 400 and elapsed_ms < 1000:
            return

        from .system_logger import SystemLogger
        syslog = SystemLogger.get_instance()

        if status_code >= 500:
            level = "ERROR"
            message = f"HTTP {status_code} Server Error on {request.method} {request.url.path}"
        elif status_code >= 400:
            level = "WARNING"
            message = f"HTTP {status_code} Client Error on {request.method} {request.url.path}"
        else:
            level = "INFO"
            message = f"Slow request ({elapsed_ms}ms): {request.method} {request.url.path}"

        syslog.capture(
            level=level,
            service=_get_service_name(request),
            message=message,
            organization_id=_extract_org_id(request),
            user_id=_extract_user_id(request),
            request_id=getattr(request.state, "request_id", None),
            http_method=request.method,
            http_path=str(request.url.path),
            http_status=status_code,
            duration_ms=elapsed_ms,
        )
    except Exception:
        pass





# ─── Registration Helper ──────────────────────────────────────────────────────


def register_middleware(app: FastAPI) -> None:
    """Call once during app creation to attach all middleware and handlers."""
    from starlette.middleware.base import BaseHTTPMiddleware

    app.add_middleware(BaseHTTPMiddleware, dispatch=request_id_middleware)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(ValidationError, pydantic_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, generic_exception_handler)  # type: ignore[arg-type]

    # Start the background flush loop for system logs
    @app.on_event("startup")
    async def _start_system_logger():
        from .system_logger import SystemLogger
        SystemLogger.get_instance().start_background_flush()
