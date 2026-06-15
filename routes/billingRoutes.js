const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/', billingController.getAllBills);
router.get('/search', billingController.searchBills);
router.get('/:id', billingController.getBillById);
router.post('/', billingController.createBill);
router.put('/:id', billingController.updateBill);
router.patch('/:id/status', billingController.updateBillStatus);
router.delete('/:id', billingController.deleteBill);

module.exports = router;
