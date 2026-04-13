const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema(
  {
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EMI', emiSchema);
