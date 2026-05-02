const express = require('express');
const router = express.Router();
const emiController = require('../controllers/emiController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const { emiIdParamSchema, loanIdParamSchema } = require('../validators/emiValidator');

router.use(authMiddleware.ensureAuthenticated);
router.get('/loan/:loanId', validate(loanIdParamSchema, 'params'), asyncHandler(emiController.getEmisByLoan));
router.post('/:emiId/pay', validate(emiIdParamSchema, 'params'), asyncHandler(emiController.payEmi));

module.exports = router;
