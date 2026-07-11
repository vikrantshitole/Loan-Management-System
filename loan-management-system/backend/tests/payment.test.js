const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('./helpers/database');
const { registerUser, createAdminUser, loginUser } = require('./helpers/auth');

const customerCredentials = {
  name: 'Payment Customer',
  email: 'payment.customer@example.com',
  password: 'password123',
};

const loanApplication = {
  loanAmount: 200000,
  interestRate: 10,
  durationMonths: 18,
  purpose: 'Education loan',
};

describe('Payment History', () => {
  let customerToken;
  let adminToken;
  let loanId;

  before(async () => {
    await setupTestDatabase();

    const customer = await registerUser(app, customerCredentials);
    customerToken = customer.token;

    await createAdminUser();
    const admin = await loginUser(app, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    adminToken = admin.token;

    const application = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(loanApplication);

    loanId = application.body.data.id;

    await request(app)
      .put(`/api/loan/${loanId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Approved', remarks: 'Approved for education' });
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it('records a payment against an approved loan', async () => {
    const response = await request(app)
      .post('/api/payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        loanId,
        amount: 25000,
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.payment.amount, 25000);
    assert.equal(response.body.data.payment.remainingBalance, 175000);
    assert.equal(response.body.data.summary.totalPaid, 25000);
    assert.equal(response.body.data.summary.remainingBalance, 175000);
  });

  it('lists payment history newest first with totals', async () => {
    await request(app)
      .post('/api/payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        loanId,
        amount: 15000,
        paymentDate: '2026-01-15T10:00:00.000Z',
      });

    const response = await request(app)
      .get(`/api/payments/${loanId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.payments.length, 2);
    assert.equal(response.body.data.totalPaid, 40000);
    assert.equal(response.body.data.remainingBalance, 160000);
    assert.ok(
      new Date(response.body.data.payments[0].paymentDate) >=
        new Date(response.body.data.payments[1].paymentDate)
    );
  });

  it('rejects payment above outstanding balance', async () => {
    const response = await request(app)
      .post('/api/payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        loanId,
        amount: 200000,
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Payment amount exceeds the outstanding balance');
  });

  it('rejects payment on non-approved loans', async () => {
    const pendingApplication = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...loanApplication,
        purpose: 'Pending payment test',
      });

    const response = await request(app)
      .post('/api/payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        loanId: pendingApplication.body.data.id,
        amount: 1000,
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Payments can only be recorded against approved loans');
  });

  it('prevents access to another customers payment history', async () => {
    const otherCustomer = await registerUser(app, {
      name: 'Other Payment User',
      email: 'other.payment@example.com',
      password: 'password123',
    });

    const response = await request(app)
      .get(`/api/payments/${loanId}`)
      .set('Authorization', `Bearer ${otherCustomer.token}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
  });

  it('allows admin to view payment history', async () => {
    const response = await request(app)
      .get(`/api/payments/${loanId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.loanId, loanId);
    assert.ok(response.body.data.payments.length >= 2);
  });
});
