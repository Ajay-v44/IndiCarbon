-- IndiCarbon AI — Wallet System Migration
-- Adds organization wallets and transaction ledger for marketplace payments.

-- ─── Organization Wallets ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    balance         DECIMAL NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    currency        VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Wallet Transactions Ledger ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id       UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    txn_type        VARCHAR(30) NOT NULL,
    amount          DECIMAL NOT NULL,
    balance_after   DECIMAL NOT NULL,
    reference_id    UUID,
    description     TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- txn_type values:
--   ADMIN_CREDIT   — admin adds funds
--   ADMIN_DEBIT    — admin removes funds
--   TRADE_DEBIT    — buyer pays for credits
--   TRADE_CREDIT   — seller receives payment
--   REFUND         — order cancelled / refund

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_org_id ON wallet_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_wallets_org_id ON wallets(organization_id);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
