const parseDecimal = (value) => (value === null || value === undefined ? null : Number(value));

const toPublicUserRef = (user) =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    : undefined;

const toPublicLoan = (loan, summary = null) => ({
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
  emi: summary?.emi ?? null,
  outstandingBalance: summary?.outstandingBalance ?? null,
  totalPaid: summary?.totalPaid ?? 0,
  emiBreakdown: summary?.emiBreakdown ?? null,
});

const toPublicLoanList = (loans, summaries = {}) =>
  loans.map((loan) => toPublicLoan(loan, summaries[loan.id] || null));

const toLoanStatusDetail = (loan, summary) => toPublicLoan(loan, summary);

module.exports = {
  toPublicLoan,
  toPublicLoanList,
  toLoanStatusDetail,
};
