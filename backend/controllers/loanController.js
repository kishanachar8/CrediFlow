const Loan = require('../models/Loan');
const EMI = require('../models/EMI');
const emiService = require('../services/emiService');

exports.createLoan = async (req, res) => {
  try {
    const { principal, annualInterestRate, termMonths, startDate } = req.body;
    const loan = await Loan.create({
      user: req.user.id,
      principal,
      annualInterestRate,
      termMonths,
      startDate: startDate ? new Date(startDate) : undefined,
    });

    const schedule = emiService.generateEmiSchedule(loan);
    await EMI.insertMany(schedule.map((item) => ({ loan: loan.id, ...item })));

    res.status(201).json({ loan, schedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ loans });
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
    res.json({ loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
