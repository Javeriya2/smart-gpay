package com.smartgpay.controller;

import com.smartgpay.dto.IntentExtractRequest;
import com.smartgpay.dto.IntentExtractResponse;
import com.smartgpay.service.GeminiIntentExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/intent")
public class PaymentIntentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentIntentController.class);

    private final GeminiIntentExtractor intentExtractor;

    public PaymentIntentController(GeminiIntentExtractor intentExtractor) {
        this.intentExtractor = intentExtractor;
    }

    @PostMapping("/extract")
    public ResponseEntity<?> extractIntent(@RequestBody IntentExtractRequest request) {
        if (request == null || request.getUserMessage() == null || request.getUserMessage().trim().isEmpty()) {
            logger.warn("Received empty userMessage for intent extraction");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new IntentExtractResponse(null, null, "userMessage is required"));
        }

        try {
            String userMessage = request.getUserMessage().trim();
            Map<String, Object> intent = intentExtractor.extractIntent(userMessage);

            IntentExtractResponse response = new IntentExtractResponse(userMessage, intent, "SUCCESS");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error performing intent extraction for userMessage: {}", request.getUserMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new IntentExtractResponse(request.getUserMessage(), null, "Extraction failed: " + e.getMessage()));
        }
    }
}
