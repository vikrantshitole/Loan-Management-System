const request = require('supertest');
const { hashPassword } = require('../../src/utils/password');
const { User } = require('../../src/models');
const { USER_ROLES } = require('../../src/utils/constants');

const registerUser = async (app, userData) => {
  const response = await request(app).post('/api/register').send(userData);

  return {
    response,
    token: response.body.data?.token,
    user: response.body.data?.user,
  };
};

const createAdminUser = async () => {
  const hashedPassword = await hashPassword('admin123');

  return User.create({
    name: 'Test Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: USER_ROLES.ADMIN,
  });
};

const loginUser = async (app, credentials) => {
  const response = await request(app).post('/api/login').send(credentials);

  return {
    response,
    token: response.body.data?.token,
    user: response.body.data?.user,
  };
};

module.exports = {
  registerUser,
  createAdminUser,
  loginUser,
};
