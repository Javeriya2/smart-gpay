package com.smartgpay.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartgpay.dto.ContactDTO;
import com.smartgpay.dto.TransactionDTO;
import com.smartgpay.dto.UserDTO;
import com.smartgpay.model.TransactionStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("UserController - Create user & retrieve by ID")
    void testUserApiFlow() throws Exception {
        UserDTO userDTO = new UserDTO("Aarav", "aarav@okaxis", new BigDecimal("15000.00"));

        // POST /api/users
        String responseContent = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name", is("Aarav")))
                .andExpect(jsonPath("$.upiId", is("aarav@okaxis")))
                .andReturn().getResponse().getContentAsString();

        Long userId = objectMapper.readTree(responseContent).get("id").asLong();

        // GET /api/users/{id}
        mockMvc.perform(get("/api/users/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(userId.intValue())))
                .andExpect(jsonPath("$.name", is("Aarav")));

        // GET /api/users/{userId}/contacts (should be empty initially)
        mockMvc.perform(get("/api/users/" + userId + "/contacts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("ContactController - Create contact & search by name")
    void testContactApiFlow() throws Exception {
        // Create user first
        UserDTO userDTO = new UserDTO("Priya", "priya@okaxis", new BigDecimal("8000.00"));
        String userResponse = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long userId = objectMapper.readTree(userResponse).get("id").asLong();

        // POST /api/contacts
        ContactDTO contactDTO = new ContactDTO(userId, "Rahul Sharma", "rahul.blr@okaxis");
        String contactResponse = mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contactDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name", is("Rahul Sharma")))
                .andExpect(jsonPath("$.vpa", is("rahul.blr@okaxis")))
                .andReturn().getResponse().getContentAsString();

        Long contactId = objectMapper.readTree(contactResponse).get("id").asLong();

        // GET /api/contacts/{id}
        mockMvc.perform(get("/api/contacts/" + contactId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Rahul Sharma")));

        // GET /api/contacts/search?userId={userId}&name={name}
        mockMvc.perform(get("/api/contacts/search")
                        .param("userId", userId.toString())
                        .param("name", "Rahul Sharma"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].vpa", is("rahul.blr@okaxis")));
    }

    @Test
    @DisplayName("TransactionController - Create transaction & retrieve by ID")
    void testTransactionApiFlow() throws Exception {
        // Create sender user
        UserDTO senderDTO = new UserDTO("Sender", "sender@okaxis", new BigDecimal("10000.00"));
        String senderResp = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(senderDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long senderId = objectMapper.readTree(senderResp).get("id").asLong();

        // Create receiver contact
        ContactDTO contactDTO = new ContactDTO(senderId, "Receiver Contact", "rec@okaxis");
        String contactResp = mockMvc.perform(post("/api/contacts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contactDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long receiverId = objectMapper.readTree(contactResp).get("id").asLong();

        // POST /api/transactions
        TransactionDTO txDTO = new TransactionDTO(senderId, receiverId, new BigDecimal("750.00"), "pay 750 to Receiver", TransactionStatus.INITIATED);
        String txResp = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.amount", is(750.0)))
                .andExpect(jsonPath("$.status", is("INITIATED")))
                .andReturn().getResponse().getContentAsString();

        Long txId = objectMapper.readTree(txResp).get("id").asLong();

        // GET /api/transactions/{id}
        mockMvc.perform(get("/api/transactions/" + txId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(txId.intValue())))
                .andExpect(jsonPath("$.rawQuery", is("pay 750 to Receiver")));
    }
}
