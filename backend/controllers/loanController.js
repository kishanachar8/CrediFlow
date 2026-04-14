const Loan = require('../models/Loan');
const EMI = require('../models/EMI');
const emiService = require('../services/emiService');

const buildLoanSummary = async (loan) => {
  const emis = await EMI.find({ loan: loan._id }).sort({ dueDate: 1 });
  const paidEmis = emis.filter((emi) => emi.paid);
  const unpaidEmis = emis.filter((emi) => !emi.paid);
  const nextEmi = unpaidEmis[0];
  const totalPaid = paidEmis.reduce((sum, emi) => sum + emi.amount, 0);
  const remainingBalance = unpaidEmis.reduce((sum, emi) => sum + emi.amount, 0);
  const totalPayments = emis.length;
  const progress = totalPayments ? Math.min(100, Math.round((paidEmis.length / totalPayments) * 100)) : 0;
  const overdueCount = unpaidEmis.filter((emi) => emi.dueDate < new Date()).length;
  const monthlyEmi = loan.monthlyEmi || emiService.calculateMonthlyEmi(loan.principal, loan.annualInterestRate, loan.termMonths);
  const debtFreeDate = unpaidEmis.length
    ? unpaidEmis[unpaidEmis.length - 1].dueDate
    : paidEmis.length
    ? paidEmis[paidEmis.length - 1].dueDate
    : null;

  return {
    ...loan.toObject(),
    monthlyEmi,
    totalPaid,
    remainingBalance,
    totalPayments,
    paidPayments: paidEmis.length,
    nextDueDate: nextEmi?.dueDate,
    nextPaymentAmount: nextEmi?.amount,
    overdueCount,
    progress,
    debtFreeDate,
  };
};

exports.createLoan = async (req, res) => {
  try {
    const rawPrincipal = Number(req.body.principal || 0);
    const monthlyEmi = Number(req.body.monthlyEmi || 0);
    const termMonths = Number(req.body.termMonths);
    const startDate = req.body.startDate ? new Date(req.body.startDate) : undefined;
    const annualInterestRate = 0;

    const principal = rawPrincipal || (monthlyEmi && termMonths ? monthlyEmi * termMonths : 0);

    if ((!principal && !monthlyEmi) || !termMonths) {
      return res.status(400).json({ message: 'Please provide the monthly EMI amount and number of months.' });
    }

    const calculatedEmi = monthlyEmi || emiService.calculateMonthlyEmi(principal, annualInterestRate, termMonths);

    const loan = await Loan.create({
      user: req.user.id,
      principal,
      annualInterestRate,
      termMonths,
      monthlyEmi: calculatedEmi,
      startDate,
    });

    const schedule = emiService.generateEmiSchedule(loan);
    await EMI.insertMany(schedule.map((item) => ({ loan: loan.id, ...item })));

    res.status(201).json({ loan: await buildLoanSummary(loan), schedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
    const loansWithSummary = await Promise.all(loans.map(buildLoanSummary));
    res.json({ loans: loansWithSummary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user.id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.json({ loan: await buildLoanSummary(loan) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user.id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    await EMI.deleteMany({ loan: loan._id });
    await loan.deleteOne();

    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
