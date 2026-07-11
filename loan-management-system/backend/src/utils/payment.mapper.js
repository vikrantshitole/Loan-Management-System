const parseDecimal = (value) => (value === null || value === undefined ? null : Number(value));

const toPublicPayment = (payment) => ({
  id: payment.id,
  loanId: payment.loanId,
  amount: parseDecimal(payment.amount),
  paymentDate: payment.paymentDate,
  remainingBalance: parseDecimal(payment.remainingBalance),
});

const toPublicPaymentList = (payments) => payments.map(toPublicPayment);

module.exports = {
  toPublicPayment,
  toPublicPaymentList,
};
