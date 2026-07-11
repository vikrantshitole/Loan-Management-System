const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
