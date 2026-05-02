const Loan = require('../models/Loan');

exports.createLoan = (loanData) => Loan.create(loanData);
exports.findByUser = (userId) => Loan.find({ user: userId }).sort({ createdAt: -1 });
exports.findByIdAndUser = (id, userId) => Loan.findOne({ _id: id, user: userId });
exports.deleteLoan = (loan) => loan.deleteOne();
