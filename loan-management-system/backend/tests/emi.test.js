const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateEmiBreakdown, roundCurrency } = require('../src/services/emi.service');

describe('EMI Calculator', () => {
  it('calculates EMI using the standard reducing-balance formula', () => {
    const result = calculateEmiBreakdown({
      loanAmount: 500000,
      interestRate: 10,
      durationMonths: 24,
    });

    const monthlyRate = 10 / 12 / 100;
    const compound = (1 + monthlyRate) ** 24;
    const rawEmi = (500000 * monthlyRate * compound) / (compound - 1);
    const expectedEmi = roundCurrency(rawEmi);
    const expectedTotalPayment = roundCurrency(rawEmi * 24);
    const expectedTotalInterest = roundCurrency(expectedTotalPayment - 500000);

    assert.equal(result.emi, expectedEmi);
    assert.equal(result.loanAmount, 500000);
    assert.equal(result.durationMonths, 24);
    assert.equal(result.totalPayment, expectedTotalPayment);
    assert.equal(result.totalInterest, expectedTotalInterest);
    assert.equal(result.breakdown.principal, 500000);
    assert.equal(result.breakdown.interest, expectedTotalInterest);
    assert.ok(result.emi > 0);
    assert.ok(result.totalInterest > 0);
  });

  it('handles zero interest rate without division by zero', () => {
    const result = calculateEmiBreakdown({
      loanAmount: 120000,
      interestRate: 0,
      durationMonths: 12,
    });

    assert.equal(result.emi, 10000);
    assert.equal(result.totalPayment, 120000);
    assert.equal(result.totalInterest, 0);
  });

  it('rejects invalid principal', () => {
    assert.throws(
      () =>
        calculateEmiBreakdown({
          loanAmount: 0,
          interestRate: 10,
          durationMonths: 12,
        }),
      /positive number/
    );
  });

  it('rejects non-integer duration', () => {
    assert.throws(
      () =>
        calculateEmiBreakdown({
          loanAmount: 100000,
          interestRate: 10,
          durationMonths: 12.5,
        }),
      /positive integer/
    );
  });
});
