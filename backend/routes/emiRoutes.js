const express = require('express');
const router = express.Router();
const emiController = require('../controllers/emiController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.ensureAuthenticated);
router.get('/loan/:loanId', emiController.getEmisByLoan);
router.post('/:emiId/pay', emiController.payEmi);

module.exports = router;
