import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import Message from '../../components/Message';

const Auth = () => {
    const { login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                setMessage('Logged in successfully!');
                setMessageType('success');
            } else {
                await register(formData.name, formData.email, formData.password, formData.phone);
                setMessage('Registered successfully! Please log in.');
                setMessageType('success');
                setIsLogin(true);
            }
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    const styles = {
        wrapper: {
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f3f4f6', 
            padding: '1rem'
        },
        box: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px'
        },
        heading: {
            fontSize: '1.875rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1f2937', // gray-800
            marginBottom: '1.5rem'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        label: {
            color: '#374151', // gray-700
            fontSize: '0.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
        },
        input: {
            width: '100%',
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            color: '#374151',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db', // gray-300
            outline: 'none',
        },
        button: {
            backgroundColor: '#3b82f6', // blue-500
            color: 'white',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.3s ease'
        },
        switchText: {
            marginTop: '1rem',
            textAlign: 'center',
            color: '#4b5563' // gray-600
        },
        switchButton: {
            color: '#3b82f6',
            fontWeight: 'bold',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            outline: 'none'
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.box}>
                <h2 style={styles.heading}>{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" style={styles.label}>Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" style={styles.label}>Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={styles.label}>Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    {!isLogin && (
                        <div>
                            <label htmlFor="phone" style={styles.label}>Phone Number:</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    )}
                    <button type="submit" style={styles.button}>
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <Message type={messageType} message={message} />
                <p style={styles.switchText}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                        {isLogin ? 'Register here' : 'Login here'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;
