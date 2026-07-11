const AppError = require('./AppError');
const { LOAN_STATUS } = require('./constants');

const ALLOWED_TRANSITIONS = {
  [LOAN_STATUS.PENDING]: [
    LOAN_STATUS.UNDER_REVIEW,
    LOAN_STATUS.APPROVED,
    LOAN_STATUS.REJECTED,
  ],
  [LOAN_STATUS.UNDER_REVIEW]: [LOAN_STATUS.APPROVED, LOAN_STATUS.REJECTED],
  [LOAN_STATUS.APPROVED]: [],
  [LOAN_STATUS.REJECTED]: [],
};

const validateStatusTransition = (currentStatus, nextStatus) => {
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw AppError.badRequest(
      `Cannot transition loan from "${currentStatus}" to "${nextStatus}"`
    );
  }
};

const requiresRemarks = (status) => status === LOAN_STATUS.REJECTED;

module.exports = {
  ALLOWED_TRANSITIONS,
  validateStatusTransition,
  requiresRemarks,
};
