package com.smartgpay.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ValidationEngineTest {

    private ValidationEngine validationEngine;

    @BeforeEach
    void setUp() {
        validationEngine = new ValidationEngine();
    }

    @Test
    @DisplayName("Parse text containing currency symbols and words to clean BigDecimal")
    void testParseAmount() {
        assertThat(validationEngine.parseAmount("Send 500 rupees")).isEqualByComparingTo("500.00");
        assertThat(validationEngine.parseAmount("₹500.50")).isEqualByComparingTo("500.50");
        assertThat(validationEngine.parseAmount("500.25 rs")).isEqualByComparingTo("500.25");
        assertThat(validationEngine.parseAmount(500)).isEqualByComparingTo("500.00");
        assertThat(validationEngine.parseAmount(new BigDecimal("1250.75"))).isEqualByComparingTo("1250.75");
    }

    @Test
    @DisplayName("Reject zero and negative amounts with clear error message")
    void testValidateAmountInvalid() {
        ValidationEngine.ValidationResult zeroRes = validationEngine.validateAmount(BigDecimal.ZERO);
        assertThat(zeroRes.isValid()).isFalse();
        assertThat(zeroRes.getErrorMessage()).contains("must be greater than zero");

        ValidationEngine.ValidationResult negRes = validationEngine.validateAmount(new BigDecimal("-100.00"));
        assertThat(negRes.isValid()).isFalse();
        assertThat(negRes.getErrorMessage()).contains("must be greater than zero");

        ValidationEngine.ValidationResult nullRes = validationEngine.validateAmount(null);
        assertThat(nullRes.isValid()).isFalse();
        assertThat(nullRes.getErrorMessage()).contains("required");
    }

    @Test
    @DisplayName("Validate positive amounts successfully")
    void testValidateAmountValid() {
        ValidationEngine.ValidationResult res = validationEngine.validateAmount(new BigDecimal("500.50"));
        assertThat(res.isValid()).isTrue();
        assertThat(res.getParsedAmount()).isEqualByComparingTo("500.50");
    }

    @Test
    @DisplayName("Insufficient balance shortfall error message format test")
    void testValidateBalanceInsufficient() {
        BigDecimal balance = new BigDecimal("3000.00");
        BigDecimal amount = new BigDecimal("5000.00");

        ValidationEngine.ValidationResult res = validationEngine.validateBalance(balance, amount);

        assertThat(res.isValid()).isFalse();
        assertThat(res.getShortfall()).isEqualByComparingTo("2000.00");
        assertThat(res.getErrorMessage()).isEqualTo("Insufficient balance. You have ₹3000 but need ₹5000. Shortfall: ₹2000");
    }

    @Test
    @DisplayName("Sufficient balance validation test")
    void testValidateBalanceSufficient() {
        BigDecimal balance = new BigDecimal("5000.00");
        BigDecimal amount = new BigDecimal("3000.00");

        ValidationEngine.ValidationResult res = validationEngine.validateBalance(balance, amount);

        assertThat(res.isValid()).isTrue();
        assertThat(res.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("Format contact not found message")
    void testFormatContactNotFoundMessage() {
        String msg = validationEngine.formatContactNotFoundMessage("Alex");
        assertThat(msg).isEqualTo("No one named Alex in your payees. Add them first?");
    }

    @Test
    @DisplayName("Validate data integrity for user and contact IDs")
    void testValidateDataIntegrity() {
        assertThat(validationEngine.validateDataIntegrity(null, 10L).isValid()).isFalse();
        assertThat(validationEngine.validateDataIntegrity(1L, null).isValid()).isFalse();
        assertThat(validationEngine.validateDataIntegrity(1L, 10L).isValid()).isTrue();
    }
}
