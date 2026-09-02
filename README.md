<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# Smart GPay 🚀

AI-powered natural language payment assistant. Send money by simply saying "Send ₹500 to Rahul."

## Features

- 💬 Natural language payment requests (Gemini-powered)
- 🎯 Smart recipient matching with alias support
- 🤔 Multi-turn clarification for ambiguous requests
- 📝 Full transaction audit trail
- 🏦 Mock UPI payment system
- Integration with BigQuery for analytics

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

Built for Patchamomma 2026

>>>>>>> cf5a35f35c8317d0f95e39ae88c1d40ad2f40462
