const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Add a new menu item
// @route   POST /api/menu/:restaurantId/add
// @access  Private/Admin
const addMenuItem = async (req, res) => {
    const { name, description, price, photo, review } = req.body;
    const { restaurantId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure logged-in user is the owner of this restaurant
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to add menu items to this restaurant' });
        }

        const menuItem = new MenuItem({
            restaurant: restaurantId,
            name,
            description,
            price,
            photo,
            review,
        });

        await menuItem.save();
        res.status(201).json(menuItem);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get menu items for a specific restaurant
// @route   GET /api/menu/:restaurantId
// @access  Public
const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
        res.json(menuItems);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:restaurantId/:menuItemId
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
    const { name, description, price, photo, review } = req.body;
    const { restaurantId, menuItemId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure logged-in user is the owner of this restaurant
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update menu items for this restaurant' });
        }

        let menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Ensure the menu item belongs to the specified restaurant
        if (menuItem.restaurant.toString() !== restaurantId) {
            return res.status(400).json({ message: 'Menu item does not belong to this restaurant' });
        }

        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.photo = photo || menuItem.photo;
        menuItem.review = review || menuItem.review;

        const updatedMenuItem = await menuItem.save();
        res.json(updatedMenuItem);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:restaurantId/:menuItemId
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
    const { restaurantId, menuItemId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure logged-in user is the owner of this restaurant
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete menu items from this restaurant' });
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Ensure the menu item belongs to the specified restaurant
        if (menuItem.restaurant.toString() !== restaurantId) {
            return res.status(400).json({ message: 'Menu item does not belong to this restaurant' });
        }

        await MenuItem.deleteOne({ _id: menuItemId }); // Use deleteOne for clarity
        res.json({ message: 'Menu item removed' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    addMenuItem,
    getMenuItems,
    updateMenuItem,
    deleteMenuItem,
};