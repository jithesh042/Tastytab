const express = require('express');
const { getUserProfile, updateUserProfile, updateUserRole } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Admin can update roles of other users within their restaurant
router.put('/update-role', protect, authorizeRoles('admin'), updateUserRole);

module.exports = router;