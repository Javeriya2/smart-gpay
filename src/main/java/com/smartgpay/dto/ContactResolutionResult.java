package com.smartgpay.dto;

import com.smartgpay.model.Contact;
import java.util.ArrayList;
import java.util.List;

public class ContactResolutionResult {

    private Contact matchedContact;
    private List<Contact> ambiguousContacts = new ArrayList<>();
    private boolean isAmbiguous;
    private boolean isFound;
    private String searchName;

    public ContactResolutionResult() {
    }

    public ContactResolutionResult(Contact matchedContact) {
        this.matchedContact = matchedContact;
        this.isFound = matchedContact != null;
        this.isAmbiguous = false;
    }

    public ContactResolutionResult(List<Contact> ambiguousContacts) {
        this.ambiguousContacts = (ambiguousContacts != null) ? ambiguousContacts : new ArrayList<>();
        this.isFound = !this.ambiguousContacts.isEmpty();
        this.isAmbiguous = this.ambiguousContacts.size() > 1;
        if (this.ambiguousContacts.size() == 1) {
            this.matchedContact = this.ambiguousContacts.get(0);
        }
    }

    public Contact getMatchedContact() {
        return matchedContact;
    }

    public void setMatchedContact(Contact matchedContact) {
        this.matchedContact = matchedContact;
    }

    public List<Contact> getAmbiguousContacts() {
        return ambiguousContacts;
    }

    public void setAmbiguousContacts(List<Contact> ambiguousContacts) {
        this.ambiguousContacts = ambiguousContacts;
    }

    public boolean isAmbiguous() {
        return isAmbiguous;
    }

    public void setAmbiguous(boolean ambiguous) {
        isAmbiguous = ambiguous;
    }

    public boolean isFound() {
        return isFound;
    }

    public void setFound(boolean found) {
        isFound = found;
    }

    public String getSearchName() {
        return searchName;
    }

    public void setSearchName(String searchName) {
        this.searchName = searchName;
    }
}
