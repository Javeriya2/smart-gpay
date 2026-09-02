package com.smartgpay.service;

import com.smartgpay.model.Transaction;
import com.smartgpay.model.TransactionStatus;
import com.smartgpay.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FraudDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(FraudDetectionService.class);

    public static final BigDecimal HIGH_VALUE_FIRST_TRANSFER_THRESHOLD = new BigDecimal("10000.00");
    public static final int RAPID_TRANSFERS_LIMIT = 5;
    public static final int RAPID_TRANSFERS_WINDOW_MINUTES = 10;
    public static final BigDecimal UNUSUAL_AMOUNT_MULTIPLIER = new BigDecimal("10.0");

    private final TransactionRepository transactionRepository;

    public FraudDetectionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public static class FraudCheckResult {
        private final boolean warningTriggered;
        private final String warningMessage;
        private final boolean proceedWithConfirmation;

        private FraudCheckResult(boolean warningTriggered, String warningMessage, boolean proceedWithConfirmation) {
            this.warningTriggered = warningTriggered;
            this.warningMessage = warningMessage;
            this.proceedWithConfirmation = proceedWithConfirmation;
        }

        public static FraudCheckResult clear() {
            return new FraudCheckResult(false, null, false);
        }

        public static FraudCheckResult warning(String warningMessage) {
            return new FraudCheckResult(true, warningMessage, true);
        }

        public boolean isWarningTriggered() {
            return warningTriggered;
        }

        public String getWarningMessage() {
            return warningMessage;
        }

        public boolean isProceedWithConfirmation() {
            return proceedWithConfirmation;
        }
    }

    /**
     * Evaluates fraud signals:
     * 1. Rapid successive transfers (> 5 in 10 minutes)
     * 2. Unusual amount for contact (> 10x historical average)
     * 3. High-value first transfer (first transfer to contact & > ₹10,000)
     */
    public FraudCheckResult evaluateFraudSignals(Long userId, Long contactId, BigDecimal amount) {
        if (userId == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return FraudCheckResult.clear();
        }

        // Rule 1: Rapid Successive Transfers
        LocalDateTime tenMinsAgo = LocalDateTime.now().minusMinutes(RAPID_TRANSFERS_WINDOW_MINUTES);
        List<Transaction> recentTxns = transactionRepository.findBySenderIdAndCreatedAtAfter(userId, tenMinsAgo);

        if (recentTxns.size() > RAPID_TRANSFERS_LIMIT) {
            logger.warn("Fraud Warning - Rapid transfers for userId={}: count={} in last 10 mins", userId, recentTxns.size());
            return FraudCheckResult.warning("Rapid successive transfers detected. Please confirm if you wish to proceed.");
        }

        if (contactId == null) {
            return FraudCheckResult.clear();
        }

        // Fetch past successful transfers to this recipient
        List<Transaction> pastTxnsToRecipient = transactionRepository.findBySenderIdAndReceiverIdAndStatus(
                userId,
                contactId,
                TransactionStatus.SUCCESS
        );

        // Rule 3: High-Value First Transfer
        if (pastTxnsToRecipient.isEmpty()) {
            if (amount.compareTo(HIGH_VALUE_FIRST_TRANSFER_THRESHOLD) > 0) {
                logger.warn("Fraud Warning - High-value first transfer for userId={} to contactId={}: amount=₹{}", userId, contactId, amount);
                return FraudCheckResult.warning("High-value first transfer to a new recipient. Do you want to proceed?");
            }
            return FraudCheckResult.clear();
        }

        // Rule 2: Unusual Amount for Contact (> 10x historical average)
        BigDecimal sumAmount = pastTxnsToRecipient.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgAmount = sumAmount.divide(BigDecimal.valueOf(pastTxnsToRecipient.size()), 2, RoundingMode.HALF_UP);
        BigDecimal unusualThreshold = avgAmount.multiply(UNUSUAL_AMOUNT_MULTIPLIER);

        if (amount.compareTo(unusualThreshold) > 0) {
            logger.warn("Fraud Warning - Unusual amount for contactId={}: requested=₹{}, historicalAvg=₹{}, threshold=₹{}",
                    contactId, amount, avgAmount, unusualThreshold);
            return FraudCheckResult.warning("Unusual amount for this recipient. Do you want to proceed?");
        }

        return FraudCheckResult.clear();
    }
}
