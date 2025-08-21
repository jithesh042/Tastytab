const express = require('express');
const {
    addEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:restaurantId/add', protect, authorizeRoles('admin'), addEmployee);
router.get('/:restaurantId', protect, authorizeRoles('admin'), getEmployees);
router.put('/:restaurantId/:employeeId', protect, authorizeRoles('admin'), updateEmployee);
router.delete('/:restaurantId/:employeeId', protect, authorizeRoles('admin'), deleteEmployee);

module.exports = router;