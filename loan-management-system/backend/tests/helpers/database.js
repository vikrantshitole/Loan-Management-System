const { sequelize } = require('../../src/config/db');

require('../../src/models');

const setupTestDatabase = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
};

const teardownTestDatabase = async () => {
  await sequelize.close();
};

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
};
