"""
services/auth/main.py
Compatibility entrypoint for local `uvicorn main:app` runs.
"""
from __future__ import annotations

from app.main import app, create_app

__all__ = ["app", "create_app"]
