const AppError = require('../utils/AppError');

const errorHandler = (err, _req, res, _next) => {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors?.map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Database validation failed',
      errors,
    });
  }

  if (err instanceof AppError) {
    const payload = {
      success: false,
      message: err.message,
    };

    if (err.errors) {
      payload.errors = err.errors;
    }

    return res.status(err.statusCode).json(payload);
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

module.exports = errorHandler;
