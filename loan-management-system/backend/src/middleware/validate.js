const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (validations) => async (req, _res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    return next(AppError.badRequest('Validation failed', errors));
  }

  return next();
};

module.exports = validate;
