package com.smartgpay.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartgpay.dto.PaymentCancelRequest;
import com.smartgpay.dto.PaymentClarifyRequest;
import com.smartgpay.dto.PaymentProcessRequest;
import com.smartgpay.model.Contact;
import com.smartgpay.model.Transaction;
import com.smartgpay.model.TransactionStatus;
import com.smartgpay.model.TransactionStatusLog;
import com.smartgpay.model.User;
import com.smartgpay.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentFlowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionStatusLogRepository transactionStatusLogRepository;

    private User testUser;
    private Contact singleRahulContact;

    @BeforeEach
    void setUp() {
        transactionStatusLogRepository.deleteAll();
        transactionRepository.deleteAll();
        contactRepository.deleteAll();
        userRepository.deleteAll();

        // Create User with balance 200,000
        testUser = userRepository.save(new User("Test User", "testuser@okaxis", new BigDecimal("200000.00")));
    }

    @Test
    @DisplayName("Happy Path End-to-End Flow - Single Contact Match & originalRequestId Saved")
    void testProcessPaymentHappyPath() throws Exception {
        singleRahulContact = contactRepository.save(new Contact(testUser, "Rahul", "rahul.single@okaxis"));

        // Seed past transaction and adjust user balance accordingly
        testUser.setBalance(new BigDecimal("199500.00"));
        userRepository.save(testUser);
        transactionRepository.save(new Transaction(testUser, singleRahulContact, new BigDecimal("500.00"), "seed", TransactionStatus.SUCCESS));

        PaymentProcessRequest request = new PaymentProcessRequest(testUser.getId(), "Send ₹500 to Rahul");

        String responseContent = mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.transactionId", notNullValue()))
                .andExpect(jsonPath("$.originalRequestId", notNullValue()))
                .andExpect(jsonPath("$.userMessage", is("Send ₹500 to Rahul")))
                .andExpect(jsonPath("$.recipientName", is("Rahul")))
                .andExpect(jsonPath("$.amount", is(500.0)))
                .andExpect(jsonPath("$.newBalance", is(199000.0)))
                .andExpect(jsonPath("$.confirmation", containsString("Sent ₹500 to Rahul")))
                .andExpect(jsonPath("$.confirmation", containsString("199000")))
                .andReturn().getResponse().getContentAsString();

        Long transactionId = objectMapper.readTree(responseContent).get("transactionId").asLong();
        String originalRequestId = objectMapper.readTree(responseContent).get("originalRequestId").asText();

        // Verify originalRequestId stored on Transaction entity in DB
        Transaction tx = transactionRepository.findById(transactionId).orElseThrow();
        assertThat(tx.getOriginalRequestId()).isEqualTo(originalRequestId);

        // Verify balance updated in DB
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getBalance()).isEqualByComparingTo("199000.00");

        // Verify audit logs created in DB for transaction
        List<TransactionStatusLog> logs = transactionStatusLogRepository.findByTransactionIdOrderByCreatedAtAsc(transactionId);
        assertThat(logs).isNotEmpty();
        assertThat(logs).extracting(TransactionStatusLog::getStatus)
                .contains(TransactionStatus.PROCESSING, TransactionStatus.SUCCESS);
    }

    @Test
    @DisplayName("High-Value First Transfer Fraud Warning, Persistence, Audit Log & Confirmation Flow")
    void testFraudWarningPersistenceAndConfirmationFlow() throws Exception {
        singleRahulContact = contactRepository.save(new Contact(testUser, "Rahul", "rahul.single@okaxis"));

        // 1. First transfer to new contact for ₹15,000 triggers FRAUD_WARNING and saves Transaction & Log in DB
        PaymentProcessRequest request = new PaymentProcessRequest(testUser.getId(), "Send ₹15000 to Rahul");

        String warningRespJson = mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("FRAUD_WARNING")))
                .andExpect(jsonPath("$.transactionId", notNullValue()))
                .andExpect(jsonPath("$.originalRequestId", notNullValue()))
                .andExpect(jsonPath("$.proceedWithConfirmation", is(true)))
                .andExpect(jsonPath("$.message", containsString("High-value first transfer to a new recipient")))
                .andReturn().getResponse().getContentAsString();

        Long transactionId = objectMapper.readTree(warningRespJson).get("transactionId").asLong();
        String originalRequestId = objectMapper.readTree(warningRespJson).get("originalRequestId").asText();

        // Verify DB Transaction status is FRAUD_WARNING
        Transaction fraudTx = transactionRepository.findById(transactionId).orElseThrow();
        assertThat(fraudTx.getStatus()).isEqualTo(TransactionStatus.FRAUD_WARNING);

        // Verify DB Audit Log note for FRAUD_WARNING
        List<TransactionStatusLog> warningLogs = transactionStatusLogRepository.findByTransactionIdOrderByCreatedAtAsc(transactionId);
        assertThat(warningLogs).hasSize(1);
        assertThat(warningLogs.get(0).getStatus()).isEqualTo(TransactionStatus.FRAUD_WARNING);
        assertThat(warningLogs.get(0).getNote()).contains("High-value first transfer");

        // 2. Client resubmits with confirmFraudWarning = true and same originalRequestId
        PaymentProcessRequest confirmRequest = new PaymentProcessRequest(testUser.getId(), "Send ₹15000 to Rahul", true, transactionId, originalRequestId);

        mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.amount", is(15000.0)))
                .andExpect(jsonPath("$.newBalance", is(185000.0)));

        // Verify DB audit log progression on the SAME transaction: FRAUD_WARNING -> PROCESSING -> SUCCESS
        List<TransactionStatusLog> finalLogs = transactionStatusLogRepository.findByTransactionIdOrderByCreatedAtAsc(transactionId);
        assertThat(finalLogs).extracting(TransactionStatusLog::getStatus)
                .containsExactly(TransactionStatus.FRAUD_WARNING, TransactionStatus.PROCESSING, TransactionStatus.SUCCESS);
    }

    @Test
    @DisplayName("Fraud Warning Cancellation Endpoint Flow (ABANDONED)")
    void testFraudWarningCancellationFlow() throws Exception {
        singleRahulContact = contactRepository.save(new Contact(testUser, "Rahul", "rahul.single@okaxis"));

        // 1. First transfer triggers FRAUD_WARNING
        PaymentProcessRequest request = new PaymentProcessRequest(testUser.getId(), "Send ₹15000 to Rahul");

        String warningRespJson = mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("FRAUD_WARNING")))
                .andReturn().getResponse().getContentAsString();

        Long transactionId = objectMapper.readTree(warningRespJson).get("transactionId").asLong();

        // 2. User cancels payment via POST /api/payment/cancel
        PaymentCancelRequest cancelRequest = new PaymentCancelRequest(transactionId.toString(), null, "User declined the fraud warning.");

        mockMvc.perform(post("/api/payment/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ABANDONED")))
                .andExpect(jsonPath("$.message", containsString("User declined the fraud warning. Transaction marked as ABANDONED.")));

        // Verify DB Transaction status is ABANDONED
        Transaction cancelledTx = transactionRepository.findById(transactionId).orElseThrow();
        assertThat(cancelledTx.getStatus()).isEqualTo(TransactionStatus.ABANDONED);

        // Verify DB Audit Log note for ABANDONED
        List<TransactionStatusLog> cancelLogs = transactionStatusLogRepository.findByTransactionIdOrderByCreatedAtAsc(transactionId);
        assertThat(cancelLogs).hasSize(2);
        assertThat(cancelLogs.get(1).getStatus()).isEqualTo(TransactionStatus.ABANDONED);
        assertThat(cancelLogs.get(1).getNote()).contains("User declined the fraud warning.");
    }

    @Test
    @DisplayName("Per-Transaction Limit Exceeded (> ₹50,000)")
    void testPerTransactionLimitExceeded() throws Exception {
        singleRahulContact = contactRepository.save(new Contact(testUser, "Rahul", "rahul.single@okaxis"));
        PaymentProcessRequest request = new PaymentProcessRequest(testUser.getId(), "Send ₹60000 to Rahul");

        mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.message", is("Exceeds per-transaction limit of ₹50,000.")));
    }

    @Test
    @DisplayName("Daily Aggregate Limit Exceeded (> ₹1,00,000)")
    void testDailyAggregateLimitExceeded() throws Exception {
        singleRahulContact = contactRepository.save(new Contact(testUser, "Rahul", "rahul.single@okaxis"));

        // Seed successful transaction of ₹80,000 today
        transactionRepository.save(new Transaction(testUser, singleRahulContact, new BigDecimal("80000.00"), "paid 80k", TransactionStatus.SUCCESS));

        // Attempting to send ₹30,000 today (80k + 30k = 110k > 100k)
        PaymentProcessRequest request = new PaymentProcessRequest(testUser.getId(), "Send ₹30000 to Rahul");

        mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.message", is("Exceeds daily limit. You've sent ₹80000 today; ₹20000 remaining")));
    }

    @Test
    @DisplayName("Non-Existent Contact Error Handling")
    void testNonExistentContactValidation() throws Exception {
        PaymentProcessRequest request = new PaymentProcessRequest(testUser.getId(), "Send ₹500 to Alex");

        mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.message", is("No one named Alex in your payees. Add them first?")));
    }

    @Test
    @DisplayName("Insufficient Balance Validation & Shortfall Message Format")
    void testInsufficientBalanceValidation() throws Exception {
        // Update user balance to 1000
        testUser.setBalance(new BigDecimal("1000.00"));
        userRepository.save(testUser);

        singleRahulContact = contactRepository.save(new Contact(testUser, "Rahul", "rahul.single@okaxis"));
        // Seed past transaction so it's not flagged as first transfer
        transactionRepository.save(new Transaction(testUser, singleRahulContact, new BigDecimal("200.00"), "seed", TransactionStatus.SUCCESS));

        PaymentProcessRequest request = new PaymentProcessRequest(testUser.getId(), "Send ₹5000 to Rahul");

        mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.message", is("Insufficient balance. You have ₹1000 but need ₹5000. Shortfall: ₹4000")));
    }

    @Test
    @DisplayName("Disambiguation & Clarification Flow - 3 Duplicate Contacts & originalRequestId Saved")
    void testDisambiguationAndClarificationFlow() throws Exception {
        // Save 3 contacts all named "Rahul" with different VPA suffixes
        Contact rahulBlr = contactRepository.save(new Contact(testUser, "Rahul", "rahul.blr@okaxis"));
        Contact rahulDel = contactRepository.save(new Contact(testUser, "Rahul", "rahul.del@okaxis"));
        Contact rahulMum = contactRepository.save(new Contact(testUser, "Rahul", "rahul.mum@okaxis"));

        PaymentProcessRequest processRequest = new PaymentProcessRequest(testUser.getId(), "Send ₹500 to Rahul");

        // 1. Initial process request detects ambiguity
        String processResponseJson = mockMvc.perform(post("/api/payment/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(processRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AWAITING_CLARIFICATION")))
                .andExpect(jsonPath("$.transactionId", notNullValue()))
                .andExpect(jsonPath("$.originalRequestId", notNullValue()))
                .andExpect(jsonPath("$.ambiguousContacts", hasSize(3)))
                .andExpect(jsonPath("$.clarificationContext.ambiguousContacts", hasSize(3)))
                .andExpect(jsonPath("$.clarificationContext.rawRecipientName", is("Rahul")))
                .andReturn().getResponse().getContentAsString();

        Long transactionId = objectMapper.readTree(processResponseJson).get("transactionId").asLong();
        String originalRequestId = objectMapper.readTree(processResponseJson).get("originalRequestId").asText();

        // Verify originalRequestId saved on Transaction entity in DB
        Transaction tx = transactionRepository.findById(transactionId).orElseThrow();
        assertThat(tx.getOriginalRequestId()).isEqualTo(originalRequestId);

        // Verify DB audit log has AWAITING_CLARIFICATION
        List<TransactionStatusLog> initialLogs = transactionStatusLogRepository.findByTransactionIdOrderByCreatedAtAsc(transactionId);
        assertThat(initialLogs).hasSize(1);
        assertThat(initialLogs.get(0).getStatus()).isEqualTo(TransactionStatus.AWAITING_CLARIFICATION);

        // 2. User selects Rahul Bangalore (rahulBlr.getId()) via /api/payment/clarify
        PaymentClarifyRequest clarifyRequest = new PaymentClarifyRequest(
                transactionId.toString(),
                originalRequestId,
                rahulBlr.getId()
        );

        mockMvc.perform(post("/api/payment/clarify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clarifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.transactionId", is(transactionId.intValue())))
                .andExpect(jsonPath("$.originalRequestId", is(originalRequestId)))
                .andExpect(jsonPath("$.recipientName", is("Rahul")))
                .andExpect(jsonPath("$.amount", is(500.0)))
                .andExpect(jsonPath("$.newBalance", is(199500.0)))
                .andExpect(jsonPath("$.confirmation", containsString("Sent ₹500 to Rahul")))
                .andExpect(jsonPath("$.confirmation", containsString("199500")));

        // Verify balance updated in DB
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getBalance()).isEqualByComparingTo("199500.00");

        // Verify full state audit log progression: AWAITING_CLARIFICATION -> CONTACT_RESOLVED -> PROCESSING -> SUCCESS
        List<TransactionStatusLog> finalLogs = transactionStatusLogRepository.findByTransactionIdOrderByCreatedAtAsc(transactionId);
        assertThat(finalLogs).extracting(TransactionStatusLog::getStatus)
                .containsExactly(
                        TransactionStatus.AWAITING_CLARIFICATION,
                        TransactionStatus.CONTACT_RESOLVED,
                        TransactionStatus.PROCESSING,
                        TransactionStatus.SUCCESS
                );
    }
}
