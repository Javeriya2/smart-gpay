package com.smartgpay.controller;

import com.smartgpay.dto.UserDTO;
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
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;

    public UserController(UserRepository userRepository, ContactRepository contactRepository) {
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                return ResponseEntity.ok(userOptional.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with id: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving user: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDTO userDTO) {
        try {
            if (userDTO.getName() == null || userDTO.getName().trim().isEmpty() ||
                userDTO.getUpiId() == null || userDTO.getUpiId().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Name and UPI ID are required.");
            }

            User user = new User(userDTO.getName(), userDTO.getUpiId(), userDTO.getBalance());
            User savedUser = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create user: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}/contacts")
    public ResponseEntity<?> getUserContacts(@PathVariable Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with id: " + userId);
            }
            List<Contact> contacts = contactRepository.findByUserId(userId);
            return ResponseEntity.ok(contacts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving contacts: " + e.getMessage());
        }
    }
}
