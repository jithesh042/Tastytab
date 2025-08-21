const express = require('express');
const {
    createBooking,
    getCustomerBookings,
    getRestaurantBookings,
    updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('customer'), createBooking);
router.get('/customer/:customerId', protect, authorizeRoles('customer'), getCustomerBookings);
router.get('/restaurant/:restaurantId', protect, authorizeRoles('admin'), getRestaurantBookings);
router.put('/:bookingId/update-status', protect, authorizeRoles('admin'), updateBookingStatus);

module.exports = router;