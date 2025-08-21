import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Centralized API utility

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Validate token and fetch user data from backend
                    const res = await api.get('/users/profile');
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to load user from token:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data)); // Store user data
            setUser(res.data);
            navigate('/profile'); // Navigate to profile after login
        } catch (err) {
            console.error('Login failed:', err);
            throw err; // Re-throw to be caught by component
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            await api.post('/auth/register', { name, email, password, phone });
            // After registration, user needs to log in
        } catch (err) {
            console.error('Registration failed:', err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/'); // Navigate to home or login page
    };

    // Function to update user in context and local storage (e.g., after profile update)
    const updateUserInContext = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    return (
        <AuthContext.Provider value={{ user, setUser: updateUserInContext, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;