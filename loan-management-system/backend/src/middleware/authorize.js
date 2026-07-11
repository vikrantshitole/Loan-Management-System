const AppError = require('../utils/AppError');
const { USER_ROLES } = require('../utils/constants');

const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized());
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(AppError.forbidden());
  }

  return next();
};

const authorizeAdmin = authorize(USER_ROLES.ADMIN);
const authorizeCustomer = authorize(USER_ROLES.CUSTOMER);

module.exports = {
  authorize,
  authorizeAdmin,
  authorizeCustomer,
};
