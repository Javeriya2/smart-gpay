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
class PaymentLimitsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    private PaymentLimitsService paymentLimitsService;
    private User testUser;
    private Contact testContact;

    @BeforeEach
    void setUp() {
        paymentLimitsService = new PaymentLimitsService(transactionRepository);
        testUser = new User("Sender", "sender@okaxis", new BigDecimal("200000.00"));
        testUser.setId(1L);
        testContact = new Contact(testUser, "Receiver", "receiver@okaxis");
        testContact.setId(10L);
    }

    @Test
    @DisplayName("Reject single transfer exceeding per-transaction limit of ₹50,000")
    void testPerTransactionLimitExceeded() {
        BigDecimal amount = new BigDecimal("60000.00");
        PaymentLimitsService.LimitCheckResult result = paymentLimitsService.validatePaymentLimits(1L, amount);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).isEqualTo("Exceeds per-transaction limit of ₹50,000.");
    }

    @Test
    @DisplayName("Allow single transfer within per-transaction limit of ₹50,000")
    void testPerTransactionLimitValid() {
        when(transactionRepository.findBySenderIdAndStatusAndCreatedAtAfter(eq(1L), eq(TransactionStatus.SUCCESS), ArgumentMatchers.any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        BigDecimal amount = new BigDecimal("45000.00");
        PaymentLimitsService.LimitCheckResult result = paymentLimitsService.validatePaymentLimits(1L, amount);

        assertThat(result.isValid()).isTrue();
    }

    @Test
    @DisplayName("Reject transfer exceeding daily aggregate limit of ₹1,00,000 with exact shortfall format")
    void testDailyAggregateLimitExceeded() {
        // User has already sent ₹80,000 today
        Transaction pastTx = new Transaction(testUser, testContact, new BigDecimal("80000.00"), "paid 80k", TransactionStatus.SUCCESS);
        when(transactionRepository.findBySenderIdAndStatusAndCreatedAtAfter(eq(1L), eq(TransactionStatus.SUCCESS), ArgumentMatchers.any(LocalDateTime.class)))
                .thenReturn(List.of(pastTx));

        // Attempting to send ₹30,000 today (80k + 30k = 110k > 100k limit)
        BigDecimal amount = new BigDecimal("30000.00");
        PaymentLimitsService.LimitCheckResult result = paymentLimitsService.validatePaymentLimits(1L, amount);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).isEqualTo("Exceeds daily limit. You've sent ₹80000 today; ₹20000 remaining");
    }
}
