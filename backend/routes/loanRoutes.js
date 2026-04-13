const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.ensureAuthenticated);
router.post('/', loanController.createLoan);
router.get('/', loanController.getLoans);
router.get('/:id', loanController.getLoanById);

module.exports = router;
