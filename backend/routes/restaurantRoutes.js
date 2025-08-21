const express = require('express');
const {
    registerRestaurant,
    getAllRestaurants,
    getRestaurantByAdminId,
    updateRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', protect, registerRestaurant); // Customer registers restaurant
router.get('/', getAllRestaurants); // Publicly accessible list of restaurants
router.get('/admin/:userId', protect, authorizeRoles('admin'), getRestaurantByAdminId); // Get restaurant for specific admin
router.put('/:id', protect, authorizeRoles('admin'), updateRestaurant); // Admin updates their restaurant

module.exports = router;