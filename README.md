# Jayam Wellness

E-commerce site for Jayam Wellness — simple, clean, plant-based wellness products for customers in the United States.

- **web/** — storefront and admin (React 19, Vite, Tailwind CSS)
- **backend/** — REST API (Node.js, Express, Prisma ORM, PostgreSQL); email through Resend, payments through Stripe

## Features

- Product catalogue with full ingredient, usage and safety information
- Bag and guest checkout with Stripe: cards, Apple Pay, Google Pay and Link, USD pricing
- Discount codes (percent or dollars off, minimum order, use limit, start and end dates)
- Full and partial refunds from the admin panel; refunds made in the Stripe Dashboard sync back
- Unpaid checkouts released after two hours; payment disputes and low stock emailed to the team
- U.S. shipping: $5.99 flat, free on orders $49+, all states and U.S. territories
- Emails (Resend): order confirmation with receipt, shipped, delivered, refund, cancellation, welcome,
  password reset, contact-form reply, and new-order / low-stock / dispute alerts for the team
- Order tracking page and printable receipts
- Admin: dashboard, orders, products, discounts, site content, enquiries, reviews, users, and a Setup page
  that checks every key and sends a test email

## Requirements

- Node.js 22+

PostgreSQL runs locally through Prisma (`prisma dev`), so no separate database install is needed for development.

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in the values
npm run db:start            # starts a local PostgreSQL server
npm run db:migrate          # creates the tables
npm run db:seed             # loads the products and a development admin user
npm run dev                 # API on http://localhost:5005
```

`npm run db:start` prints the database URLs; make sure `DATABASE_URL` and `SHADOW_DATABASE_URL` in `.env` match them.

### 2. Web

```bash
cd web
npm install
cp .env.example .env.local  # then fill in the values
npm run dev                 # site on http://localhost:5173
```

### Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:5005/api/payments/stripe/webhook
```

Put the `whsec_…` secret it prints into `STRIPE_WEBHOOK_SECRET` in `backend/.env`.

## Useful scripts (backend)

| Command | What it does |
| --- | --- |
| `npm run dev` | API with auto-reload |
| `npm start` | API only (production) |
| `npm run db:start` / `db:stop` | Start / stop the local PostgreSQL server |
| `npm run db:migrate` | Create and apply a migration after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:seed` | Reset products and the development admin user |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Configuration

All secrets live in `backend/.env` and `web/.env.local`, which are git-ignored. See `backend/.env.example` and `web/.env.example` for every setting. Contact links (email, WhatsApp, Instagram) are hidden on the site until their `VITE_…` values are set.

### Going live: the keys to add

Everything is built; the store only needs its keys. Fill these in, then restart the API and rebuild the site.
**Admin → Setup** shows what's still missing and can send you a test email.

| Where | Key | From |
| --- | --- | --- |
| `backend/.env` | `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (secret key) |
| `web/.env.local` | `VITE_STRIPE_PUBLISHABLE_KEY` | Same page (publishable key, same test/live mode) |
| `backend/.env` | `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → add `{BACKEND_URL}/api/payments/stripe/webhook` with the five events listed in `.env.example`, then copy its signing secret |
| `backend/.env` | `RESEND_API_KEY` | Resend → API keys |
| `backend/.env` | `MAIL_FROM` | An address on a domain verified in Resend → Domains, e.g. `Jayam Wellness <orders@yourdomain.com>` |
| `backend/.env` | `SUPPORT_EMAIL`, `ORDER_ALERT_EMAIL` | Your inboxes for customer replies and store alerts |
| `backend/.env` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional: Google Cloud → Credentials (see `.env.example`) |
| `backend/.env` | `JWT_SECRET`, `SESSION_SECRET` | Long random strings: `openssl rand -hex 32` |
| `backend/.env` | `FRONTEND_URL`, `BACKEND_URL` | Your site's addresses, e.g. `https://jayam.lumiodigital.store` |

In Stripe, also turn on the payment methods you want (Settings → Payment methods) and, for Apple Pay, add your
domain there. Test with `sk_test_` / `pk_test_` keys and card `4242 4242 4242 4242` first, then switch both to live keys.

`npm run db:seed` creates an admin user from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Without them it falls back to a development-only default — always set them outside your own machine.
