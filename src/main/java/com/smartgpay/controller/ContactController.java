package com.smartgpay.controller;

import com.smartgpay.dto.ContactDTO;
import com.smartgpay.model.Contact;
import com.smartgpay.model.User;
import com.smartgpay.repository.ContactRepository;
import com.smartgpay.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public ContactController(ContactRepository contactRepository, UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getContactById(@PathVariable Long id) {
        try {
            Optional<Contact> contactOptional = contactRepository.findById(id);
            if (contactOptional.isPresent()) {
                return ResponseEntity.ok(contactOptional.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Contact not found with id: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving contact: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createContact(@RequestBody ContactDTO contactDTO) {
        try {
            if (contactDTO.getUserId() == null || contactDTO.getName() == null || contactDTO.getVpa() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("userId, name, and vpa are required.");
            }

            Optional<User> userOptional = userRepository.findById(contactDTO.getUserId());
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with id: " + contactDTO.getUserId());
            }

            Contact contact = new Contact(userOptional.get(), contactDTO.getName(), contactDTO.getVpa());
            Contact savedContact = contactRepository.save(contact);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedContact);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create contact: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchContacts(@RequestParam Long userId, @RequestParam String name) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with id: " + userId);
            }
            List<Contact> contacts = contactRepository.findByUserIdAndNameIgnoreCase(userId, name);
            return ResponseEntity.ok(contacts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching contacts: " + e.getMessage());
        }
    }
}
