# Implementation Plan - Checkpoint 1: Entity Resolution & Mock Payment Loop

Complete the end-to-end payment happy-path flow for Smart GPay by building:
1. `ContactResolutionService`: Fuzzy & alias contact matching.
2. `PaymentExecutionService`: Balance validation, transaction persistence, mock UPI execution, and audit logging.
3. `ConfirmationGeneratorService`: Gemini-powered natural language payment confirmation.
4. `PaymentFlowController`: End-to-end process endpoint (`POST /api/payment/process`).
5. Unit & integration test suite verifying the happy-path flow.

## User Review Required

> [!IMPORTANT]
> - Endpoint: `POST /api/payment/process`
> - Payload: `{ "userId": 1, "userMessage": "Send ₹500 to Rahul" }`
> - Output: `{ "status": "SUCCESS", "transactionId": 1, "confirmation": "✅ Sent ₹500 to Rahul. New balance: ₹4500", ... }`

## Proposed Changes

### DTO Layer

#### [NEW] [PaymentProcessRequest.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/main/java/com/smartgpay/dto/PaymentProcessRequest.java)
- Payload object containing `userId` (Long) and `userMessage` (String).

#### [NEW] [PaymentProcessResponse.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/main/java/com/smartgpay/dto/PaymentProcessResponse.java)
- Response payload containing `status`, `transactionId`, `confirmation`, `amount`, `recipientName`, `newBalance`, `ambiguousContacts`, and `message`.

#### [NEW] [ContactResolutionResult.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/main/java/com/smartgpay/dto/ContactResolutionResult.java)
- Data structure representing resolution outcome (`matchedContact`, `ambiguousContacts`, `isAmbiguous`, `isFound`).

---

### Service Layer

#### [NEW] [ContactResolutionService.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/main/java/com/smartgpay/service/ContactResolutionService.java)
- Resolves recipient names against contacts and contact_aliases using exact match, case-insensitive partial match, alias match, and fuzzy edit distance.
- Handles duplicate names by returning an ambiguous match list when multiple payees share the same name.

#### [NEW] [PaymentExecutionService.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/main/java/com/smartgpay/service/PaymentExecutionService.java)
- Validates sender balance against transaction amount.
- Executes mock sandbox UPI payment transaction.
- Updates sender balance and saves `Transaction` record with state log progression (`PROCESSING` -> `SUCCESS` or `VALIDATION_FAILED`).

#### [NEW] [ConfirmationGeneratorService.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/main/java/com/smartgpay/service/ConfirmationGeneratorService.java)
- Generates natural language payment confirmations using Gemini (with friendly Hinglish / English confirmation text).

---

### Controller Layer

#### [NEW] [PaymentFlowController.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/main/java/com/smartgpay/controller/PaymentFlowController.java)
- `@RestController @RequestMapping("/api/payment")`
- Endpoint: `POST /api/payment/process`
- Orchestrates: Intent Extraction -> Contact Resolution -> Payment Execution -> Confirmation Generation.

---

### Test Suite

#### [NEW] [PaymentFlowControllerTest.java](file:///c:/Users/Javeriya%20Taj/OneDrive/Desktop/Smart%20Gpay/src/test/java/com/smartgpay/controller/PaymentFlowControllerTest.java)
- Integration test for `POST /api/payment/process` happy path: `"Send ₹500 to Rahul"` for a user with balance ₹5000 and contact named Rahul.

## Verification Plan

### Automated Tests
- Run `mvn test` to verify all unit & integration tests pass cleanly:
  `cmd /c "set JAVA_HOME=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.2\jbr&& set PATH=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.2\jbr\bin;%PATH%&& ""C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.2\plugins\maven\lib\maven3\bin\mvn.cmd"" test"`
