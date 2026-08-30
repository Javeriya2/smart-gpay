package com.smartgpay.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.smartgpay.model.Contact;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentProcessResponse {

    private String status;
    private Long transactionId;
    private String originalRequestId;
    private String userMessage;
    private String confirmation;
    private String message;
    private BigDecimal amount;
    private String recipientName;
    private BigDecimal newBalance;
    private List<Contact> ambiguousContacts;
    private ClarificationContext clarificationContext;
    private Boolean proceedWithConfirmation;

    public PaymentProcessResponse() {
    }

    public PaymentProcessResponse(String status, Long transactionId, String userMessage, String confirmation, BigDecimal amount, String recipientName, BigDecimal newBalance) {
        this.status = status;
        this.transactionId = transactionId;
        this.userMessage = userMessage;
        this.confirmation = confirmation;
        this.amount = amount;
        this.recipientName = recipientName;
        this.newBalance = newBalance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getConfirmation() {
        return confirmation;
    }

    public void setConfirmation(String confirmation) {
        this.confirmation = confirmation;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public BigDecimal getNewBalance() {
        return newBalance;
    }

    public void setNewBalance(BigDecimal newBalance) {
        this.newBalance = newBalance;
    }

    public List<Contact> getAmbiguousContacts() {
        return ambiguousContacts;
    }

    public void setAmbiguousContacts(List<Contact> ambiguousContacts) {
        this.ambiguousContacts = ambiguousContacts;
    }

    public ClarificationContext getClarificationContext() {
        return clarificationContext;
    }

    public void setClarificationContext(ClarificationContext clarificationContext) {
        this.clarificationContext = clarificationContext;
    }

    public Boolean getProceedWithConfirmation() {
        return proceedWithConfirmation;
    }

    public void setProceedWithConfirmation(Boolean proceedWithConfirmation) {
        this.proceedWithConfirmation = proceedWithConfirmation;
    }
}
