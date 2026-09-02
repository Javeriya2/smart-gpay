package com.smartgpay.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartgpay.dto.IntentExtractRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentIntentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Extract Intent - Send ₹500 to Rahul")
    void testExtractIntentSendRahul() throws Exception {
        IntentExtractRequest request = new IntentExtractRequest("Send ₹500 to Rahul");

        mockMvc.perform(post("/api/intent/extract")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.userMessage", is("Send ₹500 to Rahul")))
                .andExpect(jsonPath("$.intent.action", notNullValue()))
                .andExpect(jsonPath("$.intent.recipient", containsStringIgnoringCase("Rahul")));
    }

    @Test
    @DisplayName("Extract Intent - Transfer 1000 to my friend Priya")
    void testExtractIntentTransferPriya() throws Exception {
        IntentExtractRequest request = new IntentExtractRequest("Transfer 1000 to my friend Priya");

        mockMvc.perform(post("/api/intent/extract")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.userMessage", is("Transfer 1000 to my friend Priya")))
                .andExpect(jsonPath("$.intent.action", notNullValue()))
                .andExpect(jsonPath("$.intent.recipient", containsStringIgnoringCase("Priya")));
    }

    @Test
    @DisplayName("Extract Intent - Pay Rahul 250 rupees")
    void testExtractIntentPayRahul() throws Exception {
        IntentExtractRequest request = new IntentExtractRequest("Pay Rahul 250 rupees");

        mockMvc.perform(post("/api/intent/extract")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.userMessage", is("Pay Rahul 250 rupees")))
                .andExpect(jsonPath("$.intent.action", notNullValue()));
    }

    @Test
    @DisplayName("Extract Intent - Empty Request returns 400 Bad Request")
    void testExtractIntentEmptyRequest() throws Exception {
        IntentExtractRequest request = new IntentExtractRequest("");

        mockMvc.perform(post("/api/intent/extract")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is("userMessage is required")));
    }
}
