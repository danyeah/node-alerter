# Node Message Alerter

A Node.js service that receives messages via an HTTP endpoint and forwards them to both Telegram and email (via Mailgun).

## Requirements

- Node.js >= 22.0.0
- A Telegram Bot Token (obtain from [@BotFather](https://t.me/botfather))
- A Mailgun account and API key
- JWT Secret for authentication

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. Update `config.js` with your specific settings:
   - Set your Telegram group ID
   - Configure recipient email addresses
   - Adjust the sender email address

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Authentication

The service uses JWT (JSON Web Token) authentication. To use the API:

1. First, generate a token using the `/generate-token` endpoint:
   ```bash
   curl -X POST http://localhost:3000/generate-token
   ```

2. Use the token in your requests by adding it to the Authorization header:
   ```bash
   curl -X POST http://localhost:3000/api/message \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{"message": "Your alert message here"}'
   ```

The tokens are valid for 30 days.

## Response Format

Successful response:
```json
{
  "success": true,
  "telegram": true,
  "email": true
}
```

The `telegram` and `email` fields indicate whether the message was successfully sent through each channel.

## Error Responses

Authentication errors:
- 401: Missing or malformed authorization header
- 403: Invalid or expired token

Other errors:
- 400: Missing message in request body
- 500: Failed to send message through all channels 