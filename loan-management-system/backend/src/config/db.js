const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log('PostgreSQL connected');
};

module.exports = { sequelize, connectDB };
