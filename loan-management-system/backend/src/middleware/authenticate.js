const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/token');
const { User } = require('../models');

const authenticate = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Invalid or missing access token'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(AppError.unauthorized('Invalid or missing access token'));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(AppError.unauthorized('User associated with this token no longer exists'));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Access token has expired'));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid access token'));
    }

    return next(error);
  }
};

module.exports = authenticate;
