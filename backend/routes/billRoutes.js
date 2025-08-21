const express = require('express');
const {
  generateBillFromOrder,
  generateManualBill,
  getBillDetails,
  getRestaurantBillHistory,
} = require('../controllers/billController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/** ✅ Manual bill endpoint */
router.post('/manual', protect, authorizeRoles('cashier', 'admin'), generateManualBill);

router.post('/generate-from-order/:orderId', protect, authorizeRoles('cashier', 'admin'), generateBillFromOrder);
router.get('/:billId', protect, authorizeRoles('cashier', 'admin'), getBillDetails);
router.get('/restaurant/:restaurantId', protect, authorizeRoles('cashier', 'admin'), getRestaurantBillHistory);

module.exports = router;
