const { User } = require('../models');

const getAdminLoanIncludes = () => [
  { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
];

const getCustomerLoanIncludes = () => [];

module.exports = {
  getAdminLoanIncludes,
  getCustomerLoanIncludes,
};
