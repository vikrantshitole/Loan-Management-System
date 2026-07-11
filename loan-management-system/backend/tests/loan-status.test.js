const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { Loan, Payment } = require('../src/models');
const { setupTestDatabase, teardownTestDatabase } = require('./helpers/database');
const { registerUser, createAdminUser, loginUser } = require('./helpers/auth');

const customerCredentials = {
  name: 'Status Customer',
  email: 'status.customer@example.com',
  password: 'password123',
};

const loanApplication = {
  loanAmount: 400000,
  interestRate: 12,
  durationMonths: 24,
  purpose: 'Vehicle purchase',
};

describe('Loan Status Tracking', () => {
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
      .send({ status: 'Approved', remarks: 'Approved for vehicle purchase' });
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it('returns loan status details with EMI for approved loans', async () => {
    const response = await request(app)
      .get(`/api/loan/${loanId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, 'Approved');
    assert.equal(response.body.data.remarks, 'Approved for vehicle purchase');
    assert.ok(response.body.data.emi > 0);
    assert.equal(response.body.data.outstandingBalance, 400000);
    assert.equal(response.body.data.totalPaid, 0);
    assert.ok(response.body.data.emiBreakdown);
  });

  it('includes outstanding balance after payments are recorded', async () => {
    await Payment.create({
      loanId,
      amount: 50000,
      paymentDate: new Date(),
      remainingBalance: 350000,
    });

    const response = await request(app)
      .get(`/api/loan/${loanId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.totalPaid, 50000);
    assert.equal(response.body.data.outstandingBalance, 350000);
  });

  it('lists customer loans with status summary fields', async () => {
    const response = await request(app)
      .get('/api/loan')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].status, 'Approved');
    assert.equal(response.body.data[0].remarks, 'Approved for vehicle purchase');
    assert.ok(response.body.data[0].emi > 0);
    assert.equal(response.body.data[0].outstandingBalance, 350000);
  });

  it('shows projected EMI while loan is pending', async () => {
    const pendingApplication = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...loanApplication,
        purpose: 'Pending status check',
      });

    assert.equal(pendingApplication.status, 201);

    const response = await request(app)
      .get(`/api/loan/${pendingApplication.body.data.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, 'Pending');
    assert.ok(response.body.data.emi > 0);
    assert.equal(response.body.data.outstandingBalance, null);
  });

  it('clears financial summary for rejected loans', async () => {
    const rejectedLoan = await Loan.create({
      userId: (await registerUser(app, {
        name: 'Rejected User',
        email: 'rejected.user@example.com',
        password: 'password123',
      })).user.id,
      loanAmount: 100000,
      interestRate: 10,
      durationMonths: 12,
      purpose: 'Rejected loan',
      status: 'Rejected',
      remarks: 'Insufficient income',
    });

    const rejectedUser = await loginUser(app, {
      email: 'rejected.user@example.com',
      password: 'password123',
    });

    const response = await request(app)
      .get(`/api/loan/${rejectedLoan.id}`)
      .set('Authorization', `Bearer ${rejectedUser.token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, 'Rejected');
    assert.equal(response.body.data.remarks, 'Insufficient income');
    assert.equal(response.body.data.emi, null);
    assert.equal(response.body.data.outstandingBalance, null);
  });
});
