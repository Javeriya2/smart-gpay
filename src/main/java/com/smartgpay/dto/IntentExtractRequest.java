package com.smartgpay.dto;

public class IntentExtractRequest {

    private String userMessage;

    public IntentExtractRequest() {
    }

    public IntentExtractRequest(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }
}
