from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from ..models.order import MarketOrder, Trade


class MarketOrderRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> MarketOrder:
        order = MarketOrder(id=uuid.uuid4(), **kwargs)
        self.db.add(order)
        self.db.flush()
        return order

    def find_open_counterparty(
        self,
        order_type: str,
        price_per_unit: Decimal,
        vintage_year: Optional[int] = None,
        project_type: Optional[str] = None,
    ) -> Optional[MarketOrder]:
        counter_type = "SELL" if order_type == "BUY" else "BUY"
        q = self.db.query(MarketOrder).filter(
            MarketOrder.order_type == counter_type,
            MarketOrder.status == "OPEN",
        )
        if vintage_year:
            q = q.filter(MarketOrder.vintage_year == vintage_year)
        if project_type:
            q = q.filter(MarketOrder.project_type == project_type)
        if counter_type == "SELL":
            q = q.filter(MarketOrder.price_per_unit <= float(price_per_unit))
        else:
            q = q.filter(MarketOrder.price_per_unit >= float(price_per_unit))
        return q.order_by(MarketOrder.created_at).first()

    def mark_filled(self, order_id: str) -> None:
        self.db.query(MarketOrder).filter(MarketOrder.id == order_id).update({"status": "FILLED"})

    def mark_cancelled(self, order_id: str) -> MarketOrder:
        order = self.db.query(MarketOrder).filter(MarketOrder.id == order_id).first()
        if order:
            order.status = "CANCELLED"
            self.db.flush()
        return order


class TradeRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> Trade:
        trade = Trade(id=uuid.uuid4(), **kwargs)
        self.db.add(trade)
        self.db.flush()
        return trade
