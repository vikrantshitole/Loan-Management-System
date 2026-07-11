const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('./helpers/database');
const { registerUser, createAdminUser, loginUser } = require('./helpers/auth');

const customerCredentials = {
  name: 'Approval Customer',
  email: 'approval.customer@example.com',
  password: 'password123',
};

const loanApplication = {
  loanAmount: 300000,
  interestRate: 11,
  durationMonths: 36,
  purpose: 'Business expansion',
};

describe('Loan Approval Workflow', () => {
  let customerToken;
  let adminToken;
  let adminId;
  let loanId;

  before(async () => {
    await setupTestDatabase();

    const customer = await registerUser(app, customerCredentials);
    customerToken = customer.token;

    const admin = await createAdminUser();
    adminId = admin.id;

    const adminLogin = await loginUser(app, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    adminToken = adminLogin.token;

    const application = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(loanApplication);

    loanId = application.body.data.id;
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it('allows admin to move a pending loan to under review', async () => {
    const response = await request(app)
      .put(`/api/loan/${loanId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Under Review',
        remarks: 'Documents received, starting review',
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, 'Under Review');
    assert.equal(response.body.data.remarks, 'Documents received, starting review');
    assert.equal(response.body.data.approvedBy, adminId);
    assert.equal(response.body.data.approver.email, 'admin@example.com');
  });

  it('allows admin to approve a loan under review', async () => {
    const response = await request(app)
      .put(`/api/loan/${loanId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Approved',
        remarks: 'Meets eligibility criteria',
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, 'Approved');
    assert.equal(response.body.data.remarks, 'Meets eligibility criteria');
    assert.equal(response.body.data.approver.name, 'Test Admin');
  });

  it('rejects invalid status transitions', async () => {
    const response = await request(app)
      .put(`/api/loan/${loanId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Pending' });

    assert.equal(response.status, 400);
    assert.match(response.body.message, /Cannot transition loan/);
  });

  it('requires remarks when rejecting a loan', async () => {
    const rejectedApplication = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...loanApplication,
        purpose: 'Loan pending rejection',
      });

    assert.equal(rejectedApplication.status, 201);
    const pendingLoanId = rejectedApplication.body.data.id;

    const response = await request(app)
      .put(`/api/loan/${pendingLoanId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Rejected' });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Remarks are required when rejecting a loan');
  });

  it('allows admin to reject a pending loan with remarks', async () => {
    const pendingLoans = await request(app)
      .get('/api/loan?status=Pending')
      .set('Authorization', `Bearer ${adminToken}`);

    const pendingLoanId = pendingLoans.body.data.find(
      (loan) => loan.purpose === 'Loan pending rejection'
    ).id;

    const response = await request(app)
      .put(`/api/loan/${pendingLoanId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Rejected',
        remarks: 'Insufficient credit history',
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, 'Rejected');
    assert.equal(response.body.data.remarks, 'Insufficient credit history');
  });

  it('lists pending loans for admin review', async () => {
    const newApplication = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...loanApplication,
        purpose: 'Fresh pending application',
      });

    assert.equal(newApplication.status, 201);

    const response = await request(app)
      .get('/api/loan?status=Pending')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.status, 200);
    assert.ok(response.body.data.length >= 1);
    assert.ok(response.body.data.every((loan) => loan.status === 'Pending'));
    assert.ok(response.body.data[0].customer);
  });

  it('prevents customers from updating loan status', async () => {
    const response = await request(app)
      .put(`/api/loan/${loanId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'Approved' });

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
  });
});
