const parseDecimal = (value) => (value === null || value === undefined ? null : Number(value));

const toPublicUserRef = (user) =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    : undefined;

const toPublicLoan = (loan) => ({
  id: loan.id,
  userId: loan.userId,
  loanAmount: parseDecimal(loan.loanAmount),
  interestRate: parseDecimal(loan.interestRate),
  durationMonths: loan.durationMonths,
  purpose: loan.purpose,
  status: loan.status,
  remarks: loan.remarks,
  approvedBy: loan.approvedBy,
  createdAt: loan.createdAt,
  customer: toPublicUserRef(loan.customer),
  approver: toPublicUserRef(loan.approver),
});

const toPublicLoanList = (loans) => loans.map(toPublicLoan);

module.exports = {
  toPublicLoan,
  toPublicLoanList,
};
