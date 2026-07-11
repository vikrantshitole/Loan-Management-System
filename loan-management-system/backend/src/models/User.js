const { DataTypes } = require('sequelize');
const { USER_ROLES, USER_ROLE_VALUES } = require('../utils/constants');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required' },
          len: { args: [1, 100], msg: 'Name cannot exceed 100 characters' },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Email is required' },
          isEmail: { msg: 'Please provide a valid email' },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
        },
      },
      role: {
        type: DataTypes.ENUM(...USER_ROLE_VALUES),
        allowNull: false,
        defaultValue: USER_ROLES.CUSTOMER,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      updatedAt: false,
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    }
  );

  return User;
};
