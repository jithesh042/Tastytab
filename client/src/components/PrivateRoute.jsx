import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="text-center p-8">Loading...</div>; // Or a proper loading spinner
    }

    if (!user) {
        // Not logged in, redirect to login page
        return <Navigate to="/auth" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but unauthorized role
        return <div className="access-denied">Access Denied. You do not have permission to view this page.</div>;
    }

    return children;
};

export default PrivateRoute;