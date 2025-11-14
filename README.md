# FixItNow

FixItNow is a full-stack web application that connects users with local service providers (electricians, plumbers, carpenters, appliance repair, cleaners and more). This repository contains a React client and an Express/MongoDB server.

This README documents the project, how to run it locally, the API, data models, environment variables (including SMTP for email notifications), and troubleshooting tips so you can deploy or continue development.

---

## Table of contents
- Project overview
- Features
- Architecture
- Getting started (local development)
  - Prerequisites
  - Install and run server
  - Install and run client
- Environment variables
- API reference (endpoints and payloads)
- Data models
- Email notifications
- Common tasks and troubleshooting
- Next steps & improvements
- License

---

## Project overview

FixItNow aims to provide a marketplace for home services. Users can:
- Browse services
- Book a service and schedule a provider
- View ongoing and past requests
- Rate and review providers

Providers can:
- Register as a provider
- See incoming requests
- Accept or decline requests
- Receive ratings and feedback from users

This repository contains two main directories:
- `client/` — React front-end (create-react-app style)
- `server/` — Express API with MongoDB (mongoose models)

## Features

- Service catalog with subservices
- Provider discovery and selection when booking
- Booking workflow with scheduling
- Provider email notifications on bookings (SMTP or Ethereal fallback)
- Provider and user dashboards
- Ratings and feedback system

## Architecture

- Frontend: React (functional components), CSS files under `client/src/pages`.
- Backend: Node.js + Express, MongoDB via Mongoose. Routes live under `server/routes`.
- Email: `nodemailer` used to notify providers on new bookings (configurable via environment variables).

## Getting started (local development)

Prerequisites
- Node.js (v14+ recommended)
- npm
- MongoDB (local or a cloud instance)

1) Clone the repository

```bash
git clone <your-repo-url>
cd FixItNow
```

2) Server setup

```powershell
cd server
npm install
# create .env with values (see Environment variables below)
npm start
```

By default the server listens on port `5000` and connects to `mongodb://localhost:27017/fixitnow` unless `MONGO_URI` is provided.

3) Client setup

Open a new terminal and run:

```powershell
cd client
npm install
npm start
```

The client dev server runs on `http://localhost:3000` by default and proxies API requests to the server (as implemented in the client API helper).

## Environment variables

Create a `.env` file in `server/` (do not commit). The server already uses `dotenv`.

Essential variables:

- `MONGO_URI` (optional) — MongoDB connection string. Defaults to `mongodb://localhost:27017/fixitnow`.
- `JWT_SECRET` (optional) — JSON Web Token secret for authentication. Defaults to `supersecret` if not set (replace in production).

SMTP / Email variables (optional - recommended for real emails):

- `SMTP_HOST` — e.g. `smtp.sendgrid.net` or your SMTP provider host
- `SMTP_PORT` — e.g. `587`
- `SMTP_SECURE` — `true` or `false` (port 465 typically uses secure=true)
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `EMAIL_FROM` — optional "From" address for outgoing emails (e.g. `no-reply@yourdomain.com`)

If SMTP vars are not provided the server falls back to an Ethereal test account and will output an Ethereal preview URL in the logs (good for local testing).

## API reference

Base URL (local): `http://localhost:5000`

Notes: Many endpoints are in `server/routes`. Below are the key endpoints and example shapes.

Auth
- POST `/auth/register` — Register user
  - Body: { name, email, password, phone, address }
- POST `/auth/login` — Login (user or provider)
  - Body: { email, password }
  - Response: { token, user }

Provider register
- POST `/auth/provider-register` — Register as a provider (controller handles)

Services
- GET `/services` — Get all services (seeding occurs if empty)
- GET `/services/providers?service=Plumber&subservice=Tap Installation` — Get providers filtered by service/subservice
- POST `/services/book` — Create a service request (booking)
  - Body: { userId, providerId, service, subservice, address, description, scheduledFor }
  - Response: { message, request }
  - After creation, provider receives an email (if provider email exists). The API returns the created request even if email fails.

