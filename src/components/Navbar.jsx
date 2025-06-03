import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from '../context/UserContext';
import "../css/global.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { userData, logout } = useContext(UserContext);
  
  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate("/"); // Redirect to main landing page (App1)
  };
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nav-container")) setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  
  return (
    <header>
      <div className="nav-container">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-circle">
            <div className="logo-inner-circle"></div>
          </div>
       AQUAWASH
        </div>
        
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          {/* Show profile-related links only when logged in */}
          {userData ? (
            <>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/booking">Book Now</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
            </>
          ) : null}
          
         
          <li><Link to="/offers">Offers</Link></li>
          <li><Link to="/opening-times">Opening Times</Link></li>
          
          {/* Show Login/Logout links based on userData */}
          {userData ? (
            <li><button onClick={handleLogout}>Logout</button></li>
          ) : (
            <li><Link to="/homepage">Login/Register</Link></li>
          )}
        </ul>
        
        <div className="menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;