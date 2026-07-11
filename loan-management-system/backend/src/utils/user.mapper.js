const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const toAuthPayload = (user, token) => ({
  user: toPublicUser(user),
  token,
});

module.exports = {
  toPublicUser,
  toAuthPayload,
};
