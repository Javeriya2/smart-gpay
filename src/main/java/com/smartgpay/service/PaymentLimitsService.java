package com.smartgpay.service;

import com.smartgpay.model.Transaction;
import com.smartgpay.model.TransactionStatus;
import com.smartgpay.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class PaymentLimitsService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentLimitsService.class);

    public static final BigDecimal PER_TRANSACTION_LIMIT = new BigDecimal("50000.00");
    public static final BigDecimal DAILY_AGGREGATE_LIMIT = new BigDecimal("100000.00");

    private final TransactionRepository transactionRepository;

    public PaymentLimitsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public static class LimitCheckResult {
        private final boolean valid;
        private final String errorMessage;
        private final BigDecimal todaySpent;
        private final BigDecimal remainingLimit;

        private LimitCheckResult(boolean valid, String errorMessage, BigDecimal todaySpent, BigDecimal remainingLimit) {
            this.valid = valid;
            this.errorMessage = errorMessage;
            this.todaySpent = todaySpent;
            this.remainingLimit = remainingLimit;
        }

        public static LimitCheckResult valid(BigDecimal todaySpent, BigDecimal remainingLimit) {
            return new LimitCheckResult(true, null, todaySpent, remainingLimit);
        }

        public static LimitCheckResult invalid(String errorMessage) {
            return new LimitCheckResult(false, errorMessage, null, null);
        }

        public static LimitCheckResult invalid(String errorMessage, BigDecimal todaySpent, BigDecimal remainingLimit) {
            return new LimitCheckResult(false, errorMessage, todaySpent, remainingLimit);
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public BigDecimal getTodaySpent() {
            return todaySpent;
        }

        public BigDecimal getRemainingLimit() {
            return remainingLimit;
        }
    }

    /**
     * Validates both per-transaction limit (₹50,000) and daily aggregate limit (₹1,00,000).
     */
    public LimitCheckResult validatePaymentLimits(Long userId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {

            return LimitCheckResult.invalid("Invalid payment amount.");
        }

        // 1. Per-Transaction Limit Check
        if (amount.compareTo(PER_TRANSACTION_LIMIT) > 0) {
            logger.warn("Per-transaction limit exceeded for userId={}: amount=₹{}, limit=₹{}", userId, amount, PER_TRANSACTION_LIMIT);
            return LimitCheckResult.invalid("Exceeds per-transaction limit of ₹50,000.");
        }

        if (userId == null) {
            return LimitCheckResult.valid(BigDecimal.ZERO, PER_TRANSACTION_LIMIT);
        }

        // 2. Daily Aggregate Limit Check
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        List<Transaction> todaySuccessfulTxns = transactionRepository.findBySenderIdAndStatusAndCreatedAtAfter(
                userId,
                TransactionStatus.SUCCESS,
                startOfDay
        );

        BigDecimal todaySpent = todaySuccessfulTxns.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal remaining = DAILY_AGGREGATE_LIMIT.subtract(todaySpent);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        if (todaySpent.add(amount).compareTo(DAILY_AGGREGATE_LIMIT) > 0) {
            String message = String.format("Exceeds daily limit. You've sent ₹%s today; ₹%s remaining",
                    formatAmount(todaySpent), formatAmount(remaining));
            logger.warn("Daily limit exceeded for userId={}: todaySpent=₹{}, requested=₹{}, remaining=₹{}",
                    userId, todaySpent, amount, remaining);
            return LimitCheckResult.invalid(message, todaySpent, remaining);
        }

        return LimitCheckResult.valid(todaySpent, remaining);
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP).stripTrailingZeros();
        return scaled.toPlainString();
    }
}
