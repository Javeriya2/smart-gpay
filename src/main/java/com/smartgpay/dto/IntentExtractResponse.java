package com.smartgpay.dto;

public class IntentExtractResponse {

    private String userMessage;
    private Object intent;
    private String status;

    public IntentExtractResponse() {
    }

    public IntentExtractResponse(String userMessage, Object intent, String status) {
        this.userMessage = userMessage;
        this.intent = intent;
        this.status = status;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public Object getIntent() {
        return intent;
    }

    public void setIntent(Object intent) {
        this.intent = intent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