Requests
- GET `/requests` — List requests. Query params: `userId`, `providerId`, `status`, `q`
  - Response: array of requests with fields: `_id, service, subservice, status, providerId, providerName, userId, userName, scheduledFor, address, description`
- PATCH `/requests/:id/accept` — Provider accepts request
- PATCH `/requests/:id/decline` — Provider declines request; Body: { reason }
- PATCH `/requests/:id/complete` — Mark request as completed, optionally create rating
  - Body: { rating, comment, userId, providerId }

Feedback
- GET `/feedback?userId=...` or `/feedback?providerId=...` — Get feedback for a user or provider

Provider
- POST `/provider/register` — Register provider (legacy in `providerRoutes`)
- PATCH `/provider/:id` — Update provider profile
- GET `/provider/:id` — Get provider profile (includes computed rating)

More routes: look into `server/routes` for small utilities and edge-case behaviors.

## Data models (Mongoose)

Key models are in `server/models`.

- User (`server/models/User.js`)
  - name, email, password, phone, address, role

- ServiceProvider (`server/models/ServiceProvider.js`)
  - name, email, password, phone, address, services (array of { category, subservices }), experience, rating, ratingCount

- Service (`server/models/Service.js`)
  - name, subservices [{ name, basePrice }]

- Request (`server/models/Request.js`)
  - userId, providerId, service, subservice, address, decription (typo preserved), status (Pending/Accepted/In Progress/Completed/Cancelled/Declined), acceptedAt, declinedAt, cancelReason, scheduledFor, createdAt

- Feedback (`server/models/Feedback.js`)
  - userId, providerId, rating (1-5), comment, createdAt

Note: The `Request` model uses the field `decription` (typo) for the request description. Several routes already handle both `description` and `decription` when reading/writing — consider normalizing the field to `description` in a future change and migrating stored records.

## Email notifications

When a booking is created via `POST /services/book`, the server attempts to send an email to the provider's email address. Behavior:

- If SMTP environment variables are configured, they are used to send a real email.
- If SMTP is not configured, an Ethereal (test-only) account is created and used; the server logs a preview URL which you can open in the browser to view the message.
- Email sending is best-effort and runs asynchronously; request creation is not blocked by email errors.

Example: in server logs you might see:

```
Provider notification email sent: <message-id>
Preview URL: https://ethereal.email/message/....
```

## Common tasks and troubleshooting

- If services don't appear, the server will seed default services on first GET /services. Check server logs for seed messages.
- If provider emails are not delivered in production, ensure SMTP credentials are correct and ports are open.
- If the client shows stale content, clear browser cache or restart the dev server.

Debugging tips
- Check server logs (errors printed to console) when booking or sending emails.
- Use Postman or curl to exercise the API endpoints directly for faster debugging.

Example curl to create a booking (replace IDs):

```bash
curl -X POST http://localhost:5000/services/book \
  -H "Content-Type: application/json" \
  -d '{"userId":"<userId>","providerId":"<providerId>","service":"Plumber","address":"123 Main St","scheduledFor":"2025-10-15T09:30:00.000Z"}'
```

## Next steps & improvements

- Normalize `decription` -> `description` in Request model and migrate any existing records.
- Add authentication middleware and protect endpoints (the current code uses tokens at login but many routes are open).
- Add unit/integration tests (example: mock `nodemailer` and assert email is attempted).
- Improve provider filtering logic in `/services/providers` to precisely match availability, service categories, and subservices.
- Add pagination and rate limiting to heavy endpoints.

## License

This project currently has no license file. Add an appropriate LICENSE if you plan to publish the repo.

---

If you'd like, I can:
- Add a CONTRIBUTING.md and code style guidelines
- Create a migration script to rename `decription` -> `description` safely
- Add an automated test for the email path (mocking `nodemailer`)

Tell me which of the above you'd like next and I'll implement it.
