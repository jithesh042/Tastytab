import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Message from '../../components/Message';
import { Link } from 'react-router-dom';
import './OrderPage.css';

const OrderPage = ({ restaurantId }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [currentOrder, setCurrentOrder] = useState([]);
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            if (!restaurantId) {
                setMessage('Restaurant ID not available. Please ensure you are logged in as an employee of a registered restaurant.');
                setMessageType('error');
                setLoading(false);
                return;
            }
            try {
                const res = await api.get(`/menu/${restaurantId}`);
                setMenuItems(res.data);
            } catch (err) {
                setMessage(`Error fetching menu: ${err.response?.data?.message || err.message}`);
                setMessageType('error');
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [restaurantId]);

    const addToCart = (item) => {
        const existingItemIndex = currentOrder.findIndex(orderItem => orderItem.menuItem._id === item._id);
        if (existingItemIndex > -1) {
            const updatedOrder = [...currentOrder];
            updatedOrder[existingItemIndex].quantity += 1;
            setCurrentOrder(updatedOrder);
        } else {
            setCurrentOrder([...currentOrder, { menuItem: item, quantity: 1 }]);
        }
    };

    const updateQuantity = (index, delta) => {
        const updatedOrder = [...currentOrder];
        updatedOrder[index].quantity += delta;
        if (updatedOrder[index].quantity <= 0) {
            updatedOrder.splice(index, 1);
        }
        setCurrentOrder(updatedOrder);
    };

    const removeFromCart = (index) => {
        const updatedOrder = [...currentOrder];
        updatedOrder.splice(index, 1);
        setCurrentOrder(updatedOrder);
    };

    const sendOrderToChef = async () => {
        setMessage('');
        setMessageType('');
        if (!tableNumber || !customerName || currentOrder.length === 0) {
            setMessage('Please enter table number, customer name, and add items to the order.');
            setMessageType('error');
            return;
        }

        const itemsToSend = currentOrder.map(item => ({
            menuItem: item.menuItem._id,
            quantity: item.quantity,
        }));

        const totalAmount = currentOrder.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);

        try {
            await api.post(`/orders/${restaurantId}`, {
                tableNumber,
                customerName,
                items: itemsToSend,
                totalAmount,
            });
            setMessage('Order sent to chef successfully!');
            setMessageType('success');
            setCurrentOrder([]);
            setTableNumber('');
            setCustomerName('');
        } catch (err) {
            setMessage(`Error sending order: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    const calculateSubtotal = () => {
        return currentOrder.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
    };

    if (loading) return <div className="loading">Loading menu...</div>;

    return (
        <div className="order-page">
            <div className="menu-section">
                <h2 className="section-title">Restaurant Menu</h2>
                {messageType === 'error' && <Message type="error" message={message} />}
                {menuItems.length === 0 ? (
                    <p className="no-menu">No menu items available.</p>
                ) : (
                    <div className="menu-grid">
                        {menuItems.map((item) => (
                            <div key={item._id} className="menu-card">
                                {item.photo && <img src={item.photo} alt={item.name} className="menu-img" />}
                                <div className="menu-info">
                                    <h3 className="menu-title">{item.name}</h3>
                                    <p className="menu-desc">{item.description}</p>
                                    <div className="menu-bottom">
                                        <span className="menu-price">${item.price.toFixed(2)}</span>
                                        <button onClick={() => addToCart(item)} className="add-button">Add</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="order-section">
                <h2 className="section-title">Current Order</h2>
                <div className="form-group">
                    <label htmlFor="tableNumber">Table Number:</label>
                    <input
                        type="text"
                        id="tableNumber"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="customerName">Customer Name:</label>
                    <input
                        type="text"
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </div>

                <div className="order-list">
                    {currentOrder.length === 0 ? (
                        <p className="no-order">No items in order yet.</p>
                    ) : (
                        <ul>
                            {currentOrder.map((item, index) => (
                                <li key={item.menuItem._id} className="order-item">
                                    <div>
                                        <p className="item-name">{item.menuItem.name}</p>
                                        <p className="item-details">${item.menuItem.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => updateQuantity(index, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(index, 1)}>+</button>
                                        <button onClick={() => removeFromCart(index)}>Remove</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="order-summary">
                    <div className="subtotal">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <button onClick={sendOrderToChef} className="send-button">Send Order to Chef</button>
                    {/* {currentOrder.length > 0 && (
                        <Link
                            to="/cashier"
                            state={{ orderItems: currentOrder, tableNumber, customerName, restaurantId, totalAmount: calculateSubtotal() }}
                            className="cashier-button"
                        >
                            Go to Bill (Cashier)
                        </Link>
                    )} */}
                </div>
                <Message type={messageType} message={message} />
            </div>
        </div>
    );
};

export default OrderPage;
