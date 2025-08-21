import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Message from '../../components/Message';
import './ChefPage.css';

const ChefPage = ({ restaurantId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        if (restaurantId) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [restaurantId]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const pendingOrders = await api.get(`/orders/${restaurantId}?status=pending`);
            const preparingOrders = await api.get(`/orders/${restaurantId}?status=preparing`);
            setOrders([...pendingOrders.data, ...preparingOrders.data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setMessage('');
        setMessageType('');
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setMessage(`Order ${orderId.substring(0, 8)}... status updated to ${newStatus}!`);
            setMessageType('success');
            fetchOrders();
        } catch (err) {
            setMessage(`Error updating order status: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    if (loading) return <div className="chef-loading">Loading orders for chef...</div>;
    if (error) return <div className="chef-error">Error: {error}</div>;

    return (
        <div className="chef-container">
            <h2 className="chef-title">Chef's Order Board</h2>
            <Message type={messageType} message={message} />

            {orders.length === 0 ? (
                <p className="no-orders">No pending or preparing orders.</p>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div>
                                <h3 className="order-heading">
                                    Table: {order.tableNumber} - {order.customerName}
                                </h3>
                                <p className="order-meta">
                                    Order ID: {order._id.substring(0, 8)}... | Placed: {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                                <div className="items-section">
                                    <h4 className="items-title">Items:</h4>
                                    <ul className="items-list">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="item">
                                                <span>{item.name}</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="order-actions">
                                <p className={`status status-${order.status}`}>
                                    Status: {order.status}
                                </p>
                                <div className="button-group">
                                    {order.status === 'pending' && (
                                        <button onClick={() => updateOrderStatus(order._id, 'preparing')} className="btn yellow">
                                            Start Preparing
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button onClick={() => updateOrderStatus(order._id, 'ready')} className="btn green">
                                            Mark as Ready
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChefPage;
