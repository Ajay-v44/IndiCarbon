"""
services/compliance/main.py
IndiCarbon AI — Compliance Service
Handles:
  - GHG Emissions Math (Scope 1, 2, 3) per GHG Protocol
  - SEBI BRSR report generation
  - Emission factor lookups from Supabase
"""
from __future__ import annotations

from app.main import app, create_app

__all__ = ["app", "create_app"]
