"""
libs/shared-logic/__init__.py
Public surface of the shared library — imported by all microservices.
"""
from .middleware import register_middleware
from .schemas import (
    AgentRunRequest,
    AgentRunResponse,
    AgentType,
    ApiErrorResponse,
    ApiResponse,
    BRSRReport,
    CarbonCredit,
    CreditStatus,
    EmissionCategory,
    EmissionEntryRequest,
    EmissionResult,
    ErrorDetail,
    GHGScope,
    OrderSide,
    OrderStatus,
    PlaceOrderRequest,
    TradeReceipt,
)


def __getattr__(name: str):
    if name in {"Base", "get_db"}:
        from .database import Base, get_db

        return {"Base": Base, "get_db": get_db}[name]
    if name in {
        "BaseRepository",
        "VectorRepository",
        "get_supabase_client",
        "get_supabase_settings",
    }:
        from .supabase_client import (
            BaseRepository,
            VectorRepository,
            get_supabase_client,
            get_supabase_settings,
        )

        return {
            "BaseRepository": BaseRepository,
            "VectorRepository": VectorRepository,
            "get_supabase_client": get_supabase_client,
            "get_supabase_settings": get_supabase_settings,
        }[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

__all__ = [
    # Middleware
    "register_middleware",
    # Response envelopes
    "ApiResponse",
    "ApiErrorResponse",
    "ErrorDetail",
    "GHGScope",
    "EmissionCategory",
    "EmissionEntryRequest",
    "EmissionResult",
    "BRSRReport",
    "CreditStatus",
    "OrderSide",
    "OrderStatus",
    "CarbonCredit",
    "PlaceOrderRequest",
    "TradeReceipt",
    "AgentType",
    "AgentRunRequest",
    "AgentRunResponse",
    # SQLAlchemy
    "Base",
    "get_db",
    # Supabase Auth SDK client
    "get_supabase_client",
    "get_supabase_settings",
    "BaseRepository",
    "VectorRepository",
]
