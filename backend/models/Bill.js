const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
});

const BillSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        unique: true, // One bill per order
        sparse: true, // Allow null for manual bills
    },
    tableNumber: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    items: [BillItemSchema],
    totalWithoutTax: {
        type: Number,
        required: true,
    },
    gstPercentage: {
        type: Number,
        default: 18, // Example GST percentage
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    generatedBy: { // User who generated the bill (e.g., cashier)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Bill', BillSchema);