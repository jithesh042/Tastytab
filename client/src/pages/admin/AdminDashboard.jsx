import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../api/api';
import Message from '../../components/Message';

// Import Admin Sub-Components
import AdminMenu from './AdminMenu';
import BillHistory from './BillHistory';
import TableBookingAdmin from './TableBookingAdmin';
import EmployeeManagement from './EmployeeManagement';
import AddRole from './AddRole';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (user && user.role === 'admin') {
                try {
                    const res = await api.get(`/restaurants/admin/${user._id}`);
                    setRestaurant(res.data);
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchRestaurant();
    }, [user]);

    const renderContent = () => {
        if (!restaurant) {
            return <p className="no-restaurant">No restaurant registered under your admin account. Please register one from your profile page.</p>;
        }

        switch (activeTab) {
            case 'details':
                return (
                    <div className="details-container">
                        <h3 className="section-title">Restaurant Details</h3>
                        <p><strong>Name:</strong> {restaurant.name}</p>
                        <p><strong>Address:</strong> {restaurant.address}</p>
                        <p><strong>Phone:</strong> {restaurant.phone}</p>
                        <p><strong>GST:</strong> {restaurant.gst || 'N/A'}</p>
                        {/* <button className="edit-button">Edit Details (Coming Soon)</button> */}
                    </div>
                );
            case 'menu':
                return <AdminMenu restaurantId={restaurant._id} />;
            case 'bill-history':
                return <BillHistory restaurantId={restaurant._id} />;
            case 'table-bookings':
                return <TableBookingAdmin restaurantId={restaurant._id} />;
            case 'employees':
                return <EmployeeManagement restaurantId={restaurant._id} />;
            case 'add-role':
                return <AddRole restaurantId={restaurant._id} />;
            default:
                return null;
        }
    };

    if (loading) return <div className="loading">Loading admin dashboard...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <>
            <style>{`
                .dashboard {
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                }

                @media (min-width: 768px) {
                    .dashboard {
                        flex-direction: row;
                    }
                }

                .sidebar {
                    background-color: #1f2937;
                    color: white;
                    width: 100%;
                    max-width: 16rem;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                @media (min-width: 768px) {
                    .sidebar {
                        margin-bottom: 0;
                        margin-right: 1rem;
                    }
                }

                .nav-button {
                    text-align: left;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    background-color: transparent;
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .nav-button:hover {
                    background-color: #4b5563;
                }

                .nav-button.active {
                    background-color: #374151;
                }

                .content {
                    flex: 1;
                    background-color: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .details-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .edit-button {
                    background-color: #3b82f6;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .edit-button:hover {
                    background-color: #2563eb;
                }

                .loading, .error, .no-restaurant {
                    text-align: center;
                    padding: 2rem;
                }

                .error {
                    color: #dc2626;
                }

                .no-restaurant {
                    color: #b45309;
                }
            `}</style>

            <div className="dashboard">
                {/* Sidebar Navigation */}
                <div className="sidebar">
                    <h3 className="text-xl font-bold mb-4">Admin Panel</h3>
                    <button onClick={() => setActiveTab('details')} className={`nav-button ${activeTab === 'details' ? 'active' : ''}`}>
                        Restaurant Details
                    </button>
                    <button onClick={() => setActiveTab('menu')} className={`nav-button ${activeTab === 'menu' ? 'active' : ''}`}>
                        Menu Management
                    </button>
                    {/* <button onClick={() => setActiveTab('bill-history')} className={`nav-button ${activeTab === 'bill-history' ? 'active' : ''}`}>
                        Bill History
                    </button> */}
                    <button onClick={() => setActiveTab('table-bookings')} className={`nav-button ${activeTab === 'table-bookings' ? 'active' : ''}`}>
                        Table Bookings
                    </button>
                    <button onClick={() => setActiveTab('employees')} className={`nav-button ${activeTab === 'employees' ? 'active' : ''}`}>
                        Employee Management
                    </button>
                    {/* <button onClick={() => setActiveTab('add-role')} className={`nav-button ${activeTab === 'add-role' ? 'active' : ''}`}>
                        Assign Employee Role
                    </button> */}
                </div>

                {/* Main Content Area */}
                <div className="content">
                    {renderContent()}
                    <Message type={messageType} message={message} />
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
