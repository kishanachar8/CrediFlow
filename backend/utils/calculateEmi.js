module.exports = (principal, annualInterestRate = 0, termMonths = 12) => {
  const monthlyRate = annualInterestRate / 100 / 12;
  const months = termMonths || 12;
  if (monthlyRate === 0) {
    return principal / months;
  }

  const powerFactor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * powerFactor) / (powerFactor - 1);
};
