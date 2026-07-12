# Loan Management System

Full-stack loan management application with customer applications, admin approval workflow, EMI calculation, and payment tracking.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, React Router, Axios |
| Backend  | Node.js, Express, PostgreSQL, Sequelize |
| Auth     | JWT, bcryptjs                       |

## Project Structure

```
loan-management-system/
├── frontend/          # React SPA
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       └── routes/
└── backend/           # REST API
    ├── database/      # SQL schema reference
    └── src/
        ├── controllers/
        ├── routes/
        ├── middleware/
        ├── models/
        ├── services/
        ├── utils/
        └── config/
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a remote connection string)

### Backend

```bash
# Create the database (first time only)
createdb loan_management

cd backend
cp .env.example .env
npm install
npm run dev
```

API runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.

## Scripts

| Location  | Command        | Description        |
|-----------|----------------|--------------------|
| backend   | `npm run dev`  | Start API (nodemon)|
| backend   | `npm run lint` | ESLint             |
| backend   | `npm test`     | Run all API tests  |
| backend   | `npm run test:e2e` | Run end-to-end flow tests |

API documentation: `backend/docs/openapi.yaml`

| frontend  | `npm run dev`  | Start Vite dev     |
| frontend  | `npm run lint` | Oxlint             |
| frontend  | `npm run build`| Production build   |

## Development Stages

1. Requirement Analysis
2. Project Setup
3. Database Design
4. API Planning
5. Authentication
6. Loan Application
7. EMI Calculator
8. Loan Approval Workflow
9. Loan Status Tracking
10. Payment History
11. Frontend UI
12. Validation
13. Testing
14. Code Cleanup
15. Deployment
