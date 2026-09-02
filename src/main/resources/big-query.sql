-- ============================================
-- SMART GPAY - BIGQUERY SCHEMA CREATION SCRIPT
-- Dataset: smartgpay_analytics
-- ============================================

-- 1. TABLE: users
CREATE TABLE IF NOT EXISTS `smartgpay_analytics.users` (
    id INT64,
    name STRING,
    upi_id STRING,
    balance NUMERIC,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 2. TABLE: contacts
CREATE TABLE IF NOT EXISTS `smartgpay_analytics.contacts` (
    id INT64,
    user_id INT64,
    name STRING,
    vpa STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 3. TABLE: contact_aliases
CREATE TABLE IF NOT EXISTS `smartgpay_analytics.contact_aliases` (
    id INT64,
    contact_id INT64,
    alias STRING,
    created_at TIMESTAMP
);

-- 4. TABLE: transactions
CREATE TABLE IF NOT EXISTS `smartgpay_analytics.transactions` (
    id INT64,
    original_request_id STRING,
    sender_id INT64,
    receiver_id INT64,
    amount NUMERIC,
    raw_query STRING,
    status STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 5. TABLE: transaction_status_log
CREATE TABLE IF NOT EXISTS `smartgpay_analytics.transaction_status_log` (
    id INT64,
    transaction_id INT64,
    status STRING,
    note STRING,
    created_at TIMESTAMP
);