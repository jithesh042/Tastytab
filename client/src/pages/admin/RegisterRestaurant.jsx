import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import AuthContext from '../../context/AuthContext';
import Message from '../../components/Message';

const RegisterRestaurant = () => {
    const { user, setUser: updateUserInContext } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', gst: '', menuItems: [] });
    const [menuItemData, setMenuItemData] = useState({ name: '', photo: '', description: '', price: '' });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleRestaurantChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMenuItemChange = (e) => {
        setMenuItemData({ ...menuItemData, [e.target.name]: e.target.value });
    };

    const handleMenuItemPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMenuItemData({ ...menuItemData, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const addMenuItem = () => {
        setMessage('');
        setMessageType('');
        if (menuItemData.name && menuItemData.price) {
            setFormData({
                ...formData,
                menuItems: [...formData.menuItems, { ...menuItemData, price: parseFloat(menuItemData.price) }],
            });
            setMenuItemData({ name: '', photo: '', description: '', price: '' }); // Clear item form
        } else {
            setMessage('Menu item name and price are required.');
            setMessageType('error');
        }
    };

    const removeMenuItem = (index) => {
        const updatedMenuItems = formData.menuItems.filter((_, i) => i !== index);
        setFormData({ ...formData, menuItems: updatedMenuItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        if (!user) {
            setMessage('You must be logged in to register a restaurant.');
            setMessageType('error');
            return;
        }

        try {
            const res = await api.post('/restaurants/register', { ...formData, owner: user._id });
            // Update user role to admin in frontend context and localStorage
            updateUserInContext(res.data.user);
            setMessage('Restaurant registered and your role updated to Admin successfully!');
            setMessageType('success');
            setFormData({ name: '', address: '', phone: '', gst: '', menuItems: [] }); // Clear form
            navigate('/admin'); // Navigate to admin dashboard
        } catch (err) {
            setMessage(`Error registering restaurant: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    if (user && user.role === 'admin') {
        return <div className="text-center p-8 text-green-600">You are already an Admin and own a restaurant.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register Your Restaurant</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Restaurant Name:</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleRestaurantChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                            <input type="text" id="address" name="address" value={formData.address} onChange={handleRestaurantChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleRestaurantChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="gst" className="block text-gray-700 text-sm font-bold mb-2">GST Number:</label>
                            <input type="text" id="gst" name="gst" value={formData.gst} onChange={handleRestaurantChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="border-t pt-6 mt-6 border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Menu Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="menuItemName" className="block text-gray-700 text-sm font-bold mb-2">Item Name:</label>
                                <input type="text" id="menuItemName" name="name" value={menuItemData.name} onChange={handleMenuItemChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="menuItemPrice" className="block text-gray-700 text-sm font-bold mb-2">Price:</label>
                                <input type="number" id="menuItemPrice" name="price" value={menuItemData.price} onChange={handleMenuItemChange} step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="menuItemDescription" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                                <textarea id="menuItemDescription" name="description" value={menuItemData.description} onChange={handleMenuItemChange} rows="2" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="menuItemPhoto" className="block text-gray-700 text-sm font-bold mb-2">Photo:</label>
                                <input type="file" id="menuItemPhoto" accept="image/*" onChange={handleMenuItemPhotoChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                                {menuItemData.photo && <img src={menuItemData.photo} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-md" />}
                            </div>
                        </div>
                        <button type="button" onClick={addMenuItem} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            Add Menu Item
                        </button>

                        {formData.menuItems.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-xl font-semibold text-gray-700 mb-3">Current Menu Items:</h4>
                                <ul className="space-y-2">
                                    {formData.menuItems.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                                            <span>{item.name} - ${item.price.toFixed(2)}</span>
                                            <button type="button" onClick={() => removeMenuItem(index)} className="text-red-500 hover:text-red-700 text-sm font-bold">Remove</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300">
                        Register Restaurant
                    </button>
                </form>
                <Message type={messageType} message={message} />
            </div>
        </div>
    );
};

export default RegisterRestaurant;