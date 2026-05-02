const EMI = require('../models/EMI');

exports.createMany = (records) => EMI.insertMany(records);
exports.findByLoan = (loanId) => EMI.find({ loan: loanId }).sort({ dueDate: 1 });
exports.findById = (id) => EMI.findById(id).populate('loan');
exports.deleteManyByLoan = (loanId) => EMI.deleteMany({ loan: loanId });
exports.findUnpaidByLoan = (loanId) => EMI.find({ loan: loanId, paid: false });
