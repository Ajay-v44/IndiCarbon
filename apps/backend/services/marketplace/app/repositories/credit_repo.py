from __future__ import annotations

from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from ..models.credit import CarbonCredit


class CreditRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_owner(self, org_id: str, status: Optional[str] = None) -> list[CarbonCredit]:
        q = self.db.query(CarbonCredit).filter(CarbonCredit.current_owner_id == org_id)
        if status:
            q = q.filter(CarbonCredit.status == status)
        return q.order_by(CarbonCredit.created_at.desc()).all()

    def find_available_for_seller(self, seller_id: str, quantity: int) -> list[CarbonCredit]:
        return (
            self.db.query(CarbonCredit)
            .filter(
                CarbonCredit.current_owner_id == seller_id,
                CarbonCredit.status == "ISSUED",
            )
            .limit(quantity)
            .all()
        )

    def set_status_bulk(self, credit_ids: list[str], new_status: str) -> None:
        self.db.query(CarbonCredit).filter(
            CarbonCredit.id.in_(credit_ids)
        ).update({"status": new_status}, synchronize_session="fetch")

    def transfer_ownership(self, credit_ids: list[str], new_owner_id: str) -> None:
        self.db.query(CarbonCredit).filter(
            CarbonCredit.id.in_(credit_ids)
        ).update({"current_owner_id": new_owner_id, "status": "ISSUED"}, synchronize_session="fetch")
