import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import api from '../../api/api';
import Message from '../../components/Message';

const Profile = () => {
    const { user, setUser: updateUserInContext } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', profilePicture: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                profilePicture: user.profilePicture || 'https://placehold.co/100x100/aabbcc/ffffff?text=PP'
            });
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/bookings/customer/${user._id}`);
            setBookings(res.data);
        } catch (err) {
            setMessage(`Error fetching bookings: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData({ ...profileData, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        try {
            const res = await api.put(`/users/profile`, profileData);
            updateUserInContext(res.data);
            setMessage('Profile updated successfully!');
            setMessageType('success');
            setIsEditing(false);
        } catch (err) {
            setMessage(`Error updating profile: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    if (!user) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Please log in to view your profile.</div>;
    }

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f3f4f6',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        },
        card: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '768px',
            marginTop: '2rem'
        },
        heading: {
            fontSize: '1.875rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1f2937',
            marginBottom: '1.5rem'
        },
        tabContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem'
        },
        tabButton: (isActive, side) => ({
            padding: '0.5rem 1.5rem',
            borderRadius: side === 'left' ? '0.5rem 0 0 0.5rem' : '0 0.5rem 0.5rem 0',
            fontWeight: '600',
            backgroundColor: isActive ? '#16a34a' : '#e5e7eb',
            color: isActive ? 'white' : '#374151',
            border: 'none',
            cursor: 'pointer'
        }),
        label: {
            display: 'block',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            marginBottom: '0.25rem',
            color: '#374151'
        },
        input: (disabled) => ({
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            backgroundColor: disabled ? '#f9fafb' : 'white',
            color: '#374151',
            outline: 'none'
        }),
        button: (bg) => ({
            backgroundColor: bg,
            color: 'white',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            marginTop: '1rem'
        }),
        profileImage: {
            width: '96px',
            height: '96px',
            borderRadius: '9999px',
            objectFit: 'cover',
            border: '4px solid #d1d5db',
            marginBottom: '1rem'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            backgroundColor: '#e5e7eb',
            color: '#374151',
            fontSize: '0.875rem',
            padding: '0.75rem',
            textAlign: 'left',
            textTransform: 'uppercase'
        },
        td: {
            padding: '0.75rem',
            fontSize: '0.875rem',
            color: '#4b5563',
            borderBottom: '1px solid #e5e7eb'
        },
        status: (status) => {
            let bg = '#fef3c7', color = '#92400e';
            if (status === 'confirmed') { bg = '#d1fae5'; color = '#065f46'; }
            else if (status === 'cancelled') { bg = '#fecaca'; color = '#991b1b'; }
            return {
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '0.75rem',
                backgroundColor: bg,
                color
            };
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Your Profile</h2>

                {user.role === 'customer' && (
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <Link to="/register-restaurant" style={styles.button('#7c3aed')}>
                            Register Restaurant (Become Admin)
                        </Link>
                    </div>
                )}

                <div style={styles.tabContainer}>
                    <button onClick={() => setActiveTab('details')} style={styles.tabButton(activeTab === 'details', 'left')}>Profile Details</button>
                    <button onClick={() => setActiveTab('bookings')} style={styles.tabButton(activeTab === 'bookings', 'right')}>Table Booking History</button>
                </div>

                {activeTab === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <img src={profileData.profilePicture} alt="Profile" style={styles.profileImage} />
                            {isEditing && <input type="file" accept="image/*" onChange={handleProfilePictureChange} />}
                        </div>
                        <form onSubmit={handleUpdateProfile}>
                            <div>
                                <label htmlFor="name" style={styles.label}>Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    disabled={!isEditing}
                                    style={styles.input(!isEditing)}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" style={styles.label}>Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    disabled={true}
                                    style={styles.input(true)}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" style={styles.label}>Phone Number:</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    disabled={!isEditing}
                                    style={styles.input(!isEditing)}
                                />
                            </div>

                            {/* Buttons */}
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" style={styles.button('#10b981')}>Save Changes</button>
                                    <button
                                        type="button"
                                        style={styles.button('#ef4444')}
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    style={styles.button('#3b82f6')}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>Your Table Bookings</h3>
                        {bookings.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#6b7280' }}>No table bookings found.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Restaurant</th>
                                            <th style={styles.th}>Date</th>
                                            <th style={styles.th}>Time</th>
                                            <th style={styles.th}>Guests</th>
                                            <th style={styles.th}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking._id}>
                                                <td style={styles.td}>{booking.restaurant?.name || 'N/A'}</td>
                                                <td style={styles.td}>{new Date(booking.date).toLocaleDateString()}</td>
                                                <td style={styles.td}>{booking.time}</td>
                                                <td style={styles.td}>{booking.guests}</td>
                                                <td style={styles.td}>
                                                    <span style={styles.status(booking.status)}>{booking.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <Message type={messageType} message={message} />
            </div>
        </div>
    );
};

export default Profile;
