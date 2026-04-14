const calculateEmi = require('../utils/calculateEmi');

exports.calculateMonthlyEmi = (principal, annualInterestRate = 0, termMonths = 12) => {
  return calculateEmi(principal, annualInterestRate, termMonths);
};

exports.generateEmiSchedule = (loan) => {
  const annualInterestRate = loan.annualInterestRate ?? 0;
  const termMonths = loan.termMonths ?? 12;
  const monthlyEmi = calculateEmi(loan.principal, annualInterestRate, termMonths);
  const schedule = [];
  const startDate = loan.startDate ? new Date(loan.startDate) : new Date();
  const monthlyRate = annualInterestRate / 100 / 12;
  let remainingBalance = loan.principal;

  for (let i = 0; i < loan.termMonths; i += 1) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);

    const interestAmount = remainingBalance * monthlyRate;
    let principalAmount = monthlyEmi - interestAmount;
    if (i === loan.termMonths - 1) {
      principalAmount = remainingBalance;
    }

    const amount = Number((interestAmount + principalAmount).toFixed(2));
    const balanceAfterPayment = Number(Math.max(0, remainingBalance - principalAmount).toFixed(2));

    schedule.push({
      amount,
      dueDate,
      paid: false,
      interestAmount: Number(interestAmount.toFixed(2)),
      principalAmount: Number(principalAmount.toFixed(2)),
      balance: balanceAfterPayment,
      paymentNumber: i + 1,
    });

    remainingBalance = balanceAfterPayment;
  }

  return schedule;
};
