const EMI = require('../models/EMI');
const Loan = require('../models/Loan');

exports.getEmisByLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.loanId, user: req.user.id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const emis = await EMI.find({ loan: loan.id }).sort({ dueDate: 1 });
    res.json({ emis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payEmi = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.emiId).populate('loan');
    if (!emi || emi.loan.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'EMI not found' });
    }
    if (emi.paid) {
      return res.status(400).json({ message: 'EMI already paid' });
    }

    emi.paid = true;
    emi.paidAt = new Date();
    await emi.save();

    const remainingEmis = await EMI.countDocuments({ loan: emi.loan.id, paid: false });
    if (remainingEmis === 0) {
      emi.loan.status = 'completed';
      await emi.loan.save();
    }

    res.json({ emi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
