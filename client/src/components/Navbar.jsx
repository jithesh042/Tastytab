import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 750);

    // Track screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 750);
            if (window.innerWidth >= 750) setIsMobileMenuOpen(false); // close when switching to desktop
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close menu when clicking any link
    const handleLinkClick = () => {
        if (isMobile) setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Brand */}
                <Link to="/" className="navbar-brand" onClick={handleLinkClick}>Tastytab</Link>

                {/* Show Toggle button only in mobile (< 750px) */}
                {isMobile && (
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="navbar-toggle"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? (
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        ) : (
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        )}
                    </button>
                )}

                {/* Menu Drawer for mobile & inline for desktop */}
                <div className={`navbar-drawer ${!isMobile ? 'desktop' : isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="navbar-menu">
                        <li><Link to="/" className="navbar-link" onClick={handleLinkClick}>Home</Link></li>
                        <li><Link to="/table-booking" className="navbar-link" onClick={handleLinkClick}>Book Table</Link></li>

                        {user ? (
                            <>
                                {user.role === 'customer' && (
                                    <>
                                        <li><Link to="/menu" className="navbar-link" onClick={handleLinkClick}>Menu</Link></li>

                                        <li><Link to="/profile" className="navbar-link" onClick={handleLinkClick}>Profile</Link></li>
                                    </>
                                )}
                                {user.role === 'admin' && (
                                    <>
                                        <li><Link to="/admin" className="navbar-link" onClick={handleLinkClick}>Admin Dashboard</Link></li>
                                        <li><Link to="/orders" className="navbar-link" onClick={handleLinkClick}>Orders</Link></li>
                                        <li><Link to="/chef" className="navbar-link" onClick={handleLinkClick}>Chef</Link></li>
                                        {/* <li><Link to="/cashier" className="navbar-link" onClick={handleLinkClick}>Cashier</Link></li> */}
                                    </>
                                )}
                                {user.role === 'waiter' && (
                                    <li><Link to="/orders" className="navbar-link" onClick={handleLinkClick}>Orders</Link></li>
                                )}
                                {user.role === 'chef' && (
                                    <li><Link to="/chef" className="navbar-link" onClick={handleLinkClick}>Chef</Link></li>
                                )}
                                {/* {user.role === 'cashier' && (
                                    <li><Link to="/cashier" className="navbar-link" onClick={handleLinkClick}>Cashier</Link></li>
                                )} */}

                                <li>
                                    <button onClick={() => { logout(); handleLinkClick(); }} className="navbar-button logout">Logout</button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link to="/auth" className="navbar-button login" onClick={handleLinkClick}>Login / Register</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
