package com.smartgpay.model;

public enum TransactionStatus {
    INITIATED,
    INTENT_EXTRACTED,
    AWAITING_CLARIFICATION,
    CONTACT_RESOLVED,
    VALIDATION_FAILED,
    FRAUD_WARNING,
    PROCESSING,
    SUCCESS,
    FAILED,
    ABANDONED
}
