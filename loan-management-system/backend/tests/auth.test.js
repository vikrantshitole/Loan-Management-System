const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');
const { setupTestDatabase, teardownTestDatabase } = require('./helpers/database');

const testUser = {
  name: 'Test Customer',
  email: 'customer@example.com',
  password: 'password123',
};

describe('Authentication', () => {
  let accessToken;

  before(async () => {
    await setupTestDatabase();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  it('registers a new customer and returns a JWT', async () => {
    const response = await request(app).post('/api/register').send(testUser);

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.email, testUser.email);
    assert.equal(response.body.data.user.role, 'customer');
    assert.ok(response.body.data.token);
    assert.equal(response.body.data.user.password, undefined);

    accessToken = response.body.data.token;
  });

  it('rejects duplicate registration', async () => {
    const response = await request(app).post('/api/register').send(testUser);

    assert.equal(response.status, 409);
    assert.equal(response.body.success, false);
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app).post('/api/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(response.body.data.token);

    accessToken = response.body.data.token;
  });

  it('rejects login with invalid password', async () => {
    const response = await request(app).post('/api/login').send({
      email: testUser.email,
      password: 'wrong-password',
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, 'Invalid email or password');
  });

  it('allows access to protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${accessToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.email, testUser.email);
  });

  it('rejects protected route with invalid token', async () => {
    const response = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer invalid.token.value');

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, 'Invalid access token');
  });

  it('rejects protected route with expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 1, role: 'customer' },
      env.jwtSecret,
      { expiresIn: '-1s' }
    );

    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, 'Access token has expired');
  });

  it('rejects protected route without token', async () => {
    const response = await request(app).get('/api/me');

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
  });
});
