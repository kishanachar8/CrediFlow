const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    principal: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true },
    termMonths: { type: Number, required: true },
    monthlyEmi: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'defaulted'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', loanSchema);
