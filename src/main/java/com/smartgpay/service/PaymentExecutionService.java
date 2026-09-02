package com.smartgpay.service;

import com.smartgpay.model.*;
import com.smartgpay.repository.ContactRepository;
import com.smartgpay.repository.TransactionRepository;
import com.smartgpay.repository.TransactionStatusLogRepository;
import com.smartgpay.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentExecutionService.class);

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionStatusLogRepository transactionStatusLogRepository;
    private final ValidationEngine validationEngine;

    private final PaymentLimitsService paymentLimitsService;

    public PaymentExecutionService(UserRepository userRepository,
                                  ContactRepository contactRepository,
                                  TransactionRepository transactionRepository,
                                  TransactionStatusLogRepository transactionStatusLogRepository,
                                  ValidationEngine validationEngine,
                                   PaymentLimitsService paymentLimitsService) {
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.transactionRepository = transactionRepository;
        this.transactionStatusLogRepository = transactionStatusLogRepository;
        this.validationEngine = validationEngine;
        this.paymentLimitsService = paymentLimitsService;
    }

    public static class PaymentResult {
        private final boolean success;
        private final Long transactionId;
        private final BigDecimal amount;
        private final String recipientName;
        private final BigDecimal newBalance;
        private final String errorMessage;

        public PaymentResult(boolean success, Long transactionId, BigDecimal amount, String recipientName, BigDecimal newBalance, String errorMessage) {
            this.success = success;
            this.transactionId = transactionId;
            this.amount = amount;
            this.recipientName = recipientName;
            this.newBalance = newBalance;
            this.errorMessage = errorMessage;
        }

        public boolean isSuccess() {
            return success;
        }

        public Long getTransactionId() {
            return transactionId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public String getRecipientName() {
            return recipientName;
        }

        public BigDecimal getNewBalance() {
            return newBalance;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    @Transactional
    public Transaction createAwaitingClarificationTransaction(String originalRequestId, Long userId, Long initialContactId, BigDecimal amount, String rawQuery, List<Contact> ambiguousContacts) {
        logger.info("Creating AWAITING_CLARIFICATION transaction: originalRequestId={}, userId={}, amount={}", originalRequestId, userId, amount);

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Contact placeholderReceiver = (initialContactId != null && contactRepository.existsById(initialContactId))
                ? contactRepository.findById(initialContactId).get()
                : ambiguousContacts.get(0);

        Transaction tx = new Transaction(originalRequestId, sender, placeholderReceiver, amount, rawQuery, TransactionStatus.AWAITING_CLARIFICATION);
        tx = transactionRepository.save(tx);

        String note = "Multiple matching contacts found (" + ambiguousContacts.size() + " options). Awaiting user clarification.";
        transactionStatusLogRepository.save(new TransactionStatusLog(tx, TransactionStatus.AWAITING_CLARIFICATION, note));

        return tx;
    }

    @Transactional
    public Transaction createFraudWarningTransaction(String originalRequestId, Long userId, Long contactId, BigDecimal amount, String rawQuery, String warningMessage) {
        logger.info("Creating FRAUD_WARNING transaction: originalRequestId={}, userId={}, contactId={}, amount={}", originalRequestId, userId, contactId, amount);

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Contact receiver = contactRepository.findById(contactId)
                .orElseThrow(() -> new IllegalArgumentException("Contact not found with id: " + contactId));

        Transaction tx = new Transaction(originalRequestId, sender, receiver, amount, rawQuery, TransactionStatus.FRAUD_WARNING);
        tx = transactionRepository.save(tx);

        String note = warningMessage + " Awaiting user confirmation.";
        transactionStatusLogRepository.save(new TransactionStatusLog(tx, TransactionStatus.FRAUD_WARNING, note));

        return tx;
    }

    @Transactional
    public PaymentResult cancelTransaction(Long transactionId, String originalRequestId, String reason) {
        logger.info("Cancelling transaction: transactionId={}, originalRequestId={}, reason={}", transactionId, originalRequestId, reason);

        Optional<Transaction> txOptional = Optional.empty();
        if (transactionId != null) {
            txOptional = transactionRepository.findById(transactionId);
        } else if (originalRequestId != null && !originalRequestId.isBlank()) {
            txOptional = transactionRepository.findByOriginalRequestId(originalRequestId);
        }

        if (txOptional.isEmpty()) {
            return new PaymentResult(false, transactionId, null, null, null, "Transaction not found for cancellation");
        }

        Transaction transaction = txOptional.get();
        transaction.setStatus(TransactionStatus.ABANDONED);
        transactionRepository.save(transaction);

        String note = (reason != null && !reason.isBlank()) ? reason : "User declined the fraud warning. Transaction marked as ABANDONED.";
        transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.ABANDONED, note));

        logger.info("Transaction marked as ABANDONED: id={}", transaction.getId());
        return new PaymentResult(false, transaction.getId(), transaction.getAmount(), transaction.getReceiver().getName(), transaction.getSender().getBalance(), note);
    }

    @Transactional
    public Transaction createAbandonedLimitTransaction(String originalRequestId, Long userId, Long contactId, BigDecimal amount, String rawQuery, String limitMessage) {
        logger.info("Creating ABANDONED transaction due to limit breach: originalRequestId={}, userId={}, amount={}", originalRequestId, userId, amount);

        User sender = userRepository.findById(userId).orElse(null);
        Contact receiver = (contactId != null) ? contactRepository.findById(contactId).orElse(null) : null;

        Transaction tx = new Transaction(originalRequestId, sender, receiver, amount, rawQuery, TransactionStatus.ABANDONED);
        tx = transactionRepository.save(tx);

        String note;
        if (amount.compareTo(PaymentLimitsService.PER_TRANSACTION_LIMIT) > 0) {
            note = "More than 50,000 so transaction failed";
        } else {
            note = limitMessage;
        }

        transactionStatusLogRepository.save(new TransactionStatusLog(tx, TransactionStatus.ABANDONED, note));
        return tx;
    }

    @Transactional
    public PaymentResult processPayment(String originalRequestId, Long userId, Long contactId, BigDecimal amount, String rawQuery) {
        logger.info("Initiating payment execution: originalRequestId={}, userId={}, contactId={}, amount={}", originalRequestId, userId, contactId, amount);

        // Check if there is an existing FRAUD_WARNING transaction for this originalRequestId
        Optional<Transaction> existingFraudTx = (originalRequestId != null && !originalRequestId.isBlank())
                ? transactionRepository.findByOriginalRequestId(originalRequestId)
                : Optional.empty();

        // 1. Data Integrity & Amount Validation via ValidationEngine
        ValidationEngine.ValidationResult integrityVal = validationEngine.validateDataIntegrity(userId, contactId);
        if (!integrityVal.isValid()) {
            return new PaymentResult(false, null, amount, null, null, integrityVal.getErrorMessage());
        }

        ValidationEngine.ValidationResult amountVal = validationEngine.validateAmount(amount);
        if (!amountVal.isValid()) {
            return new PaymentResult(false, null, amount, null, null, amountVal.getErrorMessage());
        }



        Optional<User> senderOptional = userRepository.findById(userId);
        if (senderOptional.isEmpty()) {
            return new PaymentResult(false, null, amount, null, null, "Data integrity error: Sender user not found with id: " + userId);
        }

        Optional<Contact> receiverOptional = contactRepository.findById(contactId);
        if (receiverOptional.isEmpty()) {
            return new PaymentResult(false, null, amount, null, null, "Data integrity error: Receiver contact not found with id: " + contactId);
        }

        User sender = senderOptional.get();
        Contact receiver = receiverOptional.get();

        // 2. Balance Validation via ValidationEngine
        ValidationEngine.ValidationResult balanceVal = validationEngine.validateBalance(sender.getBalance(), amount);
        if (!balanceVal.isValid()) {
            logger.warn("Payment failed - Balance validation for user id={}: {}", userId, balanceVal.getErrorMessage());

            Transaction failedTx = existingFraudTx.orElseGet(() -> new Transaction(originalRequestId, sender, receiver, amount, rawQuery, TransactionStatus.VALIDATION_FAILED));
            failedTx.setStatus(TransactionStatus.VALIDATION_FAILED);
            failedTx = transactionRepository.save(failedTx);
            transactionStatusLogRepository.save(new TransactionStatusLog(failedTx, TransactionStatus.VALIDATION_FAILED, balanceVal.getErrorMessage()));

            return new PaymentResult(false, failedTx.getId(), amount, receiver.getName(), sender.getBalance(), balanceVal.getErrorMessage());
        }

        // 3. Create or update transaction record (PROCESSING state)
        Transaction transaction;
        if (existingFraudTx.isPresent()) {
            transaction = existingFraudTx.get();
            transaction.setStatus(TransactionStatus.PROCESSING);
            transaction = transactionRepository.save(transaction);
            transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.PROCESSING, "Fraud warning acknowledged by user. Transaction processed successfully."));
        } else {
            transaction = new Transaction(originalRequestId, sender, receiver, amount, rawQuery, TransactionStatus.PROCESSING);
            transaction = transactionRepository.save(transaction);
            transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.PROCESSING, "Mock UPI Sandbox transaction initiated"));
        }

        // 4. Mock UPI Payment Processing
        boolean mockUpiSuccess = executeMockUpiGateway(sender.getUpiId(), receiver.getVpa(), amount);

        if (mockUpiSuccess) {
            BigDecimal newBalance = sender.getBalance().subtract(amount);
            sender.setBalance(newBalance);
            userRepository.save(sender);

            transaction.setStatus(TransactionStatus.SUCCESS);
            transactionRepository.save(transaction);
            transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.SUCCESS, "Payment completed. Remaining balance: ₹" + newBalance));

            logger.info("Payment executed successfully: transactionId={}, recipient={}, newBalance={}", transaction.getId(), receiver.getName(), newBalance);
            return new PaymentResult(true, transaction.getId(), amount, receiver.getName(), newBalance, null);
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.FAILED, "Mock UPI Gateway rejected payment transfer"));

            return new PaymentResult(false, transaction.getId(), amount, receiver.getName(), sender.getBalance(), "UPI payment processing failed: Gateway rejected transfer");
        }
    }

    @Transactional
    public PaymentResult processClarifiedPayment(Long transactionId, String originalRequestId, Long selectedContactId) {
        logger.info("Processing clarified payment: transactionId={}, originalRequestId={}, selectedContactId={}", transactionId, originalRequestId, selectedContactId);

        Optional<Transaction> txOptional = Optional.empty();
        if (transactionId != null) {
            txOptional = transactionRepository.findById(transactionId);
        } else if (originalRequestId != null && !originalRequestId.isBlank()) {
            txOptional = transactionRepository.findByOriginalRequestId(originalRequestId);
        }

        if (txOptional.isEmpty()) {
            return new PaymentResult(false, transactionId, null, null, null, "Data integrity error: Transaction not found");
        }

        Transaction transaction = txOptional.get();

        Optional<Contact> selectedContactOptional = contactRepository.findById(selectedContactId);
        if (selectedContactOptional.isEmpty()) {
            return new PaymentResult(false, transaction.getId(), transaction.getAmount(), null, transaction.getSender().getBalance(), "Data integrity error: Selected contact not found with id: " + selectedContactId);
        }

        Contact selectedContact = selectedContactOptional.get();
        User sender = transaction.getSender();
        BigDecimal amount = transaction.getAmount();

        // Log CONTACT_RESOLVED state transition
        transactionStatusLogRepository.save(new TransactionStatusLog(
                transaction,
                TransactionStatus.CONTACT_RESOLVED,
                "Contact clarified by user: " + selectedContact.getName() + " (" + selectedContact.getVpa() + ")"
        ));

        // Update receiver
        transaction.setReceiver(selectedContact);

        // Balance Validation via ValidationEngine
        ValidationEngine.ValidationResult balanceVal = validationEngine.validateBalance(sender.getBalance(), amount);
        if (!balanceVal.isValid()) {
            transaction.setStatus(TransactionStatus.VALIDATION_FAILED);
            transactionRepository.save(transaction);
            transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.VALIDATION_FAILED, balanceVal.getErrorMessage()));
            return new PaymentResult(false, transaction.getId(), amount, selectedContact.getName(), sender.getBalance(), balanceVal.getErrorMessage());
        }

        // Update to PROCESSING
        transaction.setStatus(TransactionStatus.PROCESSING);
        transactionRepository.save(transaction);
        transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.PROCESSING, "Processing payment for clarified contact " + selectedContact.getName()));

        // Execute Mock UPI Gateway
        boolean mockUpiSuccess = executeMockUpiGateway(sender.getUpiId(), selectedContact.getVpa(), amount);

        if (mockUpiSuccess) {
            BigDecimal newBalance = sender.getBalance().subtract(amount);
            sender.setBalance(newBalance);
            userRepository.save(sender);

            transaction.setStatus(TransactionStatus.SUCCESS);
            transactionRepository.save(transaction);
            transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.SUCCESS, "Payment completed after clarification. Remaining balance: ₹" + newBalance));

            logger.info("Clarified payment completed successfully: transactionId={}, recipient={}, newBalance={}", transaction.getId(), selectedContact.getName(), newBalance);
            return new PaymentResult(true, transaction.getId(), amount, selectedContact.getName(), newBalance, null);
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            transactionStatusLogRepository.save(new TransactionStatusLog(transaction, TransactionStatus.FAILED, "Mock UPI Gateway rejected payment transfer"));
            return new PaymentResult(false, transaction.getId(), amount, selectedContact.getName(), sender.getBalance(), "UPI payment failed: Gateway rejected transfer");
        }
    }

    private boolean executeMockUpiGateway(String senderUpi, String receiverVpa, BigDecimal amount) {
        logger.info("[Mock UPI Sandbox] Simulating transfer from {} to {} for amount ₹{}", senderUpi, receiverVpa, amount);
        return true;
    }
}
