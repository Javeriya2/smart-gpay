package com.smartgpay.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ConfirmationGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(ConfirmationGeneratorService.class);

    /**
     * Generates a friendly natural language payment confirmation message.
     * 
     * @param recipientName Name of the payee/recipient
     * @param amount Payment amount
     * @param newBalance User's updated balance after payment
     * @return Natural language confirmation text
     */
    public String generateConfirmation(String recipientName, BigDecimal amount, BigDecimal newBalance) {
        logger.info("Generating confirmation for payment to {} of amount ₹{}, newBalance=₹{}", recipientName, amount, newBalance);

        String amountStr = (amount != null) ? amount.stripTrailingZeros().toPlainString() : "0";
        String balanceStr = (newBalance != null) ? newBalance.stripTrailingZeros().toPlainString() : "0";

        // Standard friendly confirmation format with Hinglish touch
        return String.format("✅ Sent ₹%s to %s. New balance: ₹%s", amountStr, recipientName, balanceStr);
    }
}
