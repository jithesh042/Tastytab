import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Message from '../../components/Message';

const TableBookingAdmin = ({ restaurantId }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('upcoming');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        if (restaurantId) {
            fetchBookings();
        }
    }, [restaurantId, filter]);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/bookings/restaurant/${restaurantId}?filter=${filter}`);
            setBookings(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, newStatus) => {
        setMessage('');
        setMessageType('');
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            return;
        }
        try {
            await api.put(`/bookings/${bookingId}/update-status`, { status: newStatus });
            setMessage(`Booking status updated to ${newStatus} successfully!`);
            setMessageType('success');
            fetchBookings();
        } catch (err) {
            setMessage(`Error updating status: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading table bookings...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Table Bookings</h2>
            <div style={styles.filterButtons}>
                <button
                    onClick={() => setFilter('upcoming')}
                    style={filter === 'upcoming' ? styles.activeButton : styles.inactiveButton}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setFilter('past')}
                    style={filter === 'past' ? styles.activeButton : styles.inactiveButton}
                >
                    Past
                </button>
            </div>
            <Message type={messageType} message={message} />

            {bookings.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#555' }}>No {filter} bookings found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Customer</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Time</th>
                                <th style={styles.th}>Guests</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.thCenter}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id} style={styles.tableRow}>
                                    <td style={styles.td}>{booking.customer?.name || 'N/A'}</td>
                                    <td style={styles.td}>{new Date(booking.date).toLocaleDateString()}</td>
                                    <td style={styles.td}>{booking.time}</td>
                                    <td style={styles.td}>{booking.guests}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.status,
                                            ...(booking.status === 'pending' && styles.pending),
                                            ...(booking.status === 'confirmed' && styles.confirmed),
                                            ...(booking.status === 'cancelled' && styles.cancelled),
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={styles.tdCenter}>
                                        {filter === 'upcoming' && booking.status === 'pending' && (
                                            <div style={styles.actionGroup}>
                                                <button
                                                    onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                                    style={{ ...styles.actionBtn, backgroundColor: '#22c55e' }}
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                                    style={{ ...styles.actionBtn, backgroundColor: '#ef4444' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        backgroundColor: '#f7f7f7',
        borderRadius: '10px',
    },
    heading: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#1f2937',
    },
    filterButtons: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    activeButton: {
        padding: '0.5rem 1.25rem',
        borderRadius: '8px',
        backgroundColor: '#16a34a',
        color: 'white',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
    },
    inactiveButton: {
        padding: '0.5rem 1.25rem',
        borderRadius: '8px',
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        cursor: 'pointer',
    },
    table: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderCollapse: 'collapse',
        borderRadius: '10px',
        overflow: 'hidden',
    },
    tableHeader: {
        backgroundColor: '#e5e7eb',
        color: '#374151',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.875rem',
    },
    thCenter: {
        padding: '1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
    },
    tableRow: {
        borderBottom: '1px solid #e5e7eb',
    },
    td: {
        padding: '0.75rem 1rem',
        textAlign: 'left',
        fontSize: '0.875rem',
        color: '#374151',
    },
    tdCenter: {
        padding: '0.75rem 1rem',
        textAlign: 'center',
    },
    status: {
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-block',
    },
    pending: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
    },
    confirmed: {
        backgroundColor: '#bbf7d0',
        color: '#166534',
    },
    cancelled: {
        backgroundColor: '#fecaca',
        color: '#991b1b',
    },
    actionGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    actionBtn: {
        color: 'white',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
};

export default TableBookingAdmin;
