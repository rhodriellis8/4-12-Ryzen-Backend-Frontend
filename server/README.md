# Ryzen Trading Journal – Backend

## Getting Started

```bash
cd server
npm install
npm run dev
```

The server listens on `http://localhost:4000` by default. Configure the port with the `PORT` environment variable.

## Required Environment Variables

Add these to your project `.env` (values shown are placeholders):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key
SUPABASE_STORAGE_BUCKET=user-content
STRIPE_SECRET_KEY=sk_live_or_test
STRIPE_WEBHOOK_SECRET=whsec_*
```

The frontend still requires the Vite `VITE_*` variables for browser usage.

## API Overview

### Authenticated Export Routes (`/api/export/*`)

- `GET /trades?format=csv|json&start_date=&end_date=` – download trade history.
- `GET /journal/:journalId` – single journal entry as PDF.
- `GET /journals/all` – all journals compiled into one PDF.
- `GET /playbook/:playbookId` – playbook PDF.
- `GET /full-backup` – ZIP archive containing `data.json`, `README`, and all linked images.

Attach the Supabase access token via `Authorization: Bearer <token>`.

### Privacy & Account Routes (`/api/privacy/*`)

- `POST /request-deletion` – queue a manual deletion request (current user).
- `GET /requests` – list deletion requests (admin only).
- `PATCH /request/:requestId` – update request status/notes (admin only).
- `DELETE /account` – self-service deletion of all stored data and Supabase auth user.

### Stripe

- `POST /api/create-checkout-session` – creates a Checkout session for subscriptions. Requires `priceId`, `userId`, and optional `plan`.
- `POST /api/stripe/webhook` – Stripe webhook endpoint (use the raw request body and `STRIPE_WEBHOOK_SECRET`).

## Notes

- Heavy exports (journal PDF + full backup) are cached for one hour per user and rate-limited.
- `export_logs` should have RLS enabled so users see only their own records (with an admin override).
- The backend uses the Supabase service-role key exclusively on the server; never expose it to the client.

