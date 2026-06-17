"""
services/marketplace/main.py
IndiCarbon AI — Marketplace Service
Handles:
  - Carbon Credit Registry (CRUD + ownership tracking)
  - Order Book (buy/sell orders)
  - "Reserve-then-Commit" ACID-compliant trade settlement
"""
from __future__ import annotations

from app.main import app, create_app

__all__ = ["app", "create_app"]
