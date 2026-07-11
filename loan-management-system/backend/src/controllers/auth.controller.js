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

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  return sendSuccess(res, {
    data: { user },
    message: 'Profile retrieved successfully',
  });
});

module.exports = {
  register,
  login,
  getCurrentUser,
};
