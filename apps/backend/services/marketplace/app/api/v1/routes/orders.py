from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Header, HTTPException
from sqlalchemy.orm import Session
import json

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, get_redis, require_organization_access
from ....schemas.market import PlaceOrderRequest
from ....services import trade_engine as trade_svc

router = APIRouter()

@router.get("/market", response_model=ApiResponse[list], summary="List all open SELL orders on the market")
def get_market_book(
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
) -> ApiResponse[list]:
    orders = trade_svc.get_market_book(db)
    return ApiResponse(data=orders, message=f"{len(orders)} market orders available.")

@router.get("", response_model=ApiResponse[list], summary="List market orders for an organization")
def list_orders(
    organization_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    require_organization_access(user, organization_id)
    orders = trade_svc.list_orders(organization_id, db)
    return ApiResponse(data=orders, message=f"{len(orders)} orders found.")

@router.post("", response_model=ApiResponse[dict], summary="Place a buy/sell order — auto-matches if counterparty exists")
async def place_order(
    req: PlaceOrderRequest,
    idempotency_key: str | None = Header(None, alias="Idempotency-Key"),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    redis=Depends(get_redis),
) -> ApiResponse[dict]:
    require_organization_access(user, req.organization_id)
    
    if idempotency_key:
        cache_key = f"idem:order:{user.id}:{idempotency_key}"
        cached = await redis.get(cache_key)
        if cached:
            return ApiResponse(**json.loads(cached))
            
    result = await trade_svc.place_order(req, str(user.id), db, redis)
    msg = "Order matched and trade settled." if result["matched"] else "Order placed in order book."
    
    response = ApiResponse(data=result, message=msg)
    
    if idempotency_key:
        cache_key = f"idem:order:{user.id}:{idempotency_key}"
        await redis.set(cache_key, json.dumps(response.model_dump(mode="json")), ex=86400) # 24 hours
        
    return response


@router.delete("/{order_id}", response_model=ApiResponse[dict], summary="Cancel an open order")
def cancel_order(
    order_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = trade_svc.cancel_order(order_id, str(user.id), db)
    return ApiResponse(data=result, message="Order cancelled.")
