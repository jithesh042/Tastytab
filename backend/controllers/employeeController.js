const Employee = require('../models/Employee');
const User = require('../models/User'); // To create/link user accounts
const Restaurant = require('../models/Restaurant');

// @desc    Add a new employee
// @route   POST /api/employees/:restaurantId/add
// @access  Private/Admin
const addEmployee = async (req, res) => {
    const { name, age, salary, bonus, email, role, password, image } = req.body;
    const { restaurantId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure logged-in user is the owner of this restaurant
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to add employees to this restaurant' });
        }

        // Check if a user with this email already exists
        let user = await User.findOne({ email });
        if (user) {
            // If user exists, check if they are already an employee of this restaurant
            const existingEmployee = await Employee.findOne({ user: user._id, restaurant: restaurantId });
            if (existingEmployee) {
                return res.status(400).json({ message: 'User is already an employee of this restaurant.' });
            }
            // If user exists but not an employee of THIS restaurant, update their role and link
            user.role = role;
            user.restaurant = restaurantId;
            await user.save();
        } else {
            // If user does not exist, create a new user account for the employee
            user = new User({
                name,
                email,
                password, // Password will be hashed by User model pre-save hook
                role,
                restaurant: restaurantId,
            });
            await user.save();
        }

        const employee = new Employee({
            user: user._id,
            restaurant: restaurantId,
            name,
            age,
            salary,
            bonus,
            role,
            image,
        });

        await employee.save();
        res.status(201).json(employee);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get all employees for a specific restaurant
// @route   GET /api/employees/:restaurantId
// @access  Private/Admin
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ restaurant: req.params.restaurantId })
            .populate('user', 'email'); // Populate user email for reference
        res.json(employees);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Update an employee
// @route   PUT /api/employees/:restaurantId/:employeeId
// @access  Private/Admin
const updateEmployee = async (req, res) => {
    const { name, age, salary, bonus, email, role, password, image } = req.body;
    const { restaurantId, employeeId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure logged-in user is the owner of this restaurant
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update employees for this restaurant' });
        }

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Ensure the employee belongs to the specified restaurant
        if (employee.restaurant.toString() !== restaurantId) {
            return res.status(400).json({ message: 'Employee does not belong to this restaurant' });
        }

        // Update associated User document if email or role changes
        const user = await User.findById(employee.user);
        if (user) {
            if (email && user.email !== email) user.email = email;
            if (role && user.role !== role) user.role = role;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }
            await user.save();
        }

        employee.name = name || employee.name;
        employee.age = age || employee.age;
        employee.salary = salary || employee.salary;
        employee.bonus = bonus || employee.bonus;
        employee.role = role || employee.role;
        employee.image = image || employee.image;

        const updatedEmployee = await employee.save();
        res.json(updatedEmployee);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:restaurantId/:employeeId
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
    const { restaurantId, employeeId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Ensure logged-in user is the owner of this restaurant
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete employees from this restaurant' });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Ensure the employee belongs to the specified restaurant
        if (employee.restaurant.toString() !== restaurantId) {
            return res.status(400).json({ message: 'Employee does not belong to this restaurant' });
        }

        // Optionally, reset the associated user's role to 'customer' and remove restaurant link
        const user = await User.findById(employee.user);
        if (user) {
            user.role = 'customer';
            user.restaurant = null;
            await user.save();
        }

        await Employee.deleteOne({ _id: employeeId });
        res.json({ message: 'Employee removed' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    addEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee,
};