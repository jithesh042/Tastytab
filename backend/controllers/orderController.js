const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Create a new order
// @route   POST /api/orders/:restaurantId
// @access  Private (Waiter/Admin)
const createOrder = async (req, res) => {
    const { tableNumber, customerName, items } = req.body;
    const { restaurantId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure logged-in user is admin/waiter of this restaurant
        if (req.user.restaurant.toString() !== restaurantId) {
            return res.status(403).json({ message: 'Not authorized to create orders for this restaurant' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItem);
            if (!menuItem || menuItem.restaurant.toString() !== restaurantId) {
                return res.status(404).json({ message: `Menu item not found or does not belong to this restaurant: ${item.menuItem}` });
            }
            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity,
            });
            totalAmount += menuItem.price * item.quantity;
        }

        const order = new Order({
            restaurant: restaurantId,
            tableNumber,
            customerName,
            items: orderItems,
            totalAmount,
            createdBy: req.user.id,
            status: 'pending',
        });

        await order.save();
        res.status(201).json(order);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get orders for a specific restaurant (Admin/Waiter/Chef)
// @route   GET /api/orders/:restaurantId
// @access  Private (Admin/Waiter/Chef)
const getRestaurantOrders = async (req, res) => {
    const { restaurantId } = req.params;
    const { status } = req.query; // Optional filter: 'pending', 'preparing', 'ready', 'served'

    try {
        // Ensure logged-in user is associated with this restaurant
        if (req.user.restaurant.toString() !== restaurantId) {
            return res.status(403).json({ message: 'Not authorized to view orders for this restaurant' });
        }

        let query = { restaurant: restaurantId };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('items.menuItem', 'name price') // Populate menu item details
            .sort({ createdAt: -1 }); // Latest orders first

        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private (Admin/Waiter/Chef)
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body; // 'pending', 'preparing', 'ready', 'served', 'cancelled'

    try {
        let order = await Order.findById(orderId).populate('restaurant');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure logged-in user is associated with this restaurant
        if (!order.restaurant || req.user.restaurant.toString() !== order.restaurant._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        // Role-based status updates
        if (req.user.role === 'chef') {
            if (!['preparing', 'ready'].includes(status)) {
                return res.status(403).json({ message: 'Chef can only set status to preparing or ready' });
            }
        } else if (req.user.role === 'waiter' || req.user.role === 'admin') {
            // Waiter/Admin can set any status
        } else {
            return res.status(403).json({ message: 'You do not have permission to update order status' });
        }

        order.status = status;
        if (status === 'served') {
            order.servedAt = Date.now();
        }
        await order.save();
        res.json(order);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};const getOrdersByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  const { status } = req.query;

  try {
    if (!req.user.restaurant || req.user.restaurant.toString() !== restaurantId) {
      return res.status(403).json({ message: 'Not authorized for this restaurant' });
    }

    const query = { restaurant: restaurantId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    getOrdersByRestaurant ,
    createOrder,
    getRestaurantOrders,
    updateOrderStatus,
};