const sendSuccess = (res, { data = null, message = 'Success', statusCode = 200, meta = null } = {}) => {
  const payload = { success: true, message };

  if (data !== null) {
    payload.data = data;
  }

  if (meta !== null) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess };
