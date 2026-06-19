from __future__ import annotations

import logging
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.wallet_repo import WalletRepository, WalletTransactionRepository

logger = logging.getLogger(__name__)


def get_wallet(org_id: str, db: Session) -> dict:
    repo = WalletRepository(db)
    wallet = repo.get_or_create(UUID(org_id))
    db.commit()
    return {
        "id": str(wallet.id),
        "organization_id": str(wallet.organization_id),
        "balance": float(wallet.balance),
        "currency": wallet.currency,
    }


def get_all_wallets(db: Session) -> list[dict]:
    wallets = WalletRepository(db).get_all()
    return [
        {
            "id": str(w.id),
            "organization_id": str(w.organization_id),
            "balance": float(w.balance),
            "currency": w.currency,
        }
        for w in wallets
    ]


def admin_add_funds(
    org_id: UUID, amount: Decimal, description: str | None, admin_user_id: str, db: Session
) -> dict:
    repo = WalletRepository(db)
    txn_repo = WalletTransactionRepository(db)

    wallet = repo.get_or_create(org_id)
    new_balance = wallet.balance + amount
    repo.update_balance(wallet, new_balance)

    txn = txn_repo.create(
        wallet_id=wallet.id,
        organization_id=org_id,
        txn_type="ADMIN_CREDIT",
        amount=amount,
        balance_after=new_balance,
        description=description or f"Admin added ₹{amount}",
        created_by=UUID(admin_user_id),
    )

    db.commit()
    logger.info("Admin %s credited ₹%s to org %s", admin_user_id, amount, org_id)

    return {
        "wallet_id": str(wallet.id),
        "organization_id": str(org_id),
        "amount_added": float(amount),
        "new_balance": float(new_balance),
        "transaction_id": str(txn.id),
    }


def debit_buyer(
    org_id: str, amount: Decimal, trade_id: UUID, db: Session
) -> None:
    """Debit buyer wallet during trade settlement. Raises if insufficient balance."""
    repo = WalletRepository(db)
    txn_repo = WalletTransactionRepository(db)

    wallet = repo.get_or_create(UUID(org_id))
    if wallet.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient wallet balance. Required: ₹{amount}, Available: ₹{wallet.balance}",
        )

    new_balance = wallet.balance - amount
    repo.update_balance(wallet, new_balance)

    txn_repo.create(
        wallet_id=wallet.id,
        organization_id=UUID(org_id),
        txn_type="TRADE_DEBIT",
        amount=-amount,
        balance_after=new_balance,
        reference_id=trade_id,
        description=f"Payment for trade {str(trade_id)[:8]}",
    )


def credit_seller(
    org_id: str, amount: Decimal, trade_id: UUID, db: Session
) -> None:
    """Credit seller wallet during trade settlement."""
    repo = WalletRepository(db)
    txn_repo = WalletTransactionRepository(db)

    wallet = repo.get_or_create(UUID(org_id))
    new_balance = wallet.balance + amount
    repo.update_balance(wallet, new_balance)

    txn_repo.create(
        wallet_id=wallet.id,
        organization_id=UUID(org_id),
        txn_type="TRADE_CREDIT",
        amount=amount,
        balance_after=new_balance,
        reference_id=trade_id,
        description=f"Payment received for trade {str(trade_id)[:8]}",
    )


def list_transactions(org_id: str, db: Session) -> list[dict]:
    txns = WalletTransactionRepository(db).list_by_org(org_id)
    return [
        {
            "id": str(t.id),
            "wallet_id": str(t.wallet_id),
            "organization_id": str(t.organization_id),
            "txn_type": t.txn_type,
            "amount": float(t.amount),
            "balance_after": float(t.balance_after),
            "reference_id": str(t.reference_id) if t.reference_id else None,
            "description": t.description,
            "created_by": str(t.created_by) if t.created_by else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in txns
    ]


def list_all_transactions(db: Session) -> list[dict]:
    txns = WalletTransactionRepository(db).list_all()
    return [
        {
            "id": str(t.id),
            "wallet_id": str(t.wallet_id),
            "organization_id": str(t.organization_id),
            "txn_type": t.txn_type,
            "amount": float(t.amount),
            "balance_after": float(t.balance_after),
            "reference_id": str(t.reference_id) if t.reference_id else None,
            "description": t.description,
            "created_by": str(t.created_by) if t.created_by else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in txns
    ]
