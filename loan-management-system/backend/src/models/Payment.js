const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      loanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'loan_id',
        references: {
          model: 'loans',
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Payment amount must be greater than 0' },
        },
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'payment_date',
        defaultValue: DataTypes.NOW,
      },
      remainingBalance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'remaining_balance',
        validate: {
          min: { args: [0], msg: 'Remaining balance cannot be negative' },
        },
      },
    },
    {
      tableName: 'payments',
      timestamps: false,
    }
  );

  return Payment;
};
