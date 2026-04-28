from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import get_redis, get_requesting_user
from ....schemas.market import PlaceOrderRequest
from ....services import trade_engine as trade_svc

router = APIRouter()


@router.post("", response_model=ApiResponse[dict], summary="Place a buy/sell order — auto-matches if counterparty exists")
async def place_order(
    req: PlaceOrderRequest,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
    redis=Depends(get_redis),
) -> ApiResponse[dict]:
    result = await trade_svc.place_order(req, user_id, db, redis)
    msg = "Order matched and trade settled." if result["matched"] else "Order placed in order book."
    return ApiResponse(data=result, message=msg)


@router.delete("/{order_id}", response_model=ApiResponse[dict], summary="Cancel an open order")
def cancel_order(
    order_id: str,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = trade_svc.cancel_order(order_id, user_id, db)
    return ApiResponse(data=result, message="Order cancelled.")
