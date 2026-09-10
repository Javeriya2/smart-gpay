package com.smartgpay.controller;

import com.smartgpay.dto.TransactionDTO;
import com.smartgpay.dto.TransactionHistoryDTO;
import com.smartgpay.model.Contact;
import com.smartgpay.model.Transaction;
import com.smartgpay.model.TransactionStatus;
import com.smartgpay.model.User;
import com.smartgpay.repository.ContactRepository;
import com.smartgpay.repository.TransactionRepository;
import com.smartgpay.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                 UserRepository userRepository,
                                 ContactRepository contactRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        try {
            Optional<Transaction> transactionOptional = transactionRepository.findById(id);
            if (transactionOptional.isPresent()) {
                return ResponseEntity.ok(transactionOptional.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Transaction not found with id: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving transaction: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody TransactionDTO transactionDTO) {
        try {
            if (transactionDTO.getSenderId() == null ||
                transactionDTO.getReceiverId() == null ||
                transactionDTO.getAmount() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("senderId, receiverId, and amount are required.");
            }

            Optional<User> senderOptional = userRepository.findById(transactionDTO.getSenderId());
            if (senderOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Sender user not found with id: " + transactionDTO.getSenderId());
            }

            Optional<Contact> receiverOptional = contactRepository.findById(transactionDTO.getReceiverId());
            if (receiverOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Receiver contact not found with id: " + transactionDTO.getReceiverId());
            }

            TransactionStatus status = transactionDTO.getStatus() != null ? transactionDTO.getStatus() : TransactionStatus.INITIATED;

            Transaction transaction = new Transaction(
                    senderOptional.get(),
                    receiverOptional.get(),
                    transactionDTO.getAmount(),
                    transactionDTO.getRawQuery(),
                    status
            );

            Transaction savedTransaction = transactionRepository.save(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTransaction);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create transaction: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTransactions(@PathVariable Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with id: " + userId);
            }

            List<TransactionHistoryDTO> transactions =
                    transactionRepository.findBySenderId(userId)
                            .stream()
                            .map(transaction -> {
                                TransactionHistoryDTO dto = new TransactionHistoryDTO();

                                dto.setId(transaction.getId());
                                dto.setTxnId("TXN-" + transaction.getId());
                                dto.setAmount(transaction.getAmount());

                                if (transaction.getReceiver() != null) {
                                    dto.setRecipientName(transaction.getReceiver().getName());
                                    dto.setRecipientVPA(transaction.getReceiver().getVpa());
                                }

                                dto.setSenderUserId(transaction.getSender().getId());
                                dto.setTimestamp(transaction.getCreatedAt());
                                dto.setStatus(transaction.getStatus().name());
                                dto.setType("SENT");
                                dto.setNote(transaction.getRawQuery());

                                return dto;
                            })
                            .collect(Collectors.toList());

            return ResponseEntity.ok(transactions);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving transactions: " + e.getMessage());
        }
    }
}
