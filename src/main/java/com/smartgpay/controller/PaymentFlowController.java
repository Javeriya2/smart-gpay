package com.smartgpay.controller;

import com.smartgpay.dto.*;
import com.smartgpay.model.Contact;
import com.smartgpay.model.Transaction;
import com.smartgpay.model.User;
import com.smartgpay.repository.UserRepository;
import com.smartgpay.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
public class PaymentFlowController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentFlowController.class);

    private final GeminiIntentExtractor intentExtractor;
    private final ContactResolutionService contactResolutionService;
    private final PaymentExecutionService paymentExecutionService;
    private final ConfirmationGeneratorService confirmationGeneratorService;
    private final ValidationEngine validationEngine;
    private final PaymentLimitsService paymentLimitsService;
    private final FraudDetectionService fraudDetectionService;
    private final UserRepository userRepository;

    public PaymentFlowController(GeminiIntentExtractor intentExtractor,
                                 ContactResolutionService contactResolutionService,
                                 PaymentExecutionService paymentExecutionService,
                                 ConfirmationGeneratorService confirmationGeneratorService,
                                 ValidationEngine validationEngine,
                                 PaymentLimitsService paymentLimitsService,
                                 FraudDetectionService fraudDetectionService,
                                 UserRepository userRepository) {
        this.intentExtractor = intentExtractor;
        this.contactResolutionService = contactResolutionService;
        this.paymentExecutionService = paymentExecutionService;
        this.confirmationGeneratorService = confirmationGeneratorService;
        this.validationEngine = validationEngine;
        this.paymentLimitsService = paymentLimitsService;
        this.fraudDetectionService = fraudDetectionService;
        this.userRepository = userRepository;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentProcessRequest request) {
        if (request == null || request.getUserId() == null || request.getUserMessage() == null || request.getUserMessage().trim().isEmpty()) {
            logger.warn("Invalid PaymentProcessRequest received: {}", request);
            PaymentProcessResponse errorResp = new PaymentProcessResponse();
            errorResp.setStatus("INVALID_REQUEST");
            errorResp.setMessage("userId and userMessage are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
        }

        Long userId = request.getUserId();
        String userMessage = request.getUserMessage().trim();
        String originalRequestId = (request.getOriginalRequestId() != null && !request.getOriginalRequestId().isBlank())
                ? request.getOriginalRequestId()
                : "req-" + UUID.randomUUID().toString().substring(0, 8);
        logger.info("Processing payment request: userId={}, requestId='{}', prompt='{}'", userId, originalRequestId, userMessage);

        try {
            // Step 1: Extract Intent using Gemini / Rule Extractor
            Map<String, Object> intentMap = intentExtractor.extractIntent(userMessage);
            logger.info("Extracted intent for prompt '{}': {}", userMessage, intentMap);

            String recipientName = intentMap.get("recipient") != null ? intentMap.get("recipient").toString().trim() : null;
            BigDecimal amount = validationEngine.parseAmount(intentMap.get("amount"));

            // Check recipient
            if (recipientName == null || recipientName.isEmpty()) {
                PaymentProcessResponse clarifyResp = new PaymentProcessResponse();
                clarifyResp.setStatus("AWAITING_CLARIFICATION");
                clarifyResp.setOriginalRequestId(originalRequestId);
                clarifyResp.setUserMessage(userMessage);
                clarifyResp.setAmount(amount);
                clarifyResp.setMessage("Who would you like to send money to? Please specify a recipient.");
                return ResponseEntity.ok(clarifyResp);
            }

            // Check amount missing vs zero/negative amount
            if (amount == null) {
                PaymentProcessResponse clarifyResp = new PaymentProcessResponse();
                clarifyResp.setStatus("AWAITING_CLARIFICATION");
                clarifyResp.setOriginalRequestId(originalRequestId);
                clarifyResp.setUserMessage(userMessage);
                clarifyResp.setRecipientName(recipientName);
                clarifyResp.setMessage("How much money would you like to send to " + recipientName + "?");
                return ResponseEntity.ok(clarifyResp);
            }

            ValidationEngine.ValidationResult amountVal = validationEngine.validateAmount(amount);
            if (!amountVal.isValid()) {
                PaymentProcessResponse invalidAmountResp = new PaymentProcessResponse();
                invalidAmountResp.setStatus("VALIDATION_FAILED");
                invalidAmountResp.setOriginalRequestId(originalRequestId);
                invalidAmountResp.setUserMessage(userMessage);
                invalidAmountResp.setRecipientName(recipientName);
                invalidAmountResp.setAmount(amount);
                invalidAmountResp.setMessage(amountVal.getErrorMessage());
                return ResponseEntity.ok(invalidAmountResp);
            }

            // Step 2: Payment Limits Check (Per-Transaction limit ₹50k, Daily Aggregate limit ₹1 Lakh)
            PaymentLimitsService.LimitCheckResult limitCheck = paymentLimitsService.validatePaymentLimits(userId, amount);
            if (!limitCheck.isValid()) {
                logger.warn("Payment limit validation failed for userId={}: {}", userId, limitCheck.getErrorMessage());
                PaymentProcessResponse limitResp = new PaymentProcessResponse();
                limitResp.setStatus("VALIDATION_FAILED");
                limitResp.setOriginalRequestId(originalRequestId);
                limitResp.setUserMessage(userMessage);
                limitResp.setRecipientName(recipientName);
                limitResp.setAmount(amount);
                limitResp.setMessage(limitCheck.getErrorMessage());
                return ResponseEntity.ok(limitResp);
            }

            // Step 3: Contact Resolution
            ContactResolutionResult resolution = contactResolutionService.resolveContact(userId, recipientName);

            if (resolution.isAmbiguous()) {
                logger.info("Ambiguous contact resolution for recipientName='{}': count={}", recipientName, resolution.getAmbiguousContacts().size());

                // Create transaction record in state AWAITING_CLARIFICATION and write audit log
                Transaction tx = paymentExecutionService.createAwaitingClarificationTransaction(
                        originalRequestId,
                        userId,
                        resolution.getAmbiguousContacts().get(0).getId(),
                        amount,
                        userMessage,
                        resolution.getAmbiguousContacts()
                );

                List<ContactOptionDTO> contactOptions = resolution.getAmbiguousContacts().stream()
                        .map(ContactOptionDTO::fromContact)
                        .collect(Collectors.toList());

                ClarificationContext clarificationContext = new ClarificationContext(
                        userId,
                        amount,
                        userMessage,
                        recipientName,
                        originalRequestId,
                        tx.getId(),
                        contactOptions
                );

                PaymentProcessResponse ambiguousResp = new PaymentProcessResponse();
                ambiguousResp.setStatus("AWAITING_CLARIFICATION");
                ambiguousResp.setTransactionId(tx.getId());
                ambiguousResp.setOriginalRequestId(originalRequestId);
                ambiguousResp.setUserMessage(userMessage);
                ambiguousResp.setRecipientName(recipientName);
                ambiguousResp.setAmount(amount);
                ambiguousResp.setAmbiguousContacts(resolution.getAmbiguousContacts());
                ambiguousResp.setClarificationContext(clarificationContext);
                ambiguousResp.setMessage("Found multiple contacts matching '" + recipientName + "'. Please clarify which contact you mean.");

                return ResponseEntity.ok(ambiguousResp);
            }

            if (!resolution.isFound() || resolution.getMatchedContact() == null) {
                logger.warn("No contact found for userId={} matching name='{}'", userId, recipientName);
                String notFoundMsg = validationEngine.formatContactNotFoundMessage(recipientName);
                PaymentProcessResponse notFoundResp = new PaymentProcessResponse();
                notFoundResp.setStatus("VALIDATION_FAILED");
                notFoundResp.setOriginalRequestId(originalRequestId);
                notFoundResp.setUserMessage(userMessage);
                notFoundResp.setRecipientName(recipientName);
                notFoundResp.setAmount(amount);
                notFoundResp.setMessage(notFoundMsg);
                return ResponseEntity.ok(notFoundResp);
            }

            Contact matchedContact = resolution.getMatchedContact();

            // Step 4: Balance Validation Check
            Optional<User> senderOptional = userRepository.findById(userId);
            if (senderOptional.isPresent()) {
                BigDecimal balance = senderOptional.get().getBalance();
                ValidationEngine.ValidationResult balanceVal = validationEngine.validateBalance(balance, amount);
                if (!balanceVal.isValid()) {
                    logger.warn("Balance validation failed for userId={}: {}", userId, balanceVal.getErrorMessage());
                    PaymentProcessResponse balanceResp = new PaymentProcessResponse();
                    balanceResp.setStatus("VALIDATION_FAILED");
                    balanceResp.setOriginalRequestId(originalRequestId);
                    balanceResp.setUserMessage(userMessage);
                    balanceResp.setRecipientName(matchedContact.getName());
                    balanceResp.setAmount(amount);
                    balanceResp.setNewBalance(balance);
                    balanceResp.setMessage(balanceVal.getErrorMessage());
                    return ResponseEntity.ok(balanceResp);
                }
            }

            // Step 5: Rules-Based Fraud Signals Check
            if (!Boolean.TRUE.equals(request.getConfirmFraudWarning())) {
                FraudDetectionService.FraudCheckResult fraudCheck = fraudDetectionService.evaluateFraudSignals(userId, matchedContact.getId(), amount);
                if (fraudCheck.isWarningTriggered()) {
                    logger.warn("Fraud warning triggered for userId={}, contactId={}: {}", userId, matchedContact.getId(), fraudCheck.getWarningMessage());

                    // Create persistent transaction record in state FRAUD_WARNING and write audit log
                    Transaction fraudTx = paymentExecutionService.createFraudWarningTransaction(
                            originalRequestId,
                            userId,
                            matchedContact.getId(),
                            amount,
                            userMessage,
                            fraudCheck.getWarningMessage()
                    );

                    PaymentProcessResponse warningResp = new PaymentProcessResponse();
                    warningResp.setStatus("FRAUD_WARNING");
                    warningResp.setTransactionId(fraudTx.getId());
                    warningResp.setOriginalRequestId(originalRequestId);
                    warningResp.setUserMessage(userMessage);
                    warningResp.setRecipientName(matchedContact.getName());
                    warningResp.setAmount(amount);
                    warningResp.setMessage(fraudCheck.getWarningMessage());
                    warningResp.setProceedWithConfirmation(fraudCheck.isProceedWithConfirmation());
                    return ResponseEntity.ok(warningResp);
                }
            }

            // Step 6: Payment Execution
            PaymentExecutionService.PaymentResult paymentResult = paymentExecutionService.processPayment(
                    originalRequestId,
                    userId,
                    matchedContact.getId(),
                    amount,
                    userMessage
            );

            if (!paymentResult.isSuccess()) {
                logger.warn("Payment execution failed for transaction: {}", paymentResult.getErrorMessage());
                PaymentProcessResponse failResp = new PaymentProcessResponse();
                failResp.setStatus("VALIDATION_FAILED");
                failResp.setTransactionId(paymentResult.getTransactionId());
                failResp.setOriginalRequestId(originalRequestId);
                failResp.setUserMessage(userMessage);
                failResp.setAmount(amount);
                failResp.setRecipientName(matchedContact.getName());
                failResp.setNewBalance(paymentResult.getNewBalance());
                failResp.setMessage(paymentResult.getErrorMessage());
                return ResponseEntity.ok(failResp);
            }

            // Step 7: Confirmation Generation
            String confirmation = confirmationGeneratorService.generateConfirmation(
                    matchedContact.getName(),
                    amount,
                    paymentResult.getNewBalance()
            );

            PaymentProcessResponse successResp = new PaymentProcessResponse(
                    "SUCCESS",
                    paymentResult.getTransactionId(),
                    userMessage,
                    confirmation,
                    amount,
                    matchedContact.getName(),
                    paymentResult.getNewBalance()
            );
            successResp.setOriginalRequestId(originalRequestId);
            successResp.setMessage("Payment completed successfully.");

            return ResponseEntity.ok(successResp);

        } catch (Exception e) {
            logger.error("Internal error processing payment request for userMessage='{}'", userMessage, e);
            PaymentProcessResponse errResp = new PaymentProcessResponse();
            errResp.setStatus("FAILED");
            errResp.setOriginalRequestId(originalRequestId);
            errResp.setUserMessage(userMessage);
            errResp.setMessage("Failed to process payment request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errResp);
        }
    }

    @PostMapping("/clarify")
    public ResponseEntity<?> clarifyPayment(@RequestBody PaymentClarifyRequest request) {
        if (request == null || request.getSelectedContactId() == null ||
            (request.getTransactionId() == null && request.getOriginalRequestId() == null)) {
            logger.warn("Invalid PaymentClarifyRequest received: {}", request);
            PaymentProcessResponse errorResp = new PaymentProcessResponse();
            errorResp.setStatus("INVALID_REQUEST");
            errorResp.setMessage("transactionId or originalRequestId, and selectedContactId are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
        }

        try {
            Long transactionId = null;
            if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
                transactionId = Long.parseLong(request.getTransactionId());
            }

            logger.info("Executing clarified payment: transactionId={}, originalRequestId={}, selectedContactId={}",
                    transactionId, request.getOriginalRequestId(), request.getSelectedContactId());

            PaymentExecutionService.PaymentResult paymentResult = paymentExecutionService.processClarifiedPayment(
                    transactionId,
                    request.getOriginalRequestId(),
                    request.getSelectedContactId()
            );

            if (!paymentResult.isSuccess()) {
                logger.warn("Clarified payment execution failed: {}", paymentResult.getErrorMessage());
                PaymentProcessResponse failResp = new PaymentProcessResponse();
                failResp.setStatus("VALIDATION_FAILED");
                failResp.setTransactionId(transactionId);
                failResp.setOriginalRequestId(request.getOriginalRequestId());
                failResp.setAmount(paymentResult.getAmount());
                failResp.setRecipientName(paymentResult.getRecipientName());
                failResp.setNewBalance(paymentResult.getNewBalance());
                failResp.setMessage(paymentResult.getErrorMessage());
                return ResponseEntity.ok(failResp);
            }

            String confirmation = confirmationGeneratorService.generateConfirmation(
                    paymentResult.getRecipientName(),
                    paymentResult.getAmount(),
                    paymentResult.getNewBalance()
            );

            PaymentProcessResponse successResp = new PaymentProcessResponse(
                    "SUCCESS",
                    paymentResult.getTransactionId(),
                    null,
                    confirmation,
                    paymentResult.getAmount(),
                    paymentResult.getRecipientName(),
                    paymentResult.getNewBalance()
            );
            successResp.setOriginalRequestId(request.getOriginalRequestId());
            successResp.setMessage("Clarified payment completed successfully.");

            return ResponseEntity.ok(successResp);

        } catch (Exception e) {
            logger.error("Error executing clarified payment request: {}", request, e);
            PaymentProcessResponse errResp = new PaymentProcessResponse();
            errResp.setStatus("FAILED");
            errResp.setOriginalRequestId(request.getOriginalRequestId());
            errResp.setMessage("Failed to execute clarified payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errResp);
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelPayment(@RequestBody PaymentCancelRequest request) {
        if (request == null || (request.getTransactionId() == null && request.getOriginalRequestId() == null)) {
            logger.warn("Invalid PaymentCancelRequest received: {}", request);
            PaymentProcessResponse errorResp = new PaymentProcessResponse();
            errorResp.setStatus("INVALID_REQUEST");
            errorResp.setMessage("transactionId or originalRequestId is required for cancellation");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
        }

        try {
            Long transactionId = null;
            if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
                transactionId = Long.parseLong(request.getTransactionId());
            }

            PaymentExecutionService.PaymentResult cancelResult = paymentExecutionService.cancelTransaction(
                    transactionId,
                    request.getOriginalRequestId(),
                    request.getReason()
            );

            PaymentProcessResponse resp = new PaymentProcessResponse();
            resp.setStatus("ABANDONED");
            resp.setTransactionId(cancelResult.getTransactionId());
            resp.setOriginalRequestId(request.getOriginalRequestId());
            resp.setMessage("User declined the fraud warning. Transaction marked as ABANDONED.");
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            logger.error("Error cancelling payment request: {}", request, e);
            PaymentProcessResponse errResp = new PaymentProcessResponse();
            errResp.setStatus("FAILED");
            errResp.setMessage("Failed to cancel payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errResp);
        }
    }
}
