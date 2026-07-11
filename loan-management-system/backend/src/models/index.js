const { sequelize } = require('../config/db');
const initUser = require('./User');
const initLoan = require('./Loan');
const initPayment = require('./Payment');

const User = initUser(sequelize);
const Loan = initLoan(sequelize);
const Payment = initPayment(sequelize);

User.hasMany(Loan, { foreignKey: 'userId', as: 'loans' });
Loan.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

Loan.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
User.hasMany(Loan, { foreignKey: 'approvedBy', as: 'approvedLoans' });

Loan.hasMany(Payment, { foreignKey: 'loanId', as: 'payments' });
Payment.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

module.exports = {
  sequelize,
  User,
  Loan,
  Payment,
};
