const emiRepository = require('../repositories/emiRepository');
const loanRepository = require('../repositories/loanRepository');

exports.getEmisByLoan = async (req, res, next) => {
  try {
    const loan = await loanRepository.findByIdAndUser(req.params.loanId, req.user.userId);
    if (!loan) {
      const error = new Error('Loan not found');
      error.status = 404;
      return next(error);
    }

    const emis = await emiRepository.findByLoan(loan.id);
    const totalPaid = emis.filter((emi) => emi.paid).reduce((sum, emi) => sum + emi.amount, 0);
    const remainingBalance = emis.filter((emi) => !emi.paid).reduce((sum, emi) => sum + emi.amount, 0);

    res.json({
      loan: {
        ...loan.toObject(),
        totalPaid,
        remainingBalance,
      },
      emis,
      totalPaid,
      remainingBalance,
    });
  } catch (error) {
    next(error);
  }
};

exports.payEmi = async (req, res, next) => {
  try {
    const emi = await emiRepository.findById(req.params.emiId);
    if (!emi || !emi.loan || emi.loan.user.toString() !== req.user.userId) {
      const error = new Error('EMI not found');
      error.status = 404;
      return next(error);
    }
    if (emi.paid) {
      const error = new Error('EMI already paid');
      error.status = 400;
      return next(error);
    }

    emi.paid = true;
    emi.paidAt = new Date();
    await emi.save();

    const remainingEmis = await emiRepository.findUnpaidByLoan(emi.loan.id);
    if (remainingEmis.length === 0) {
      emi.loan.status = 'completed';
      await emi.loan.save();
    }

    const remainingBalance = remainingEmis.reduce((sum, item) => sum + item.amount, 0);
    res.json({ emi, loanStatus: emi.loan.status, remainingBalance });
  } catch (error) {
    next(error);
  }
};
