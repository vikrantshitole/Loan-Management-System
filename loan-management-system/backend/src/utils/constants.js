const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

const LOAN_STATUS = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const LOAN_STATUS_VALUES = Object.values(LOAN_STATUS);
const USER_ROLE_VALUES = Object.values(USER_ROLES);

module.exports = {
  USER_ROLES,
  LOAN_STATUS,
  LOAN_STATUS_VALUES,
  USER_ROLE_VALUES,
};
