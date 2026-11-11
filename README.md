# Invoza

A modern invoicing app for freelancers and small businesses. Manage customers and products, create invoices, track their status and download them as PDF.

> **Status:** in active development. The core invoicing flow works end to end; email sending, a public landing page, and billing plans are planned.

## Features

- **Accounts:** register, log in and stay signed in across page refreshes. Private pages are protected.
- **Customers and products/services:** create, view, edit and delete.
- **Invoices:** choose a customer, add line items (quantity x price) and get totals calculated on the server.
- **Invoice status flow:** draft, sent, paid or cancelled. Only drafts can be edited or deleted.
- **Overdue tracking:** a sent invoice past its due date is shown as *Overdue* (worked out from the due date, not stored).
- **Business profile:** your business name, contact details, tax ID and payment details (such as bank account) appear on every invoice.
- **Invoice preview and PDF:** a professional A4 invoice layout; use *Download PDF* and choose "Save as PDF" in the print dialog.
- **Dashboard:** total invoiced, paid, pending and overdue amounts, per currency, plus your latest invoices.
- **Search, filter and pagination** on the invoice list.
- **Multi-currency:** each invoice has its own currency. Amounts in different currencies are never added together.
- **Responsive:** works on mobile, tablet and desktop.

## Tech stack

| Part | Tools |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS v4, React Hook Form |
| Backend | Node.js, Express 5, MongoDB (Atlas), Mongoose |
| Security | JWT, bcryptjs, Helmet, CORS, express-rate-limit |

## Project structure

```text
Invoza/
├── client/   # React app (Vite)
└── server/   # Express API
```

## Getting started

### Requirements

- Node.js (a current LTS version)
- A MongoDB database (a free MongoDB Atlas cluster works)

### 1. Backend

```bash
cd server
npm install
```

Create a file named `.env` inside `server/` (use `.env.example` as a template) and fill in your own values:

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | A long, random secret used to sign login tokens |
| `JWT_EXPIRES_IN` | Token lifetime, for example `1d` |
| `CLIENT_URL` | Frontend address allowed by CORS (default `http://localhost:5173`) |

```bash
npm start
```

The API runs at `http://localhost:5000/api`.

### 2. Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

## Scripts

| Where | Command | What it does |
|---|---|---|
| `server` | `npm start` | Start the API |
| `server` | `npm run test:api` | Run the API test script (see below) |
| `client` | `npm run dev` | Start the development server |
| `client` | `npm run build` | Create a production build |
| `client` | `npm run lint` | Check the code with oxlint |

## Testing

`server/scripts/invoice-api-test.js` runs 72 checks against a running API: validation, totals, status rules, business profile, and ownership (one user cannot read or change another user's data).


The script expects the API at `http://localhost:5000/api`. Set `API_URL` to use another address.

## Invoice rules

- Quantity: 1 to 10,000, up to 2 decimals.
- Unit price: 0 to 100,000,000.
- Up to 50 items per invoice.
- Tax rate: 0 to 100 percent.
- Invoice numbers are generated per user (`INV-0001`, `INV-0002`, ...).
- Totals are always calculated on the server; values sent by the browser are ignored.
- Customer and business details are copied onto the invoice, so old invoices do not change when a customer or profile is edited later. A business profile snapshot is refreshed while an invoice is a draft and frozen once it is sent.

## Security notes

- Passwords are hashed with bcrypt. Login and register requests are rate limited.
- Every private API route checks the login token, and every query is limited to the logged-in user's own data.
- All input is validated on the server, not only in the browser.
- The login token is kept in the browser's `localStorage` so sessions survive a refresh. This is simple, but it means the token could be read if the site ever had an XSS flaw, so the app avoids injecting raw HTML. Moving to an `HttpOnly` cookie is a possible later improvement.

## Roadmap

- Send invoices by email
- Landing page and pricing page
- Email verification and password reset
- Deployment (domain, HTTPS, backups)
- Plans and billing
- Payment link on invoices

## License

All rights reserved. This project is not currently open source.