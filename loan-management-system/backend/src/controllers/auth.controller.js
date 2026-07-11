const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  return sendSuccess(res, {
    data: result,
    message: 'User registered successfully',
    statusCode: 201,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return sendSuccess(res, {
    data: result,
    message: 'Login successful',
  });
});

module.exports = {
  register,
  login,
};
