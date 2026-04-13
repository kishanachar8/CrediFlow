const calculateEmi = require('../utils/calculateEmi');

exports.generateEmiSchedule = (loan) => {
  const monthlyEmi = calculateEmi(loan.principal, loan.annualInterestRate, loan.termMonths);
  const schedule = [];
  const startDate = loan.startDate ? new Date(loan.startDate) : new Date();

  for (let i = 0; i < loan.termMonths; i += 1) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    schedule.push({ amount: monthlyEmi, dueDate, paid: false });
  }

  return schedule;
};
