# Loan Management System

A full-stack loan management application for customer applications, admin approval workflows, EMI calculation, and payment tracking. Built with a layered backend and a React SPA frontend.

## Features

### Customer

- Register and sign in with JWT authentication
- Apply for loans with amount, interest rate, tenure, and purpose
- View loan dashboard with status, EMI, and outstanding balance
- Track individual loan status and approval remarks
- Record payments against approved loans
- View payment history per loan
- Use the public EMI calculator (no login required)

### Admin

- Review all loan applications with filtering and pagination
- Approve or reject loans with optional remarks (required on rejection)
- Enforce valid loan status transitions via a state machine

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | Node.js, Express 5, Sequelize |
| Database | PostgreSQL |
| Auth | JWT, bcryptjs |
| Validation | express-validator (server), shared client validators |
| Testing | Node.js built-in test runner, Supertest |

## Architecture

The project follows a strict layered design:

```
Routes → Middleware → Controllers → Services → Models
```

- **Routes** declare HTTP paths and middleware chains only
- **Controllers** are thin adapters that call services and return responses
- **Services** contain business logic, authorization checks, and data access
- **Mappers** decouple Sequelize models from the public API shape

All API responses use a consistent envelope:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

Errors return `{ success: false, message, errors? }` with appropriate HTTP status codes.

## Project Structure

```
loan-management-system/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/       # AppLayout, Navbar, Sidebar, ProtectedLayout
│       │   └── ui/           # Button, Card, FormField, Loader, Table, Modal
│       ├── context/          # AuthContext (session management)
│       ├── hooks/            # useLoan, useFormTouched, useEmiCalculator
│       ├── pages/            # One file per route
│       ├── routes/           # AppRoutes with layout-based routing
│       ├── services/         # API client layer (auth, loan, payment)
│       ├── styles/           # ui.css, layout.css, pages.css
│       └── utils/            # validation, formatting, EMI helpers
└── backend/
    ├── database/
    │   └── schema.sql        # PostgreSQL schema reference
    ├── docs/
    │   └── openapi.yaml      # API specification
    ├── tests/                # Unit, integration, and E2E tests
    └── src/
        ├── config/           # Environment and database connection
        ├── controllers/      # HTTP handlers
        ├── middleware/       # Auth, authorization, validation, errors
        ├── models/           # Sequelize models (User, Loan, Payment)
        ├── routes/           # Route mounts
        ├── services/         # Domain logic
        ├── utils/            # AppError, mappers, pagination, constants
        └── validators/       # express-validator rule sets
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a remote connection string)

### 1. Create the database

```bash
createdb loan_management
```

Sequelize will sync tables automatically on first startup. The canonical schema is in `backend/database/schema.sql`.

### 2. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 3. Start the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API server port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/loan_management` | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret for signing access tokens (change in production) |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `MAX_LOAN_AMOUNT` | `1000000` | Maximum loan amount |
| `MIN_LOAN_DURATION_MONTHS` | `6` | Minimum loan tenure |
| `MAX_LOAN_DURATION_MONTHS` | `360` | Maximum loan tenure |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/register` | — | Register a new customer |
| `POST` | `/api/login` | — | Sign in and receive JWT |
| `GET` | `/api/me` | Bearer | Get current user profile |
| `POST` | `/api/loan/apply` | Customer | Submit a loan application |
| `POST` | `/api/loan/calculate-emi` | — | Calculate EMI breakdown |
| `GET` | `/api/loan` | Bearer | List loans (scoped by role) |
| `GET` | `/api/loan/:id` | Bearer | Get loan details |
| `PUT` | `/api/loan/:id/status` | Admin | Approve or reject a loan |
| `GET` | `/api/payments/:loanId` | Bearer | Payment history for a loan |
| `POST` | `/api/payments` | Bearer | Record a payment |

Full OpenAPI specification: [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml)

## Frontend Routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Home |
| `/emi-calculator` | Public | EMI Calculator |
| `/login` | Public | Sign in |
| `/register` | Public | Register |
| `/dashboard` | Customer | Loan dashboard |
| `/apply-loan` | Customer | Loan application form |
| `/loans/:id` | Customer | Loan status details |
| `/loans/:id/payments` | Customer | Payment history |
| `/admin` | Admin | Loan review dashboard |

## Loan Status Workflow

```
Pending → Under Review → Approved (terminal)
                      → Rejected (terminal, remarks required)
```

- Admins can move loans through valid transitions only
- Approved and Rejected are terminal states
- Rejection requires remarks

## Database

| Table | Purpose |
|-------|---------|
| `users` | Customer and admin accounts |
| `loans` | Loan applications with status and approval metadata |
| `payments` | Payment records linked to approved loans |

See [`backend/database/schema.sql`](backend/database/schema.sql) for indexes, constraints, and enum types.

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with nodemon |
| `npm start` | Start API (production) |
| `npm run lint` | Run ESLint |
| `npm test` | Run all API tests |
| `npm run test:e2e` | Run end-to-end flow tests |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview production build |

## Testing

Backend tests cover authentication, loan CRUD, status transitions, EMI calculation, payments, and full user flows. Tests run against a real PostgreSQL database with concurrency limited to 1 to avoid race conditions.

```bash
cd backend
npm test
```

Test suites:

- `auth.test.js` — registration and login
- `loan.test.js` — loan application and retrieval
- `loan-approval.test.js` — admin approval workflow
- `loan-status.test.js` — status transition rules
- `emi.test.js` / `emi.api.test.js` — EMI calculation
- `payment.test.js` — payment recording and history
- `e2e-flow.test.js` — full happy path and rejection path


## License

ISC
