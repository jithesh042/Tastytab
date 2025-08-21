const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    user: { // Link to the User document for authentication
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    salary: {
        type: Number,
    },
    bonus: {
        type: Number,
        default: 0,
    },
    role: { // Redundant with User.role but useful for employee-specific queries
        type: String,
        enum: ['waiter', 'chef', 'cashier'],
        required: true,
    },
    image: {
        type: String, // Base64 string
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Employee', EmployeeSchema);