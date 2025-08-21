const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem'); // To add initial menu items

// @desc    Register a new restaurant and make user admin
// @route   POST /api/restaurants/register
// @access  Private (customer who wants to become admin)
const registerRestaurant = async (req, res) => {
    const { name, address, phone, gst, menuItems } = req.body;
    const ownerId = req.user.id; // User registering the restaurant

    try {
        // Check if user already owns a restaurant
        const existingRestaurant = await Restaurant.findOne({ owner: ownerId });
        if (existingRestaurant) {
            return res.status(400).json({ message: 'You have already registered a restaurant.' });
        }

        // Check if restaurant name or GST already exists
        let restaurantExists = await Restaurant.findOne({ name });
        if (restaurantExists) {
            return res.status(400).json({ message: 'Restaurant name already taken.' });
        }
        if (gst) {
            restaurantExists = await Restaurant.findOne({ gst });
            if (restaurantExists) {
                return res.status(400).json({ message: 'GST number already registered.' });
            }
        }

        const restaurant = new Restaurant({
            name,
            address,
            phone,
            gst,
            owner: ownerId,
        });

        await restaurant.save();

        // Update user's role to 'admin' and link to restaurant
        const user = await User.findById(ownerId);
        user.role = 'admin';
        user.restaurant = restaurant._id;
        await user.save();

        // Add initial menu items
        if (menuItems && menuItems.length > 0) {
            const newMenuItems = menuItems.map(item => ({
                ...item,
                restaurant: restaurant._id,
            }));
            await MenuItem.insertMany(newMenuItems);
        }

        res.status(201).json({
            message: 'Restaurant registered successfully and your role has been updated to Admin!',
            restaurant,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurant: user.restaurant,
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get all restaurants (for customer to browse)
// @route   GET /api/restaurants
// @access  Public
const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get restaurant by admin ID
// @route   GET /api/restaurants/admin/:userId
// @access  Private/Admin
const getRestaurantByAdminId = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.params.userId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found for this admin.' });
        }
        res.json(restaurant);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


// @desc    Update restaurant details
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
const updateRestaurant = async (req, res) => {
    const { name, address, phone, gst } = req.body;

    try {
        let restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure the logged-in user is the owner of this restaurant
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this restaurant' });
        }

        restaurant.name = name || restaurant.name;
        restaurant.address = address || restaurant.address;
        restaurant.phone = phone || restaurant.phone;
        restaurant.gst = gst || restaurant.gst;

        const updatedRestaurant = await restaurant.save();
        res.json(updatedRestaurant);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    registerRestaurant,
    getAllRestaurants,
    getRestaurantByAdminId,
    updateRestaurant,
};