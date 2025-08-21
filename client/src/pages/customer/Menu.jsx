import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Message from '../../components/Message';
import backgroundImage from '/Indian-Food-Guide.jpg'; // Import the background image

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const defaultRestaurantId = '688865846837e9cb530c5319';
                const res = await api.get(`/menu/${defaultRestaurantId}`);
                setMenuItems(res.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading menu...</div>;
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                padding: '2rem',
                backgroundImage: `url(${backgroundImage})`, // Set the background image
                backgroundSize: 'cover', // Cover the entire div
                backgroundPosition: 'center', // Center the image
                backgroundAttachment: 'fixed', // Keep the background fixed while scrolling
                position: 'relative', // Needed for the overlay
            }}
        >
            {/* Optional: Overlay div for better readability */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark semi-transparent overlay
                    zIndex: 0, // Ensure overlay is behind the content
                }}
            ></div>

            <div style={{ position: 'relative', zIndex: 1 }}> {/* Content wrapper to be above overlay */}
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ffffff', // Changed text color to white for contrast
                    marginBottom: '2.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)' // Add text shadow for better readability
                }}>
                    Our Delicious Menu
                </h2>

                {error && <Message type="error" message={error} />}

                {menuItems.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#cbd5e1' }}> {/* Lighter text for contrast */}
                        No menu items available for this restaurant.
                    </p>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem',
                            maxWidth: '1200px',
                            margin: '0 auto',
                        }}
                    >
                        {menuItems.map((item) => (
                            <div
                                key={item._id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '1rem',
                                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 15px 25px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                {item.photo && (
                                    <img
                                        src={item.photo}
                                        alt={item.name}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderTopLeftRadius: '1rem',
                                            borderTopRightRadius: '1rem'
                                        }}
                                    />
                                )}
                                <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                                        {item.name}
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        {item.description}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            ₹{item.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;