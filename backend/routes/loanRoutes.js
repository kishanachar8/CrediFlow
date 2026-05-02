const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const { createLoanSchema } = require('../validators/loanValidator');

router.use(authMiddleware.ensureAuthenticated);
router.post('/', validate(createLoanSchema), asyncHandler(loanController.createLoan));
router.get('/', asyncHandler(loanController.getLoans));
router.get('/:id', asyncHandler(loanController.getLoanById));
router.delete('/:id', asyncHandler(loanController.deleteLoan));

module.exports = router;
