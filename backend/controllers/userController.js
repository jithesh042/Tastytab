const User = require('../models/User');
const bcrypt = require('bcryptjs');


const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


const updateUserProfile = async (req, res) => {
    const { name, phone, profilePicture } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.profilePicture = profilePicture || user.profilePicture;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                profilePicture: updatedUser.profilePicture,
                role: updatedUser.role,
                restaurant: updatedUser.restaurant,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

const updateUserRole = async (req, res) => {
    const { email, newRole, restaurantId } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure only admin can assign roles within their restaurant
        if (req.user.role !== 'admin' || (restaurantId && req.user.restaurant.toString() !== restaurantId)) {
            return res.status(403).json({ message: 'Not authorized to update this user\'s role' });
        }

        // Validate newRole
        const validRoles = ['waiter', 'chef', 'cashier', 'customer']; // Admin cannot assign 'admin' role directly here
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        user.role = newRole;
        if (newRole !== 'customer') { // Assign restaurant only for employee roles
            user.restaurant = restaurantId;
        } else {
            user.restaurant = null; // Clear restaurant if role is customer
        }

        await user.save();

        res.json({ message: `User ${user.email}'s role updated to ${newRole}` });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


module.exports = { getUserProfile, updateUserProfile, updateUserRole };