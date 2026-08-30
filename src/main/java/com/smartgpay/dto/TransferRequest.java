package com.smartgpay.dto;

import java.math.BigDecimal;

public class TransferRequest {

    private Long senderId;
    private Long receiverId;
    private BigDecimal amount;
    private String rawQuery;

    public TransferRequest() {
    }

    public TransferRequest(Long senderId, Long receiverId, BigDecimal amount, String rawQuery) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.amount = amount;
        this.rawQuery = rawQuery;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getRawQuery() {
        return rawQuery;
    }

    public void setRawQuery(String rawQuery) {
        this.rawQuery = rawQuery;
    }
}
