package com.smartgpay.dto;

public class ContactDTO {

    private Long userId;
    private String name;
    private String vpa;

    public ContactDTO() {
    }

    public ContactDTO(Long userId, String name, String vpa) {
        this.userId = userId;
        this.name = name;
        this.vpa = vpa;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVpa() {
        return vpa;
    }

    public void setVpa(String vpa) {
        this.vpa = vpa;
    }
}
