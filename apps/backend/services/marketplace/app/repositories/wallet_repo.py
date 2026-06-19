from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from ..models.wallet import Wallet, WalletTransaction


class WalletRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_or_create(self, organization_id: UUID) -> Wallet:
        wallet = self.db.query(Wallet).filter(
            Wallet.organization_id == str(organization_id)
        ).first()
        if not wallet:
            wallet = Wallet(
                id=uuid.uuid4(),
                organization_id=organization_id,
                balance=Decimal("0.00"),
            )
            self.db.add(wallet)
            self.db.flush()
        return wallet

    def get_by_org(self, organization_id: str) -> Optional[Wallet]:
        return self.db.query(Wallet).filter(
            Wallet.organization_id == organization_id
        ).first()

    def get_all(self) -> list[Wallet]:
        return self.db.query(Wallet).order_by(Wallet.created_at.desc()).all()

    def update_balance(self, wallet: Wallet, new_balance: Decimal) -> None:
        wallet.balance = new_balance
        wallet.updated_at = datetime.now(timezone.utc)
        self.db.flush()


class WalletTransactionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> WalletTransaction:
        txn = WalletTransaction(id=uuid.uuid4(), **kwargs)
        self.db.add(txn)
        self.db.flush()
        return txn

    def list_by_org(self, organization_id: str, limit: int = 100) -> list[WalletTransaction]:
        return self.db.query(WalletTransaction).filter(
            WalletTransaction.organization_id == organization_id
        ).order_by(WalletTransaction.created_at.desc()).limit(limit).all()

    def list_by_wallet(self, wallet_id: str, limit: int = 100) -> list[WalletTransaction]:
        return self.db.query(WalletTransaction).filter(
            WalletTransaction.wallet_id == wallet_id
        ).order_by(WalletTransaction.created_at.desc()).limit(limit).all()

    def list_all(self, limit: int = 200) -> list[WalletTransaction]:
        return self.db.query(WalletTransaction).order_by(
            WalletTransaction.created_at.desc()
        ).limit(limit).all()
