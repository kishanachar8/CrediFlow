module.exports = (principal, annualInterestRate, termMonths) => {
  const monthlyRate = annualInterestRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  const powerFactor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * powerFactor) / (powerFactor - 1);
};
