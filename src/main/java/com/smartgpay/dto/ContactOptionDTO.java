package com.smartgpay.dto;

import com.smartgpay.model.Contact;

public class ContactOptionDTO {

    private Long contactId;
    private String fullName;
    private String lastName;
    private String vpa;

    public ContactOptionDTO() {
    }

    public ContactOptionDTO(Long contactId, String fullName, String lastName, String vpa) {
        this.contactId = contactId;
        this.fullName = fullName;
        this.lastName = lastName;
        this.vpa = vpa;
    }

    public static ContactOptionDTO fromContact(Contact contact) {
        if (contact == null) return null;

        String name = contact.getName();
        String lastNameStr = "";
        if (name != null && name.contains(" ")) {
            String[] parts = name.split("\\s+");
            lastNameStr = parts[parts.length - 1];
        }

        return new ContactOptionDTO(
                contact.getId(),
                contact.getName(),
                lastNameStr,
                contact.getVpa()
        );
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getVpa() {
        return vpa;
    }

    public void setVpa(String vpa) {
        this.vpa = vpa;
    }
}
