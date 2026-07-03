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
        self.db.flush()

    def transfer_ownership(self, credit_ids: list[str], new_owner_id: str) -> None:
        self.db.query(CarbonCredit).filter(
            CarbonCredit.id.in_(credit_ids)
        ).update({"current_owner_id": new_owner_id, "status": "ISSUED"}, synchronize_session="fetch")
        self.db.flush()

    def get_portfolio_summary(self, org_id: str) -> dict:
        """
        Return a portfolio summary for an organization.

        Credit statuses:
          ISSUED   — owned, available for trading or applying
          APPLIED  — explicitly applied against the org's emissions (reduces Net Carbon Position)
          RETIRED  — permanently burned / offset certificate issued
          PENDING_TRANSFER — locked in an active trade
        """
        all_credits = self.db.query(CarbonCredit).filter(
            CarbonCredit.current_owner_id == org_id
        ).all()

        issued = [c for c in all_credits if c.status == "ISSUED"]
        applied = [c for c in all_credits if c.status == "APPLIED"]
        retired = [c for c in all_credits if c.status == "RETIRED"]
        pending = [c for c in all_credits if c.status == "PENDING_TRANSFER"]

        sold_count = self.db.query(CarbonCredit).filter(
            CarbonCredit.initial_owner_id == org_id,
            CarbonCredit.current_owner_id != org_id,
            CarbonCredit.status != "RETIRED",
        ).count()

        issued_count = len(issued)
        applied_count = len(applied)
        retired_count = len(retired)
        # Total offsets = applied + retired (both reduce net carbon position)
        total_offsets = applied_count + retired_count

        return {
            "total_credits_owned": len(all_credits),
            "issued": issued_count,
            "applied": applied_count,
            "retired": retired_count,
            "pending_transfer": len(pending),
            "sold": sold_count,
            "credits_available": issued_count,
            # tCO2e offset = applied + retired (each credit = 1 tCO2e)
            "credits_applied_tco2e": float(applied_count),
            "credits_retired_tco2e": float(retired_count),
            "total_offset_tco2e": float(total_offsets),
        }

    def apply_to_emissions(self, org_id: str, quantity: int) -> list[str]:
        """
        Apply N ISSUED credits against org's carbon emissions.
        Changes status: ISSUED → APPLIED.
        Applied credits reduce the Net Carbon Position.
        Returns list of applied credit IDs.
        """
        credits = (
            self.db.query(CarbonCredit)
            .filter(
                CarbonCredit.current_owner_id == org_id,
                CarbonCredit.status == "ISSUED",
            )
            .limit(quantity)
            .all()
        )
        if not credits:
            return []
        applied_ids = []
        for c in credits:
            c.status = "APPLIED"
            applied_ids.append(str(c.id))
        self.db.flush()
        return applied_ids

    def retire_by_quantity(self, org_id: str, quantity: int) -> list[str]:
        """Retire N issued credits (FIFO). Returns list of retired IDs."""
        credits = (
            self.db.query(CarbonCredit)
            .filter(
                CarbonCredit.current_owner_id == org_id,
                CarbonCredit.status == "ISSUED",
            )
            .limit(quantity)
            .all()
        )
        retired_ids = []
        for c in credits:
            c.status = "RETIRED"
            retired_ids.append(str(c.id))
        self.db.flush()
        return retired_ids

    def get_credit_ledger(self, org_id: str, limit: int = 50, offset: int = 0) -> dict:
        """
        Return all credit events for an organization as a ledger.
        Includes: owned, applied, retired, and sold credits.
        """
        # All credits ever owned by this org (current + sold)
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
                "tco2e": 1.0,
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
                "tco2e": 1.0,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })

        result.sort(key=lambda x: x["created_at"] or "", reverse=True)
        total = len(result)
        paginated_result = result[offset:offset+limit]
        return {"ledger": paginated_result, "total": total, "limit": limit, "offset": offset}
