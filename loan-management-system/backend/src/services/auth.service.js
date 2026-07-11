const AppError = require('../utils/AppError');

/**
 * @typedef {Object} RegisterInput
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {'customer' | 'admin'} [role]
 */

/**
 * @typedef {Object} LoginInput
 * @property {string} email
 * @property {string} password
 */

/**
 * Registers a new user account.
 * Stage 5: hash password, persist user, return JWT.
 */
const register = async (_payload) => {
  throw AppError.notImplemented('User registration will be implemented in Stage 5');
};

/**
 * Authenticates a user and issues a JWT.
 * Stage 5: verify credentials, sign token.
 */
const login = async (_payload) => {
  throw AppError.notImplemented('User login will be implemented in Stage 5');
};

module.exports = {
  register,
  login,
};
