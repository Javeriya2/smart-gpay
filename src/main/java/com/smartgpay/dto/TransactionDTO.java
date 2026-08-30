package com.smartgpay.dto;

import com.smartgpay.model.TransactionStatus;
import java.math.BigDecimal;

public class TransactionDTO {

    private Long senderId;
    private Long receiverId;
    private BigDecimal amount;
    private String rawQuery;
    private TransactionStatus status;

    public TransactionDTO() {
    }

    public TransactionDTO(Long senderId, Long    receiverId, BigDecimal amount, String rawQuery, TransactionStatus status) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.amount = amount;
        this.rawQuery = rawQuery;
        this.status = status;
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

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }
}
