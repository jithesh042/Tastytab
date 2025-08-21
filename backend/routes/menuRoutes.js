const express = require('express');
const {
    addMenuItem,
    getMenuItems,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Publicly accessible menu for a restaurant
router.get('/:restaurantId', getMenuItems);

// Admin-only routes for menu management
router.post('/:restaurantId/add', protect, authorizeRoles('admin'), addMenuItem);
router.put('/:restaurantId/:menuItemId', protect, authorizeRoles('admin'), updateMenuItem);
router.delete('/:restaurantId/:menuItemId', protect, authorizeRoles('admin'), deleteMenuItem);

module.exports = router;