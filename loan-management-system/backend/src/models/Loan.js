const { DataTypes } = require('sequelize');
const env = require('../config/env');
const { LOAN_STATUS, LOAN_STATUS_VALUES } = require('../utils/constants');

module.exports = (sequelize) => {
  const Loan = sequelize.define(
    'Loan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      loanAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'loan_amount',
        validate: {
          min: { args: [1], msg: 'Loan amount must be greater than 0' },
          max: {
            args: [env.maxLoanAmount],
            msg: `Loan amount cannot exceed ${env.maxLoanAmount}`,
          },
        },
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        field: 'interest_rate',
        validate: {
          min: { args: [0.1], msg: 'Interest rate must be greater than 0' },
          max: { args: [30], msg: 'Interest rate cannot exceed 30%' },
        },
      },
      durationMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'duration_months',
        validate: {
          min: {
            args: [env.minLoanDurationMonths],
            msg: `Duration must be at least ${env.minLoanDurationMonths} months`,
          },
          max: {
            args: [env.maxLoanDurationMonths],
            msg: `Duration cannot exceed ${env.maxLoanDurationMonths} months`,
          },
        },
      },
      purpose: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Loan purpose is required' },
          len: { args: [1, 500], msg: 'Purpose cannot exceed 500 characters' },
        },
      },
      status: {
        type: DataTypes.ENUM(...LOAN_STATUS_VALUES),
        allowNull: false,
        defaultValue: LOAN_STATUS.PENDING,
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      tableName: 'loans',
      timestamps: true,
      updatedAt: false,
    }
  );

  return Loan;
};
