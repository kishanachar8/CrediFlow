const emiService = require('../services/emiService');
const loanRepository = require('../repositories/loanRepository');
const emiRepository = require('../repositories/emiRepository');
const { sendSuccess } = require('../utils/responseHelper');

const buildLoanSummary = async (loan) => {
  const emis = await emiRepository.findByLoan(loan._id);
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

exports.createLoan = async (req, res, next) => {
  try {
    const rawPrincipal = Number(req.body.principal || 0);
    const monthlyEmi = Number(req.body.monthlyEmi || 0);
    const termMonths = Number(req.body.termMonths);
    const startDate = req.body.startDate ? new Date(req.body.startDate) : undefined;
    const annualInterestRate = 0;

    const principal = rawPrincipal || (monthlyEmi && termMonths ? monthlyEmi * termMonths : 0);
    const calculatedEmi = monthlyEmi || emiService.calculateMonthlyEmi(principal, annualInterestRate, termMonths);

    const loan = await loanRepository.createLoan({
      user: req.user.userId,
      principal,
      annualInterestRate,
      termMonths,
      monthlyEmi: calculatedEmi,
      startDate,
    });

    const schedule = emiService.generateEmiSchedule(loan);
    await emiRepository.createMany(schedule.map((item) => ({ loan: loan.id, ...item })));

    sendSuccess(res, 'Loan created successfully', {
      loan: await buildLoanSummary(loan),
      schedule,
    }, 201);
  } catch (error) {
    next(error);
  }
};

exports.getLoans = async (req, res, next) => {
  try {
    const loans = await loanRepository.findByUser(req.user.userId);
    const loansWithSummary = await Promise.all(loans.map(buildLoanSummary));
    sendSuccess(res, 'Loans retrieved successfully', { loans: loansWithSummary });
  } catch (error) {
    next(error);
  }
};

exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await loanRepository.findByIdAndUser(req.params.id, req.user.userId);
    if (!loan) {
      const error = new Error('Loan not found');
      error.status = 404;
      return next(error);
    }
    sendSuccess(res, 'Loan retrieved successfully', { loan: await buildLoanSummary(loan) });
  } catch (error) {
    next(error);
  }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const loan = await loanRepository.findByIdAndUser(req.params.id, req.user.userId);
    if (!loan) {
      const error = new Error('Loan not found');
      error.status = 404;
      return next(error);
    }

    await emiRepository.deleteManyByLoan(loan._id);
    await loanRepository.deleteLoan(loan);

    sendSuccess(res, 'Loan deleted successfully', { loanId: loan._id });
  } catch (error) {
    next(error);
  }
};
