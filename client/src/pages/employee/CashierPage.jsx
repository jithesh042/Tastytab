import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
import Message from '../../components/Message';
import './CashierPage.css';

const CashierPage = ({ restaurantId: propRestaurantId }) => {
  const location = useLocation();
  const { orderItems, tableNumber: initialTableNumber, customerName: initialCustomerName, totalAmount: initialTotalAmount, orderId: initialOrderId } = location.state || {};

  // You may also pull restaurantId from user context
  const [restaurantId] = useState(propRestaurantId);

  const [tableNumber, setTableNumber] = useState(initialTableNumber || '');
  const [customerName, setCustomerName] = useState(initialCustomerName || '');
  const [items, setItems] = useState(orderItems || []);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId || '');
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  /** ✅ Reusable fetch orders function */
  const fetchAvailableOrders = useCallback(async () => {
    if (!restaurantId) {
      setMessage('Restaurant ID not available. Please login as Cashier or Admin.');
      setMessageType('error');
      setLoadingOrders(false);
      return;
    }
    try {
      const res = await api.get(`/orders/${restaurantId}?status=ready`);
      setAvailableOrders(res.data);
    } catch (err) {
      setMessage(`Error fetching available orders: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
    } finally {
      setLoadingOrders(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    setLoadingOrders(true);
    fetchAvailableOrders();
  }, [fetchAvailableOrders]);

  useEffect(() => {
    if (selectedOrderId) {
      const order = availableOrders.find(o => o._id === selectedOrderId);
      if (order) {
        setTableNumber(order.tableNumber);
        setCustomerName(order.customerName);
        setItems(order.items.map(item => ({
          menuItem: item.menuItem,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })));
      }
    } else if (!initialOrderId) {
      setTableNumber('');
      setCustomerName('');
      setItems([]);
    }
  }, [selectedOrderId, availableOrders, initialOrderId]);

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateTotalWithTax = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (gstPercentage / 100);
    return subtotal + taxAmount;
  };

  /** ✅ Generate Bill */
  const handleGenerateBill = async () => {
    setMessage('');
    setMessageType('');

    if (!tableNumber || !customerName || items.length === 0) {
      setMessage('Please ensure table number, customer name, and items are filled.');
      setMessageType('error');
      return;
    }

    try {
      const billData = {
        tableNumber,
        customerName,
        items: items.map(item => ({
          menuItem: item.menuItem._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalWithoutTax: calculateSubtotal(),
        gstPercentage,
        totalAmount: calculateTotalWithTax(),
        orderId: selectedOrderId || null
      };

      /** ✅ Use separate manual bill endpoint if no order is selected */
      const url = selectedOrderId
        ? `/bills/generate-from-order/${selectedOrderId}`
        : `/bills/manual`;

      await api.post(url, billData);

      setMessage('Bill generated successfully!');
      setMessageType('success');
      setTableNumber('');
      setCustomerName('');
      setItems([]);
      setGstPercentage(18);
      setSelectedOrderId('');
      fetchAvailableOrders();
    } catch (err) {
      setMessage(`Error generating bill: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
    }
  };

  if (loadingOrders) return <div className="loading">Loading available orders...</div>;

  return (
    <div className="cashier-container">
      <div className="cashier-box">
        <h2 className="cashier-title">Generate Bill</h2>
        <Message type={messageType} message={message} />

        <div className="form-group">
          <label htmlFor="selectOrder">Select an Order (Optional):</label>
          <select
            id="selectOrder"
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
          >
            <option value="">-- Manual Bill / Select Order --</option>
            {availableOrders.map(order => (
              <option key={order._id} value={order._id}>
                Table {order.tableNumber} - {order.customerName} (Order ID: {order._id.substring(0, 8)}...)
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tableNumber">Table Number:</label>
            <input
              type="text"
              id="tableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="customerName">Customer Name:</label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
        </div>

        <h3 className="section-title">Items:</h3>
        {items.length === 0 ? (
          <p className="no-items">No items added to bill.</p>
        ) : (
          <div className="table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="summary-section">
          <p>Subtotal: <strong>${calculateSubtotal().toFixed(2)}</strong></p>
          <div className="gst-input">
            <label htmlFor="gst">GST (%):</label>
            <input
              type="number"
              id="gst"
              value={gstPercentage}
              onChange={(e) => setGstPercentage(parseFloat(e.target.value))}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          <p className="total-amount">Total Amount: ${calculateTotalWithTax().toFixed(2)}</p>
        </div>

        <button onClick={handleGenerateBill} className="generate-button">
          Generate Bill
        </button>
      </div>
    </div>
  );
};

export default CashierPage;
