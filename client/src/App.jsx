import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext'; // To consume context
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Customer Pages
import Home from './pages/customer/home';
import Menu from './pages/customer/Menu';
import TableBooking from './pages/customer/TableBooking';
import Auth from './pages/customer/Auth'; // Login/Register
import Profile from './pages/customer/Profile';

// Admin Pages
import RegisterRestaurant from './pages/admin/RegisterRestaurant';
import AdminDashboard from './pages/admin/AdminDashboard';

// Employee Pages
import OrderPage from './pages/employee/OrderPage';
import ChefPage from './pages/employee/ChefPage';
import CashierPage from './pages/employee/CashierPage';

const AppContent = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="text-center p-8 text-xl">Loading application...</div>;
    }

    // Determine restaurantId for employee roles if logged in
    const restaurantId = user && user.restaurant ? user.restaurant : null;

    return (
        <>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/table-booking" element={<TableBooking />} />
                <Route path="/auth" element={<Auth />} />

                {/* Private Routes - Customer */}
                <Route path="/profile" element={<PrivateRoute allowedRoles={['customer', 'admin', 'waiter', 'chef', 'cashier']}><Profile /></PrivateRoute>} />
                <Route path="/register-restaurant" element={<PrivateRoute allowedRoles={['customer']}><RegisterRestaurant /></PrivateRoute>} />

                {/* Private Routes - Admin */}
                <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />

                {/* Private Routes - Employee Roles */}
                <Route path="/orders" element={<PrivateRoute allowedRoles={['waiter', 'admin']}><OrderPage restaurantId={restaurantId} /></PrivateRoute>} />
                <Route path="/chef" element={<PrivateRoute allowedRoles={['chef', 'admin']}><ChefPage restaurantId={restaurantId} /></PrivateRoute>} />
                <Route path="/cashier" element={<PrivateRoute allowedRoles={['cashier', 'admin']}><CashierPage restaurantId={restaurantId} /></PrivateRoute>} />

                {/* Catch-all for undefined routes */}
                <Route path="*" element={<div className="text-center p-8 text-red-500">404 - Page Not Found</div>} />
            </Routes>
        </>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;