import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import Booking from '../components/Booking';
import Profile from '../components/profile';
import Services from './Services';
import Contact from './contact';
import Aboutus from './aboutus';
import UserContext from "../context/UserContext";
import "../css/global.css";
import imgSrc from '../images/2.png';

function App1() {
  const { userData } = useContext(UserContext); // 👈 Access user context
  const [lightOpacity, setLightOpacity] = useState([0.4, 0.4, 0.4]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();

  // Light animation
  useEffect(() => {
    const animateLights = () => {
      setLightOpacity(prev => prev.map((_, index) => index === 0 ? 0.8 : 0.4));
    };
    animateLights();
    const interval = setInterval(animateLights, 3000);
    return () => clearInterval(interval);
  }, []);

  // Time & greeting update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const hour = now.getHours();

      let timeGreeting = "Hello";
      if (hour < 12) timeGreeting = "Good Morning";
      else if (hour < 18) timeGreeting = "Good Afternoon";
      else timeGreeting = "Good Evening";

      const name = userData?.full_name || userData?.username || "";
      setGreeting(`${timeGreeting}${name ? `, ${name}` : ""}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [userData]);

  const day = currentTime.toLocaleDateString(undefined, { weekday: 'long' });
  const date = currentTime.toLocaleDateString();
  const time = currentTime.toLocaleTimeString();

  const handleBookNowClick = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/bookings" : "/HomePage");
  };

  return (
    <div>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings" element={<Booking />} />
        <Route path="/" element={
          <section className="hero">
            <div className="bg-blue-gradient"></div>
            <div className="bg-light bg-light-1" style={{ opacity: lightOpacity[0] }}></div>
            <div className="bg-light bg-light-2" style={{ opacity: lightOpacity[1] }}></div>
            <div className="bg-light bg-light-3" style={{ opacity: lightOpacity[2] }}></div>
            <div className="hero-content">
              <div className="hero-text">
                {/* Personalized greeting */}
                <div className="time-display">
                  <h2>{greeting}</h2>
                  <p>{day}, {date}</p>
                  <p>{time}</p>
                </div>

                <h1>Design is in your molecular Wash.</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique Suspendisse varius but care of your car brands.</p>

                <button onClick={handleBookNowClick} className="book-now-btn hero-book-now">
                  Book Now
                </button>
              </div>
              <img src={imgSrc} alt="Car Wash" className="hero-car" />
            </div>

            <Services />
            <Contact /><br />
            <Aboutus />
          </section>
        } />
      </Routes>
    </div>
  );
}

export default App1;
