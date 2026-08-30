package com.smartgpay.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ValidationEngine {

    private static final Pattern NUMERIC_AMOUNT_PATTERN = Pattern.compile("(?i)(?:[₹$]|rs\\.?|rupees)?\\s*([0-9]+(?:\\.[0-9]{1,2})?)\\s*(?:[₹$]|rs\\.?|rupees)?");

    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;
        private final BigDecimal parsedAmount;
        private final BigDecimal shortfall;

        private ValidationResult(boolean valid, String errorMessage, BigDecimal parsedAmount, BigDecimal shortfall) {
            this.valid = valid;
            this.errorMessage = errorMessage;
            this.parsedAmount = parsedAmount;
            this.shortfall = shortfall;
        }

        public static ValidationResult valid() {
            return new ValidationResult(true, null, null, null);
        }

        public static ValidationResult valid(BigDecimal parsedAmount) {
            return new ValidationResult(true, null, parsedAmount, null);
        }

        public static ValidationResult invalid(String errorMessage) {
            return new ValidationResult(false, errorMessage, null, null);
        }

        public static ValidationResult invalid(String errorMessage, BigDecimal shortfall) {
            return new ValidationResult(false, errorMessage, null, shortfall);
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public BigDecimal getParsedAmount() {
            return parsedAmount;
        }

        public BigDecimal getShortfall() {
            return shortfall;
        }
    }

    /**
     * Parses numeric values from strings containing currency symbols or text
     * e.g., "Send 500 rupees", "₹500.50", "500.25 rs", 500
     */
    public BigDecimal parseAmount(Object amountInput) {
        if (amountInput == null) {
            return null;
        }
        if (amountInput instanceof BigDecimal) {
            return ((BigDecimal) amountInput).setScale(2, RoundingMode.HALF_UP);
        }
        if (amountInput instanceof Number) {
            return BigDecimal.valueOf(((Number) amountInput).doubleValue()).setScale(2, RoundingMode.HALF_UP);
        }

        String text = amountInput.toString().trim();
        if (text.isEmpty()) {
            return null;
        }

        Matcher matcher = NUMERIC_AMOUNT_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                String match = matcher.group(1);
                return new BigDecimal(match).setScale(2, RoundingMode.HALF_UP);
            } catch (Exception e) {
                return null;
            }
        }

        // Fallback cleanup
        try {
            String clean = text.replaceAll("[^0-9.]", "");
            if (clean.isEmpty()) {
                return null;
            }
            return new BigDecimal(clean).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Rejects zero or negative amounts with a clear error message.
     */
    public ValidationResult validateAmount(BigDecimal amount) {
        if (amount == null) {
            return ValidationResult.invalid("Payment amount is required.");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ValidationResult.invalid("Invalid payment amount: ₹" + formatAmount(amount) + ". Amount must be greater than zero.");
        }
        return ValidationResult.valid(amount);
    }

    /**
     * Checks balance against requested amount.
     * If insufficient, returns formatted message:
     * "Insufficient balance. You have ₹3000 but need ₹5000. Shortfall: ₹2000"
     */
    public ValidationResult validateBalance(BigDecimal balance, BigDecimal amount) {
        if (balance == null) {
            balance = BigDecimal.ZERO;
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ValidationResult.invalid("Invalid payment amount.");
        }

        if (balance.compareTo(amount) < 0) {
            BigDecimal shortfall = amount.subtract(balance);
            String message = String.format("Insufficient balance. You have ₹%s but need ₹%s. Shortfall: ₹%s",
                    formatAmount(balance), formatAmount(amount), formatAmount(shortfall));
            return ValidationResult.invalid(message, shortfall);
        }

        return ValidationResult.valid();
    }

    /**
     * Formats error message for non-existent contact.
     */
    public String formatContactNotFoundMessage(String recipientName) {
        String name = (recipientName != null && !recipientName.isBlank()) ? recipientName.trim() : "this recipient";
        return "No one named " + name + " in your payees. Add them first?";
    }

    /**
     * Validates data integrity for user and contact IDs.
     */
    public ValidationResult validateDataIntegrity(Long userId, Long contactId) {
        if (userId == null) {
            return ValidationResult.invalid("Data integrity error: Sender User ID is required.");
        }
        if (contactId == null) {
            return ValidationResult.invalid("Data integrity error: Receiver Contact ID is required.");
        }
        return ValidationResult.valid();
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        // Strip trailing zeroes after decimal if whole integer, or display 2 decimal places
        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP).stripTrailingZeros();
        return scaled.toPlainString();
    }
}
