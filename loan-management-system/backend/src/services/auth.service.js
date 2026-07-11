const { User } = require('../models');
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken } = require('../utils/token');
const { toAuthPayload, toPublicUser } = require('../utils/user.mapper');
const { USER_ROLES } = require('../utils/constants');

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

const register = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });

  if (existingUser) {
    throw AppError.conflict('An account with this email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: USER_ROLES.CUSTOMER,
  });

  const token = signAccessToken(user);

  return toAuthPayload(user, token);
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.scope('withPassword').findOne({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw AppError.unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw AppError.unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const token = signAccessToken(user);

  return toAuthPayload(user, token);
};

const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return toPublicUser(user);
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
