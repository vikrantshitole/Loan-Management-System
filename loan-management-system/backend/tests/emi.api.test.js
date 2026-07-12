const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('./helpers/database');
const { calculateEmiBreakdown } = require('../src/services/emi.service');

describe('EMI API', () => {
  before(async () => {
    await setupTestDatabase();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it('returns EMI breakdown without authentication', async () => {
    const payload = {
      loanAmount: 250000,
      interestRate: 12,
      durationMonths: 36,
    };

    const expected = calculateEmiBreakdown(payload);
    const response = await request(app).post('/api/loan/calculate-emi').send(payload);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.emi, expected.emi);
    assert.equal(response.body.data.totalPayment, expected.totalPayment);
    assert.equal(response.body.data.totalInterest, expected.totalInterest);
    assert.deepEqual(response.body.data.breakdown, expected.breakdown);
  });

  it('rejects invalid EMI payload', async () => {
    const response = await request(app).post('/api/loan/calculate-emi').send({
      loanAmount: -1,
      interestRate: 10,
      durationMonths: 24,
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, 'Validation failed');
    assert.ok(response.body.errors.some((error) => error.field === 'loanAmount'));
  });

  it('returns field errors for missing EMI fields', async () => {
    const response = await request(app).post('/api/loan/calculate-emi').send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Validation failed');
    assert.ok(response.body.errors.length >= 3);
  });
});
