const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: String, // Store name directly for easy retrieval
    price: Number, // Store price directly
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
});

const OrderSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    tableNumber: {
        type: String,
        required: true,
    },
    customerName: { // Name of customer at the table
        type: String,
        required: true,
    },
    items: [OrderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
        default: 'pending',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    createdBy: { // User who took the order (e.g., waiter)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    servedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Order', OrderSchema);