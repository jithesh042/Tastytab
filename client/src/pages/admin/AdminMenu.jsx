import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Message from '../../components/Message';
import './AdminMenu.css'; // Import the CSS file

const AdminMenu = ({ restaurantId }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ _id: '', name: '', photo: '', description: '', price: '', review: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        if (restaurantId) fetchMenuItems();
    }, [restaurantId]);

    const fetchMenuItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/menu/${restaurantId}`);
            setMenuItems(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm({ ...form, photo: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        try {
            if (isEditing) {
                await api.put(`/menu/${restaurantId}/${form._id}`, { ...form, price: parseFloat(form.price) });
                setMessage('Menu item updated successfully!');
            } else {
                await api.post(`/menu/${restaurantId}/add`, { ...form, price: parseFloat(form.price) });
                setMessage('Menu item added successfully!');
            }
            setMessageType('success');
            setForm({ _id: '', name: '', photo: '', description: '', price: '', review: '' });
            setIsEditing(false);
            fetchMenuItems();
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setIsEditing(true);
    };

    const handleDelete = async (itemId) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/menu/${restaurantId}/${itemId}`);
                setMessage('Menu item deleted successfully!');
                setMessageType('success');
                fetchMenuItems();
            } catch (err) {
                setMessage(`Error: ${err.response?.data?.message || err.message}`);
                setMessageType('error');
            }
        }
    };

    if (loading) return <div className="loading">Loading menu management...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="admin-menu-container">
            <h2 className="title">{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label htmlFor="name">Item Name:</label>
                    <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price:</label>
                    <input type="number" id="price" name="price" value={form.price} onChange={handleChange} step="0.01" required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="3" />
                </div>
                {/* <div className="form-group">
                    <label htmlFor="review">Review:</label>
                    <input type="text" id="review" name="review" value={form.review} onChange={handleChange} />
                </div> */}
                <div className="form-group">
                    <label htmlFor="photo">Photo:</label>
                    <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} />
                    {form.photo && <img src={form.photo} alt="Preview" className="preview-img" />}
                </div>
                <button type="submit" className="btn submit-btn">{isEditing ? 'Update Item' : 'Add Item'}</button>
                {isEditing && (
                    <button type="button" className="btn cancel-btn" onClick={() => {
                        setIsEditing(false);
                        setForm({ _id: '', name: '', photo: '', description: '', price: '', review: '' });
                    }}>
                        Cancel Edit
                    </button>
                )}
            </form>

            <Message type={messageType} message={message} />

            <h3 className="subtitle">Current Menu</h3>
            {menuItems.length === 0 ? (
                <p className="no-items">No menu items added yet.</p>
            ) : (
                <div className="menu-grid">
                    {menuItems.map((item) => (
                        <div key={item._id} className="menu-card">
                            {item.photo && <img src={item.photo} alt={item.name} className="menu-img" />}
                            <div className="menu-content">
                                <h4 className="item-name">{item.name}</h4>
                                <p className="item-description">{item.description}</p>
                                <p className="item-price">${item.price.toFixed(2)}</p>
                                <div className="action-buttons">
                                    <button onClick={() => handleEdit(item)} className="btn edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(item._id)} className="btn delete-btn">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminMenu;
