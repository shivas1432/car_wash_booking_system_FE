import React from 'react';
import { Link } from 'react-router-dom';
import "../css/auth.css";

const HomePage = () => {
  return (
    <div className="home-page">
       
      <div className="home-buttons">
     
        <Link to="/login">
          <button className="home-btn">Login</button>
        </Link>
        <Link to="/register">
          <button className="home-btn">Register</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
