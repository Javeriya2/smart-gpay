# Smart GPay 🚀

AI-powered natural language payment assistant. Send money by simply saying "Send ₹500 to Rahul."

## Features

- 💬 Natural language payment requests (Gemini-powered)
- 🎯 Smart recipient matching with alias support
- 🤔 Multi-turn clarification for ambiguous requests
- 📝 Full transaction audit trail
- 🏦 Mock UPI payment system

## Tech Stack

Spring Boot 3.x | Java 17 | PostgreSQL | Google Gemini | REST API

## Quick Start

### Setup
```bash
# Clone repo
git clone https://github.com/Javeriya2/smart-gpay.git
cd smart-gpay

# Create PostgreSQL database
createdb smartgpay_db

# Add GCP credentials (never commit this!)
cp /path/to/gcp-key.json src/main/resources/

# Configure application.properties with DB & GCP details

# Run
mvn spring-boot:run
```

Server runs on: `http://localhost:8080`

## API Example

```bash
POST /api/payment/process
{
  "userId": 1,
  "userMessage": "Send ₹500 to Rahul"
}

Response:
{
  "status": "SUCCESS",
  "confirmation": "✅ Sent ₹500 to Rahul. New balance: ₹4500"
}
```

## Status Flow

`INITIATED → INTENT_EXTRACTED → CONTACT_RESOLVED → PROCESSING → SUCCESS`

## Testing

```bash
mvn test  # 13+ tests, all passing
```

---

Built for Hackathon (Aug-Sep 2026) | [View Demo](http://localhost:8080)

