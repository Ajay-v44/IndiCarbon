"""
libs/shared-logic/__init__.py
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
from .supabase_client import (
    BaseRepository,
    VectorRepository,
    get_supabase_client,
    get_supabase_settings,
)

__all__ = [
    "register_middleware",
    "ApiResponse",
    "ApiErrorResponse",
    "ErrorDetail",
    "GHGScope",
    "EmissionCategory",
    "EmissionEntryRequest",
    "EmissionResult",
    "BRSRReport",
    "CarbonCredit",
    "CreditStatus",
    "OrderSide",
    "OrderStatus",
    "PlaceOrderRequest",
    "TradeReceipt",
    "AgentType",
    "AgentRunRequest",
    "AgentRunResponse",
    "BaseRepository",
    "VectorRepository",
    "get_supabase_client",
    "get_supabase_settings",
]
