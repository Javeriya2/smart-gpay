package com.smartgpay.dto;

public class PaymentClarifyRequest {

    private String transactionId;
    private String originalRequestId;
    private Long selectedContactId;

    public PaymentClarifyRequest() {
    }

    public PaymentClarifyRequest(String transactionId, String originalRequestId, Long selectedContactId) {
        this.transactionId = transactionId;
        this.originalRequestId = originalRequestId;
        this.selectedContactId = selectedContactId;
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

    public Long getSelectedContactId() {
        return selectedContactId;
    }

    public void setSelectedContactId(Long selectedContactId) {
        this.selectedContactId = selectedContactId;
    }
}
