const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('./helpers/database');
const { registerUser, createAdminUser, loginUser } = require('./helpers/auth');

const customerCredentials = {
  name: 'Loan Customer',
  email: 'loan.customer@example.com',
  password: 'password123',
};

const validLoanApplication = {
  loanAmount: 250000,
  interestRate: 10,
  durationMonths: 24,
  purpose: 'Home renovation',
};

describe('Loan Application', () => {
  let customerToken;
  let customerId;
  let adminToken;
  let createdLoanId;

  before(async () => {
    await setupTestDatabase();

    const customer = await registerUser(app, customerCredentials);
    customerToken = customer.token;
    customerId = customer.user.id;

    await createAdminUser();
    const admin = await loginUser(app, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    adminToken = admin.token;
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it('submits a loan application with pending status', async () => {
    const response = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(validLoanApplication);

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, 'Pending');
    assert.equal(response.body.data.loanAmount, 250000);
    assert.equal(response.body.data.purpose, validLoanApplication.purpose);
    assert.equal(response.body.data.userId, customerId);

    createdLoanId = response.body.data.id;
  });

  it('rejects duplicate active loan applications', async () => {
    const response = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(validLoanApplication);

    assert.equal(response.status, 409);
    assert.equal(response.body.success, false);
  });

  it('rejects loan application with invalid amount', async () => {
    const response = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...validLoanApplication,
        loanAmount: -100,
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

  it('rejects loan application with invalid duration', async () => {
    const response = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...validLoanApplication,
        durationMonths: 3,
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
  });

  it('rejects loan application with missing purpose', async () => {
    const response = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...validLoanApplication,
        purpose: '   ',
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Validation failed');
    assert.ok(response.body.errors.some((error) => error.field === 'purpose'));
  });

  it('rejects loan application with invalid interest rate', async () => {
    const response = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        ...validLoanApplication,
        interestRate: 0,
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Validation failed');
    assert.ok(response.body.errors.some((error) => error.field === 'interestRate'));
  });

  it('prevents admin from applying for a loan', async () => {
    const response = await request(app)
      .post('/api/loan/apply')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validLoanApplication);

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
  });

  it('rejects invalid loan id parameter', async () => {
    const response = await request(app)
      .get('/api/loan/not-a-number')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Validation failed');
    assert.ok(response.body.errors.some((error) => error.field === 'id'));
  });

  it('lists customer loans', async () => {
    const response = await request(app)
      .get('/api/loan')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].id, createdLoanId);
    assert.equal(response.body.meta.total, 1);
  });

  it('allows admin to list all loans with customer details', async () => {
    const response = await request(app)
      .get('/api/loan')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].customer.email, customerCredentials.email);
  });

  it('returns a loan by id for the owner', async () => {
    const response = await request(app)
      .get(`/api/loan/${createdLoanId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, createdLoanId);
    assert.equal(response.body.data.status, 'Pending');
  });

  it('prevents customers from viewing another users loan', async () => {
    const otherCustomer = await registerUser(app, {
      name: 'Other Customer',
      email: 'other.customer@example.com',
      password: 'password123',
    });

    const response = await request(app)
      .get(`/api/loan/${createdLoanId}`)
      .set('Authorization', `Bearer ${otherCustomer.token}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
  });

  it('rejects unauthenticated loan application', async () => {
    const response = await request(app).post('/api/loan/apply').send(validLoanApplication);

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
  });
});
