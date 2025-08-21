const express = require('express');
const {
    createOrder,
    getRestaurantOrders,
    updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:restaurantId', protect, authorizeRoles('waiter', 'admin'), createOrder);
router.get('/:restaurantId', protect, authorizeRoles('waiter', 'chef', 'cashier','admin'), getRestaurantOrders);
router.put('/:orderId/status', protect, authorizeRoles('waiter', 'chef', 'admin'), updateOrderStatus);

module.exports = router;