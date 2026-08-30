package com.smartgpay.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.GenerationConfig;

import com.google.cloud.vertexai.generativeai.ContentMaker;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Gemini Intent Extraction Service for Smart GPay.
 * Translates natural language payment requests into structured JSON intents.
 * 
 * Sample Test Utterances:
 * - "Send ₹500 to Rahul"
 * - "Transfer 1000 to my friend Priya"
 * - "Pay Rahul 250 rupees"
 */
@Service
public class GeminiIntentExtractor {

    private static final Logger logger = LoggerFactory.getLogger(GeminiIntentExtractor.class);

    private final String projectId;
    private final String location;
    private final String credentialsPath;
    private final ObjectMapper objectMapper;

    private static final String MODEL_NAME = "gemini-2.5-flash";
    private static final String SYSTEM_INSTRUCTION = """
            You are a payment intent extraction AI for Smart GPay.
            Your task is to extract structured intent from natural language user input.
            
            Return ONLY a valid JSON object with the following fields:
            - "action": "PAYMENT" | "TRANSFER" | "BILL_PAY" | "UNKNOWN"
            - "amount": numeric value (e.g., 500.00) or null if unspecified
            - "recipient": String name of payee or recipient or null
            - "context": String description or extra context or null
            
            Do not include markdown code fence formatting (```json) or extra prose.
            """;

    public GeminiIntentExtractor(
            @Value("${gcp.project-id:smartgpay}") String projectId,
            @Value("${gcp.location:us-central1}") String location,
            @Value("${gcp.credentials-path:src/main/resources/gcp-key.json}") String credentialsPath,
            ObjectMapper objectMapper) {
        this.projectId = (projectId != null && !projectId.isBlank()) ? projectId : "smartgpay";
        this.location = (location != null && !location.isBlank()) ? location : "us-central1";
        this.credentialsPath = credentialsPath;
        this.objectMapper = objectMapper;
    }

    /**
     * Parses a natural language user message into a structured payment intent JSON object.
     * 
     * @param userMessage Natural language request, e.g., "Send ₹500 to Rahul"
     * @return Map or JSON representation containing action, amount, recipient, and context
     */
    public Map<String, Object> extractIntent(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            throw new IllegalArgumentException("userMessage cannot be empty");
        }

        logger.info("Extracting intent for message: '{}'", userMessage);

        try {
            return callVertexAiGemini(userMessage);
        } catch (Exception e) {
            logger.warn("Vertex AI Gemini call failed or credentials not present ({}), falling back to regex/rule parser.", e.getMessage());
            return fallbackRuleExtractor(userMessage);
        }
    }

    private Map<String, Object> callVertexAiGemini(String userMessage) throws Exception {
        InputStream credStream = locateCredentialsStream();
       // GoogleCredentials credentials = (credStream != null) ? GoogleCredentials.fromStream(credStream) : null;
        GoogleCredentials credentials = (credStream != null)
                ? GoogleCredentials.fromStream(credStream)
                .createScoped("https://www.googleapis.com/auth/cloud-platform")
                : null;
        VertexAI.Builder vertexBuilder = new VertexAI.Builder()
                .setProjectId(this.projectId)
                .setLocation(this.location);

        if (credentials != null) {
            vertexBuilder.setCredentials(credentials);
        }

        try (VertexAI vertexAI = vertexBuilder.build()) {
            GenerationConfig genConfig = GenerationConfig.newBuilder()
                    .setResponseMimeType("application/json")
                    .setTemperature(0.1f)
                    .build();

            GenerativeModel model = new GenerativeModel(MODEL_NAME, vertexAI)
                    .withGenerationConfig(genConfig)
                    .withSystemInstruction(ContentMaker.fromMultiModalData(SYSTEM_INSTRUCTION));

            GenerateContentResponse response = model.generateContent(userMessage);
            String rawJson = ResponseHandler.getText(response);
            logger.debug("Received raw response from Gemini: {}", rawJson);

            return parseJsonToMap(rawJson);
        }
    }

    private InputStream locateCredentialsStream() {
        try {
            // Try configured file path first
            File file = new File(credentialsPath);
            if (file.exists()) {
                logger.info("Loading GCP credentials from file: {}", file.getAbsolutePath());
                return new FileInputStream(file);
            }

            // Try fallback relative path 'resources/gcp-key.json'
            File altFile = new File("src/main/resources/gcp-key.json");
            if (altFile.exists()) {
                logger.info("Loading GCP credentials from fallback file: {}", altFile.getAbsolutePath());
                return new FileInputStream(altFile);
            }

            // Try classpath resource
            InputStream cpStream = getClass().getClassLoader().getResourceAsStream("gcp-key.json");
            if (cpStream != null) {
                logger.info("Loading GCP credentials from classpath: gcp-key.json");
                return cpStream;
            }
        } catch (Exception e) {
            logger.warn("Could not load credentials stream: {}", e.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonToMap(String rawJson) {
        try {
            String cleanedJson = rawJson.trim();
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.substring(7);
            }
            if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.substring(3);
            }
            if (cleanedJson.endsWith("```")) {
                cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
            }
            cleanedJson = cleanedJson.trim();

            return objectMapper.readValue(cleanedJson, Map.class);
        } catch (Exception e) {
            logger.error("Failed to parse Gemini response JSON: {}", rawJson, e);
            throw new RuntimeException("Failed to parse Gemini JSON intent response", e);
        }
    }

    /**
     * Fallback parser for offline/test mode when Vertex AI credentials are not present.
     */
    public Map<String, Object> fallbackRuleExtractor(String userMessage) {
        Map<String, Object> result = new HashMap<>();
        String text = userMessage.trim();

        // Extract action
        String action = "PAYMENT";
        if (text.toLowerCase().contains("transfer")) {
            action = "TRANSFER";
        } else if (text.toLowerCase().contains("bill") || text.toLowerCase().contains("pay bill")) {
            action = "BILL_PAY";
        }
        result.put("action", action);

        // Extract amount (e.g. ₹500, 500, 1000, 250 rupees)
        Matcher amountMatcher = Pattern.compile("(?:₹|rs\\.?|rupees)?\\s*(\\d+(?:\\.\\d{1,2})?)\\s*(?:rupees|rs\\.?)?", Pattern.CASE_INSENSITIVE).matcher(text);
        if (amountMatcher.find()) {
            try {
                result.put("amount", new BigDecimal(amountMatcher.group(1)));
            } catch (Exception ignored) {
                result.put("amount", null);
            }
        } else {
            result.put("amount", null);
        }

        // Extract recipient (e.g. "to Rahul", "to my friend Priya", "Pay Rahul")
        Matcher recipientMatcher = Pattern.compile("(?:to|pay)\\s+([A-Za-z\\s]+?)(?:\\s+\\d+|\\s*$)", Pattern.CASE_INSENSITIVE).matcher(text);
        if (recipientMatcher.find()) {
            String target = recipientMatcher.group(1).replaceAll("(?i)^(my friend|mr\\.?|mrs\\.?)\\s+", "").trim();
            result.put("recipient", target);
        } else {
            result.put("recipient", null);
        }

        result.put("context", "Fallback rule-extracted intent from user request");
        return result;
    }
}
