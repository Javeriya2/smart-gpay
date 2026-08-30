package com.smartgpay.service;

import com.smartgpay.model.Contact;
import com.smartgpay.model.Transaction;
import com.smartgpay.model.TransactionStatus;
import com.smartgpay.model.User;
import com.smartgpay.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FraudDetectionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    private FraudDetectionService fraudDetectionService;
    private User testUser;
    private Contact testContact;

    @BeforeEach
    void setUp() {
        fraudDetectionService = new FraudDetectionService(transactionRepository);
        testUser = new User("Sender", "sender@okaxis", new BigDecimal("200000.00"));
        testUser.setId(1L);
        testContact = new Contact(testUser, "Receiver", "receiver@okaxis");
        testContact.setId(10L);
    }

    @Test
    @DisplayName("Trigger warning on Rapid Successive Transfers (> 5 transfers in last 10 minutes)")
    void testRapidSuccessiveTransfers() {
        // Mock 6 recent transfers in last 10 mins
        List<Transaction> sixRecentTxns = List.of(
                new Transaction(testUser, testContact, new BigDecimal("100"), "t1", TransactionStatus.SUCCESS),
                new Transaction(testUser, testContact, new BigDecimal("100"), "t2", TransactionStatus.SUCCESS),
                new Transaction(testUser, testContact, new BigDecimal("100"), "t3", TransactionStatus.SUCCESS),
                new Transaction(testUser, testContact, new BigDecimal("100"), "t4", TransactionStatus.SUCCESS),
                new Transaction(testUser, testContact, new BigDecimal("100"), "t5", TransactionStatus.SUCCESS),
                new Transaction(testUser, testContact, new BigDecimal("100"), "t6", TransactionStatus.SUCCESS)
        );

        when(transactionRepository.findBySenderIdAndCreatedAtAfter(eq(1L), ArgumentMatchers.any(LocalDateTime.class)))
                .thenReturn(sixRecentTxns);

        FraudDetectionService.FraudCheckResult result = fraudDetectionService.evaluateFraudSignals(1L, 10L, new BigDecimal("500.00"));

        assertThat(result.isWarningTriggered()).isTrue();
        assertThat(result.isProceedWithConfirmation()).isTrue();
        assertThat(result.getWarningMessage()).contains("Rapid successive transfers detected");
    }

    @Test
    @DisplayName("Trigger warning on High-Value First Transfer (> ₹10,000 for new recipient)")
    void testHighValueFirstTransfer() {
        when(transactionRepository.findBySenderIdAndCreatedAtAfter(eq(1L), ArgumentMatchers.any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        // No past transactions to this recipient
        when(transactionRepository.findBySenderIdAndReceiverIdAndStatus(1L, 10L, TransactionStatus.SUCCESS))
                .thenReturn(Collections.emptyList());

        BigDecimal amount = new BigDecimal("15000.00");
        FraudDetectionService.FraudCheckResult result = fraudDetectionService.evaluateFraudSignals(1L, 10L, amount);

        assertThat(result.isWarningTriggered()).isTrue();
        assertThat(result.isProceedWithConfirmation()).isTrue();
        assertThat(result.getWarningMessage()).contains("High-value first transfer to a new recipient");
    }

    @Test
    @DisplayName("Trigger warning on Unusual Amount for Contact (> 10x historical average)")
    void testUnusualAmountForContact() {
        when(transactionRepository.findBySenderIdAndCreatedAtAfter(eq(1L), ArgumentMatchers.any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        // Past transfers to recipient average = ₹500
        List<Transaction> pastTxns = List.of(
                new Transaction(testUser, testContact, new BigDecimal("500.00"), "p1", TransactionStatus.SUCCESS),
                new Transaction(testUser, testContact, new BigDecimal("500.00"), "p2", TransactionStatus.SUCCESS)
        );
        when(transactionRepository.findBySenderIdAndReceiverIdAndStatus(1L, 10L, TransactionStatus.SUCCESS))
                .thenReturn(pastTxns);

        // Requested amount = ₹6,000 (> 10x of 500 = 5,000)
        BigDecimal amount = new BigDecimal("6000.00");
        FraudDetectionService.FraudCheckResult result = fraudDetectionService.evaluateFraudSignals(1L, 10L, amount);

        assertThat(result.isWarningTriggered()).isTrue();
        assertThat(result.isProceedWithConfirmation()).isTrue();
        assertThat(result.getWarningMessage()).isEqualTo("Unusual amount for this recipient. Do you want to proceed?");
    }

    @Test
    @DisplayName("Clear fraud check when transaction is normal")
    void testNormalTransferClear() {
        when(transactionRepository.findBySenderIdAndCreatedAtAfter(eq(1L), ArgumentMatchers.any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        List<Transaction> pastTxns = List.of(
                new Transaction(testUser, testContact, new BigDecimal("500.00"), "p1", TransactionStatus.SUCCESS)
        );
        when(transactionRepository.findBySenderIdAndReceiverIdAndStatus(1L, 10L, TransactionStatus.SUCCESS))
                .thenReturn(pastTxns);

        BigDecimal amount = new BigDecimal("1000.00"); // 2x average, perfectly normal
        FraudDetectionService.FraudCheckResult result = fraudDetectionService.evaluateFraudSignals(1L, 10L, amount);

        assertThat(result.isWarningTriggered()).isFalse();
    }
}
