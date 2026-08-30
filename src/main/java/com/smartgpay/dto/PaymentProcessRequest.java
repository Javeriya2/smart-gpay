package com.smartgpay.dto;

public class PaymentProcessRequest {

    private Long userId;
    private String userMessage;
    private Boolean confirmFraudWarning = false;

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
}
