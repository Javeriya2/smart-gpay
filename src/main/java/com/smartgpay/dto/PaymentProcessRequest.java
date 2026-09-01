package com.smartgpay.dto;

public class PaymentProcessRequest {

    private Long userId;
    private String userMessage;
    private Boolean confirmFraudWarning = false;
    private Long transactionId;
    private String originalRequestId;

    public PaymentProcessRequest() {
    }

    public PaymentProcessRequest(Long userId, String userMessage) {
        this.userId = userId;
        this.userMessage = userMessage;
        this.confirmFraudWarning = false;
    }

    public PaymentProcessRequest(Long userId, String userMessage, Boolean confirmFraudWarning) {
        this.userId = userId;
        this.userMessage = userMessage;
        this.confirmFraudWarning = confirmFraudWarning != null ? confirmFraudWarning : false;
    }

    public PaymentProcessRequest(Long userId, String userMessage, Boolean confirmFraudWarning, Long transactionId, String originalRequestId) {
        this.userId = userId;
        this.userMessage = userMessage;
        this.confirmFraudWarning = confirmFraudWarning != null ? confirmFraudWarning : false;
        this.transactionId = transactionId;
        this.originalRequestId = originalRequestId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public Boolean getConfirmFraudWarning() {
        return confirmFraudWarning;
    }

    public void setConfirmFraudWarning(Boolean confirmFraudWarning) {
        this.confirmFraudWarning = confirmFraudWarning;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getOriginalRequestId() {
        return originalRequestId;
    }

    public void setOriginalRequestId(String originalRequestId) {
        this.originalRequestId = originalRequestId;
    }
}
