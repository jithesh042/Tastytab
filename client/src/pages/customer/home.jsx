import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import AuthContext from '../../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const videos = [
        '/CHICKEN .mp4', // Make sure these paths are correct relative to your public folder
        '/Food Showreel .mp4',
        '/Orika Spices.mp4',
        '/STEAK .mp4',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
        }, 8000); // Change video every 8 seconds (adjust as needed)

        return () => clearInterval(interval);
    }, [videos.length]);

    return (
        <div className="home-container">
            <div className="video-background">
                {videos.map((video, index) => (
                    <video
                        key={index}
                        src={video}
                        autoPlay
                        loop
                        muted
                        className={index === currentVideoIndex ? 'active' : ''}
                    >
                        Your browser does not support the video tag.
                    </video>
                ))}
            </div>

            <div className="home-content">
                <h1 className="home-title">Welcome to Tastytab!</h1>
                <p className="home-description">
                    Experience the freshest ingredients and delightful flavors in every dish.
                    From our signature burgers to exquisite desserts, we promise a culinary journey
                    that will tantalize your taste buds. Book a table or explore our menu today!
                </p>
                <div className="home-buttons">
                    {user?.role === 'customer' && (
                        <div>
                            <Link to="/menu" className="btn menu-btn">
                                View Our Menu
                            </Link>
                            <Link to="/table-booking" className="btn booking-btn">
                                Book a Table
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;