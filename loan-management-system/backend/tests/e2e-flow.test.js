const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { calculateEmiBreakdown } = require('../src/services/emi.service');
const { setupTestDatabase, teardownTestDatabase } = require('./helpers/database');
const { createAdminUser, loginUser } = require('./helpers/auth');

const customerCredentials = {
  name: 'E2E Customer',
  email: 'e2e.customer@example.com',
  password: 'password123',
};

const loanApplication = {
  loanAmount: 500000,
  interestRate: 10,
  durationMonths: 24,
  purpose: 'Home renovation',
};

describe('End-to-end API flows', () => {
  before(async () => {
    await setupTestDatabase();
    await createAdminUser();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  describe('Happy path: register through payment history', () => {
    let customerToken;
    let adminToken;
    let loanId;
    let expectedEmi;

    before(async () => {
      const admin = await loginUser(app, {
        email: 'admin@example.com',
        password: 'admin123',
      });
      adminToken = admin.token;
      expectedEmi = calculateEmiBreakdown(loanApplication).emi;
    });

    it('registers a new customer', async () => {
      const response = await request(app).post('/api/register').send(customerCredentials);

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.user.email, customerCredentials.email);
      assert.equal(response.body.data.user.role, 'customer');
      assert.ok(response.body.data.token);

      customerToken = response.body.data.token;
    });

    it('logs in the customer', async () => {
      const response = await request(app).post('/api/login').send({
        email: customerCredentials.email,
        password: customerCredentials.password,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.data.user.email, customerCredentials.email);
      assert.ok(response.body.data.token);

      customerToken = response.body.data.token;
    });

    it('returns the authenticated customer profile', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.data.user.name, customerCredentials.name);
      assert.equal(response.body.data.user.email, customerCredentials.email);
    });

    it('submits a loan application with pending status', async () => {
      const response = await request(app)
        .post('/api/loan/apply')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(loanApplication);

      assert.equal(response.status, 201);
      assert.equal(response.body.data.status, 'Pending');
      assert.equal(response.body.data.loanAmount, loanApplication.loanAmount);
      assert.equal(response.body.data.purpose, loanApplication.purpose);

      loanId = response.body.data.id;
    });

    it('lists the pending loan on the customer dashboard', async () => {
      const response = await request(app)
        .get('/api/loan')
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.data.length, 1);
      assert.equal(response.body.data[0].id, loanId);
      assert.equal(response.body.data[0].status, 'Pending');
    });

    it('allows admin to review and approve the loan', async () => {
      const reviewResponse = await request(app)
        .put(`/api/loan/${loanId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Under Review',
          remarks: 'Documents verified',
        });

      assert.equal(reviewResponse.status, 200);
      assert.equal(reviewResponse.body.data.status, 'Under Review');

      const approveResponse = await request(app)
        .put(`/api/loan/${loanId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Approved',
          remarks: 'Approved for home renovation',
        });

      assert.equal(approveResponse.status, 200);
      assert.equal(approveResponse.body.data.status, 'Approved');
      assert.equal(approveResponse.body.data.remarks, 'Approved for home renovation');
      assert.ok(approveResponse.body.data.approver);
    });

    it('calculates EMI for the approved loan terms', async () => {
      const response = await request(app).post('/api/loan/calculate-emi').send(loanApplication);

      assert.equal(response.status, 200);
      assert.equal(response.body.data.emi, expectedEmi);
      assert.equal(
        response.body.data.totalPayment,
        calculateEmiBreakdown(loanApplication).totalPayment
      );
      assert.ok(response.body.data.breakdown);
    });

    it('shows approved loan status with EMI and outstanding balance', async () => {
      const response = await request(app)
        .get(`/api/loan/${loanId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.data.status, 'Approved');
      assert.equal(response.body.data.emi, expectedEmi);
      assert.equal(response.body.data.outstandingBalance, loanApplication.loanAmount);
      assert.equal(response.body.data.totalPaid, 0);
      assert.equal(response.body.data.remarks, 'Approved for home renovation');
    });

    it('records a payment against the approved loan', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          loanId,
          amount: 50000,
        });

      assert.equal(response.status, 201);
      assert.equal(response.body.data.payment.amount, 50000);
      assert.equal(response.body.data.payment.remainingBalance, 450000);
      assert.equal(response.body.data.summary.totalPaid, 50000);
      assert.equal(response.body.data.summary.remainingBalance, 450000);
    });

    it('returns payment history sorted newest first with updated totals', async () => {
      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          loanId,
          amount: 25000,
          paymentDate: '2026-02-01T10:00:00.000Z',
        });

      const historyResponse = await request(app)
        .get(`/api/payments/${loanId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(historyResponse.status, 200);
      assert.equal(historyResponse.body.data.loanId, loanId);
      assert.equal(historyResponse.body.data.totalPaid, 75000);
      assert.equal(historyResponse.body.data.remainingBalance, 425000);
      assert.equal(historyResponse.body.data.payments.length, 2);
      assert.ok(
        new Date(historyResponse.body.data.payments[0].paymentDate) >=
          new Date(historyResponse.body.data.payments[1].paymentDate)
      );

      const loanResponse = await request(app)
        .get(`/api/loan/${loanId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(loanResponse.status, 200);
      assert.equal(loanResponse.body.data.totalPaid, 75000);
      assert.equal(loanResponse.body.data.outstandingBalance, 425000);
    });
  });

  describe('Rejection path: admin rejects and blocks payments', () => {
    let customerToken;
    let adminToken;
    let loanId;

    before(async () => {
      const registerResponse = await request(app).post('/api/register').send({
        name: 'Rejected Customer',
        email: 'rejected.customer@example.com',
        password: 'password123',
      });

      customerToken = registerResponse.body.data.token;

      const admin = await loginUser(app, {
        email: 'admin@example.com',
        password: 'admin123',
      });
      adminToken = admin.token;

      const application = await request(app)
        .post('/api/loan/apply')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          loanAmount: 150000,
          interestRate: 11,
          durationMonths: 12,
          purpose: 'Personal loan',
        });

      loanId = application.body.data.id;
    });

    it('allows admin to reject a loan with required remarks', async () => {
      const response = await request(app)
        .put(`/api/loan/${loanId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Rejected',
          remarks: 'Insufficient income documentation',
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.data.status, 'Rejected');
      assert.equal(response.body.data.remarks, 'Insufficient income documentation');
    });

    it('shows rejected status to the customer without financial summary', async () => {
      const response = await request(app)
        .get(`/api/loan/${loanId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.data.status, 'Rejected');
      assert.equal(response.body.data.remarks, 'Insufficient income documentation');
      assert.equal(response.body.data.emi, null);
      assert.equal(response.body.data.outstandingBalance, null);
      assert.equal(response.body.data.totalPaid, 0);
    });

    it('blocks payments on rejected loans', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          loanId,
          amount: 1000,
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'Payments can only be recorded against approved loans');
    });
  });
});
