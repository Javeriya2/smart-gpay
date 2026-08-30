package com.smartgpay.dto;

public class PaymentCancelRequest {

    private String transactionId;
    private String originalRequestId;
    private String reason;

    public PaymentCancelRequest() {
    }

    public PaymentCancelRequest(String transactionId, String originalRequestId, String reason) {
        this.transactionId = transactionId;
        this.originalRequestId = originalRequestId;
        this.reason = reason;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getOriginalRequestId() {
        return originalRequestId;
    }

    public void setOriginalRequestId(String originalRequestId) {
        this.originalRequestId = originalRequestId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
