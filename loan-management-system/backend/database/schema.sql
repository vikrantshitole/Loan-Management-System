-- Loan Management System - PostgreSQL Schema

CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE loan_status AS ENUM ('Pending', 'Under Review', 'Approved', 'Rejected');

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'customer',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loans (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_amount     DECIMAL(12, 2) NOT NULL CHECK (loan_amount > 0),
    interest_rate   DECIMAL(5, 2) NOT NULL CHECK (interest_rate > 0 AND interest_rate <= 30),
    duration_months INTEGER NOT NULL CHECK (duration_months >= 6 AND duration_months <= 360),
    purpose         VARCHAR(500) NOT NULL,
    status          loan_status NOT NULL DEFAULT 'Pending',
    approved_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id                SERIAL PRIMARY KEY,
    loan_id           INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount            DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remaining_balance DECIMAL(12, 2) NOT NULL CHECK (remaining_balance >= 0)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_user_status ON loans(user_id, status);
CREATE INDEX idx_loans_status_created ON loans(status, created_at DESC);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_loan_date ON payments(loan_id, payment_date DESC);
