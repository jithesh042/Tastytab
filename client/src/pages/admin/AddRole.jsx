import React, { useState, useContext } from 'react';
import api from '../../api/api';
import AuthContext from '../../context/AuthContext';
import Message from '../../components/Message';

const AddRole = ({ restaurantId }) => {
    const { user } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('waiter');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        if (!restaurantId) {
            setMessage('Admin must have a registered restaurant to assign roles.');
            setMessageType('error');
            return;
        }
        try {
            await api.put('/users/update-role', { email, newRole: role, restaurantId });
            setMessage(`Role for ${email} updated to ${role} successfully!`);
            setMessageType('success');
            setEmail('');
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        },
        heading: {
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#1f2937', // gray-800
            marginBottom: '1.5rem'
        },
        form: {
            backgroundColor: '#f9fafb', // gray-50
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        label: {
            color: '#374151', // gray-700
            fontWeight: 'bold',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            display: 'block'
        },
        input: {
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db', // gray-300
            outline: 'none',
            width: '100%',
            fontSize: '1rem'
        },
        select: {
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            outline: 'none',
            width: '100%',
            fontSize: '1rem'
        },
        button: {
            backgroundColor: '#8b5cf6', // purple-500
            color: '#fff',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Assign Role to Existing User</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div>
                    <label htmlFor="userEmail" style={styles.label}>User Email:</label>
                    <input
                        type="email"
                        id="userEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div>
                    <label htmlFor="newRole" style={styles.label}>Assign Role:</label>
                    <select
                        id="newRole"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.select}
                    >
                        <option value="waiter">Waiter</option>
                        <option value="chef">Chef</option>
                        <option value="cashier">Cashier</option>
                        <option value="customer">Customer (Remove role)</option>
                    </select>
                </div>
                <button type="submit" style={styles.button}>
                    Assign Role
                </button>
            </form>
            <Message type={messageType} message={message} />
        </div>
    );
};

export default AddRole;
