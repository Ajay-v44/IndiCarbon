-- Proposals table: RFQ / negotiated order flow for carbon credit trading
CREATE TABLE IF NOT EXISTS proposals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sell_order_id   UUID NOT NULL REFERENCES market_orders(id) ON DELETE CASCADE,
    buyer_org_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    seller_org_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    asking_price    DECIMAL NOT NULL CHECK (asking_price > 0),
    proposed_price  DECIMAL NOT NULL CHECK (proposed_price > 0),
    total_value     DECIMAL NOT NULL CHECK (total_value >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','ACCEPTED','REJECTED','CANCELLED','EXPIRED')),
    buyer_note      VARCHAR(500),
    rejection_reason VARCHAR(500),
    trade_id        UUID REFERENCES trades(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    project_type    VARCHAR(100),
    vintage_year    INTEGER
);

CREATE INDEX idx_proposals_buyer_org   ON proposals (buyer_org_id, created_at DESC);
CREATE INDEX idx_proposals_seller_org  ON proposals (seller_org_id, created_at DESC);
CREATE INDEX idx_proposals_sell_order  ON proposals (sell_order_id);
CREATE INDEX idx_proposals_status      ON proposals (status) WHERE status = 'PENDING';

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
