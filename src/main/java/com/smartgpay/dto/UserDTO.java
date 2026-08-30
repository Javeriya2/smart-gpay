package com.smartgpay.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class UserDTO {

    private String name;

    @JsonProperty("upi_id")
    private String upiId;

    private BigDecimal balance;

    public UserDTO() {
    }

    public UserDTO(String name, String upiId, BigDecimal balance) {
        this.name = name;
        this.upiId = upiId;
        this.balance = balance;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
