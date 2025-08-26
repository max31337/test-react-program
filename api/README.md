# IP Geo API

Simple Node.js (Express) API for authentication using a JSON file as a datastore.

## Endpoints

POST /api/login
Payload: { "email": "user@example.com", "password": "Password123!" }
Response: { token, user }

## Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Install deps: `npm install`
3. Seed users: `npm run seed`
4. Run dev: `npm run dev`

A seeded user is printed to the console after seeding.

## Security Notes
- Password hashing uses bcrypt with 12 salt rounds.
- Plaintext password retention is ONLY because of the explicit exercise requirement and should never be used in production.
- JWT includes only minimal identifying claims (sub, email) and short expiry.
