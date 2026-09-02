-- ============================================
-- SMART GPAY DATABASE SCHEMA (PostgreSQL)
-- ============================================

-- Drop existing objects if they exist (for fresh starts)
DROP TABLE IF EXISTS transaction_status_log CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS contact_aliases CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;

-- ============================================
-- ENUM: Transaction Status
-- ============================================
CREATE TYPE transaction_status AS ENUM (
    'INITIATED',
    'INTENT_EXTRACTED',
    'AWAITING_CLARIFICATION',
    'CONTACT_RESOLVED',
    'VALIDATION_FAILED',
    'FRAUD_WARNING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'ABANDONED'
);

-- ============================================
-- TABLE: users
-- People who use Smart GPay to send money
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    upi_id VARCHAR(255) NOT NULL UNIQUE,  -- Mocked VPA, e.g. "javi@okaxis"
    balance DECIMAL(12, 2) NOT NULL DEFAULT 10000.00,  -- Starting balance
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT balance_positive CHECK (balance >= 0)
);

CREATE INDEX idx_users_upi_id ON users(upi_id);

-- ============================================
-- TABLE: contacts
-- Payees a user can send money to
-- Duplicate names allowed on purpose
-- ============================================
CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    vpa VARCHAR(255) NOT NULL,  -- Mocked VPA, e.g. "rahul.blr@okaxis"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT vpa_unique_per_user UNIQUE(user_id, vpa)
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_name ON contacts(name);

-- ============================================
-- TABLE: contact_aliases
-- Alternate names for the SAME contact
-- One contact -> many aliases
-- ============================================
CREATE TABLE contact_aliases (
    id BIGSERIAL PRIMARY KEY,
    contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_aliases_contact_id ON contact_aliases(contact_id);
CREATE INDEX idx_contact_aliases_alias ON contact_aliases(alias);

-- ============================================
-- TABLE: transactions
-- A single payment attempt/request
-- ============================================
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    original_request_id VARCHAR(255),
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    raw_query TEXT,  -- Original NL input, e.g. "send 500 to Rahul"
    status transaction_status NOT NULL DEFAULT 'INITIATED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver_id ON transactions(receiver_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_original_request_id ON transactions(original_request_id);

-- ============================================
-- TABLE: transaction_status_log
-- Full history/audit trail per transaction
-- One transaction -> many status log entries
-- ============================================
CREATE TABLE transaction_status_log (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    status transaction_status NOT NULL,
    note TEXT,  -- e.g. "insufficient balance: ₹200 short"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_status_log_transaction_id ON transaction_status_log(transaction_id);
CREATE INDEX idx_transaction_status_log_status ON transaction_status_log(status);
CREATE INDEX idx_transaction_status_log_created_at ON transaction_status_log(created_at);
