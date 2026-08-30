package com.smartgpay.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ClarificationContext {

    private Long userId;
    private BigDecimal amount;
    private String note;
    private String rawRecipientName;
    private String originalRequestId;
    private Long transactionId;
    private List<ContactOptionDTO> ambiguousContacts = new ArrayList<>();

    public ClarificationContext() {
    }

    public ClarificationContext(Long userId, BigDecimal amount, String note, String rawRecipientName, String originalRequestId, Long transactionId, List<ContactOptionDTO> ambiguousContacts) {
        this.userId = userId;
        this.amount = amount;
        this.note = note;
        this.rawRecipientName = rawRecipientName;
        this.originalRequestId = originalRequestId;
        this.transactionId = transactionId;
        this.ambiguousContacts = (ambiguousContacts != null) ? ambiguousContacts : new ArrayList<>();
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getRawRecipientName() {
        return rawRecipientName;
    }

    public void setRawRecipientName(String rawRecipientName) {
        this.rawRecipientName = rawRecipientName;
    }

    public String getOriginalRequestId() {
        return originalRequestId;
    }

    public void setOriginalRequestId(String originalRequestId) {
        this.originalRequestId = originalRequestId;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public List<ContactOptionDTO> getAmbiguousContacts() {
        return ambiguousContacts;
    }

    public void setAmbiguousContacts(List<ContactOptionDTO> ambiguousContacts) {
        this.ambiguousContacts = ambiguousContacts;
    }
}
