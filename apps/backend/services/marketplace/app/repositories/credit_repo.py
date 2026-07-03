from __future__ import annotations

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
        credits = (
            self.db.query(CarbonCredit)
            .filter(
                CarbonCredit.current_owner_id == seller_id,
                CarbonCredit.status == "ISSUED",
            )
            .order_by(CarbonCredit.created_at.asc())
            .all()
        )
        total_available = sum(c.quantity for c in credits)
        if total_available < quantity:
            return []

        selected = []
        collected = 0
        import uuid
        from datetime import datetime, timezone
        for c in credits:
            needed = quantity - collected
            if needed <= 0:
                break
            if c.quantity <= needed:
                selected.append(c)
                collected += c.quantity
            else:
                # Split this batch
                c.quantity -= needed
                self.db.flush()

                split_credit = CarbonCredit(
                    id=uuid.uuid4(),
                    serial_number=f"CCT-{uuid.uuid4().hex[:16].upper()}-{seller_id[:8]}",
                    vintage_year=c.vintage_year,
                    project_type=c.project_type,
                    initial_owner_id=c.initial_owner_id,
                    current_owner_id=c.current_owner_id,
                    status="ISSUED",
                    quantity=needed,
                    created_at=c.created_at
                )
                self.db.add(split_credit)
                self.db.flush()
                selected.append(split_credit)
                collected += needed
                break
        return selected

    def set_status_bulk(self, credit_ids: list[str], new_status: str) -> None:
        self.db.query(CarbonCredit).filter(
            CarbonCredit.id.in_(credit_ids)
        ).update({"status": new_status}, synchronize_session="fetch")
        self.db.flush()

    def transfer_ownership(self, credit_ids: list[str], new_owner_id: str) -> None:
        self.db.query(CarbonCredit).filter(
            CarbonCredit.id.in_(credit_ids)
        ).update({"current_owner_id": new_owner_id, "status": "ISSUED"}, synchronize_session="fetch")
        self.db.flush()

    def get_portfolio_summary(self, org_id: str) -> dict:
        """
        Return a portfolio summary for an organization based on credit quantities.
        """
        all_credits = self.db.query(CarbonCredit).filter(
            CarbonCredit.current_owner_id == org_id
        ).all()

        issued_count = sum(c.quantity for c in all_credits if c.status == "ISSUED")
        applied_count = sum(c.quantity for c in all_credits if c.status == "APPLIED")
        retired_count = sum(c.quantity for c in all_credits if c.status == "RETIRED")
        pending_count = sum(c.quantity for c in all_credits if c.status == "PENDING_TRANSFER")

        sold_credits = self.db.query(CarbonCredit).filter(
            CarbonCredit.initial_owner_id == org_id,
            CarbonCredit.current_owner_id != org_id,
            CarbonCredit.status != "RETIRED",
        ).all()
        sold_count = sum(c.quantity for c in sold_credits)

        total_offsets = applied_count + retired_count

        return {
            "total_credits_owned": sum(c.quantity for c in all_credits),
            "issued": issued_count,
            "applied": applied_count,
            "retired": retired_count,
            "pending_transfer": pending_count,
            "sold": sold_count,
            "credits_available": issued_count,
            "credits_applied_tco2e": float(applied_count),
            "credits_retired_tco2e": float(retired_count),
            "total_offset_tco2e": float(total_offsets),
        }

    def apply_to_emissions(self, org_id: str, quantity: int) -> list[str]:
        """
        Apply N ISSUED credits against org's carbon emissions (FIFO splitting).
        """
        credits = (
            self.db.query(CarbonCredit)
            .filter(
                CarbonCredit.current_owner_id == org_id,
                CarbonCredit.status == "ISSUED",
            )
            .order_by(CarbonCredit.created_at.asc())
            .all()
        )
        total_available = sum(c.quantity for c in credits)
        if total_available < quantity:
            return []

        applied_ids = []
        collected = 0
        import uuid
        from datetime import datetime, timezone
        for c in credits:
            needed = quantity - collected
            if needed <= 0:
                break
            if c.quantity <= needed:
                c.status = "APPLIED"
                applied_ids.append(str(c.id))
                collected += c.quantity
            else:
                # Split
                c.quantity -= needed
                self.db.flush()

                split_credit = CarbonCredit(
                    id=uuid.uuid4(),
                    serial_number=f"CCT-{uuid.uuid4().hex[:16].upper()}-{org_id[:8]}",
                    vintage_year=c.vintage_year,
                    project_type=c.project_type,
                    initial_owner_id=c.initial_owner_id,
                    current_owner_id=c.current_owner_id,
                    status="APPLIED",
                    quantity=needed,
                    created_at=c.created_at
                )
                self.db.add(split_credit)
                self.db.flush()
                applied_ids.append(str(split_credit.id))
                collected += needed
                break
        self.db.flush()
        return applied_ids

    def retire_by_quantity(self, org_id: str, quantity: int) -> list[str]:
        """Retire N issued credits (FIFO splitting)."""
        credits = (
            self.db.query(CarbonCredit)
            .filter(
                CarbonCredit.current_owner_id == org_id,
                CarbonCredit.status == "ISSUED",
            )
            .order_by(CarbonCredit.created_at.asc())
            .all()
        )
        total_available = sum(c.quantity for c in credits)
        if total_available < quantity:
            return []

        retired_ids = []
        collected = 0
        import uuid
        from datetime import datetime, timezone
        for c in credits:
            needed = quantity - collected
            if needed <= 0:
                break
            if c.quantity <= needed:
                c.status = "RETIRED"
                retired_ids.append(str(c.id))
                collected += c.quantity
            else:
                # Split
                c.quantity -= needed
                self.db.flush()

                split_credit = CarbonCredit(
                    id=uuid.uuid4(),
                    serial_number=f"CCT-{uuid.uuid4().hex[:16].upper()}-{org_id[:8]}",
                    vintage_year=c.vintage_year,
                    project_type=c.project_type,
                    initial_owner_id=c.initial_owner_id,
                    current_owner_id=c.current_owner_id,
                    status="RETIRED",
                    quantity=needed,
                    created_at=c.created_at
                )
                self.db.add(split_credit)
                self.db.flush()
                retired_ids.append(str(split_credit.id))
                collected += needed
                break
        self.db.flush()
        return retired_ids

    def get_credit_ledger(self, org_id: str, limit: int = 50, offset: int = 0) -> dict:
        """
        Return all credit events for an organization as a ledger based on quantities.
        """
        owned = self.db.query(CarbonCredit).filter(
            CarbonCredit.current_owner_id == org_id
        ).order_by(CarbonCredit.created_at.desc()).all()

        sold = self.db.query(CarbonCredit).filter(
            CarbonCredit.initial_owner_id == org_id,
            CarbonCredit.current_owner_id != org_id,
        ).order_by(CarbonCredit.created_at.desc()).all()

        result = []
        for c in owned:
            result.append({
                "id": str(c.id),
                "serial_number": c.serial_number,
                "project_type": c.project_type,
                "vintage_year": c.vintage_year,
                "status": c.status,
                "event_type": "APPLIED" if c.status == "APPLIED" else
                              "RETIRED" if c.status == "RETIRED" else
                              "ISSUED",
                "tco2e": float(c.quantity),
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })

        for c in sold:
            result.append({
                "id": str(c.id),
                "serial_number": c.serial_number,
                "project_type": c.project_type,
                "vintage_year": c.vintage_year,
                "status": "SOLD",
                "event_type": "SOLD",
                "tco2e": float(c.quantity),
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })

        result.sort(key=lambda x: x["created_at"] or "", reverse=True)
        total = len(result)
        paginated_result = result[offset:offset+limit]
        return {"ledger": paginated_result, "total": total, "limit": limit, "offset": offset}

