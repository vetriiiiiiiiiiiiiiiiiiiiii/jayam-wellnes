# Jayam Wellness

E-commerce site for Jayam Wellness — simple, clean, plant-based wellness products for customers in the United States.

- **web/** — storefront and admin (React 19, Vite, Tailwind CSS)
- **backend/** — REST API (Node.js, Express, Prisma ORM, PostgreSQL), with background jobs on BullMQ/Redis

## Features

- Product catalogue with full ingredient, usage and safety information
- Bag and guest checkout with Stripe (cards and wallets), USD pricing
- U.S. shipping: $5.99 flat, free on orders $49+, all states and U.S. territories
- Order confirmation and shipping emails, order tracking page, printable receipts
- Contact form with enquiry categories and automatic confirmation emails
- FAQ, Our Story and shipping information pages
- Admin: dashboard, orders (with carrier and tracking), products, users, reviews, enquiries

## Requirements

- Node.js 22+
- Redis (for the email and background job queue) — optional for browsing locally

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
npm run dev                 # API on http://localhost:5005 (plus background workers)
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
| `npm run dev` | API and background workers with auto-reload |
| `npm start` | API only (production) |
| `npm run db:start` / `db:stop` | Start / stop the local PostgreSQL server |
| `npm run db:migrate` | Create and apply a migration after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:seed` | Reset products and the development admin user |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Configuration

All secrets live in `backend/.env` and `web/.env.local`, which are git-ignored. See `backend/.env.example` and `web/.env.example` for every setting. Contact links (email, WhatsApp, Instagram) are hidden on the site until their `VITE_…` values are set.

`npm run db:seed` creates an admin user from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Without them it falls back to a development-only default — always set them outside your own machine.
