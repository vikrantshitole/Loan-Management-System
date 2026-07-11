const parseDecimal = (value) => (value === null || value === undefined ? null : Number(value));

const toPublicLoan = (loan) => ({
  id: loan.id,
  userId: loan.userId,
  loanAmount: parseDecimal(loan.loanAmount),
  interestRate: parseDecimal(loan.interestRate),
  durationMonths: loan.durationMonths,
  purpose: loan.purpose,
  status: loan.status,
  approvedBy: loan.approvedBy,
  createdAt: loan.createdAt,
  customer: loan.customer
    ? {
        id: loan.customer.id,
        name: loan.customer.name,
        email: loan.customer.email,
      }
    : undefined,
});

const toPublicLoanList = (loans) => loans.map(toPublicLoan);

module.exports = {
  toPublicLoan,
  toPublicLoanList,
};
