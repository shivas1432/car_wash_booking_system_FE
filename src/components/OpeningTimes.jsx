import React, { useState, useEffect } from 'react';
import '../css/OpeningTimes.css';

const OpeningTimes = () => {
  const [currentDay, setCurrentDay] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  // Define opening hours
  const openingHours = [
    { day: 'Monday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Tuesday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Wednesday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Thursday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Friday', hours: '8:00 AM - 7:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' }
  ];
  
  useEffect(() => {
    // Get current day and check if we're open
    const updateDateTime = () => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[now.getDay()];
      setCurrentDay(dayOfWeek);
      
      // Format current time
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Hour '0' should be '12'
      const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
      setCurrentTime(formattedTime);
      
      // Check if currently open
      const currentHours = openingHours.find(h => h.day === dayOfWeek)?.hours;
      if (currentHours) {
        const [openTime, closeTime] = currentHours.split(' - ');
        
        // Convert to 24-hour format for comparison
        const convertTo24Hour = (timeStr) => {
          const [time, period] = timeStr.split(' ');
          let [hour, minute] = time.split(':').map(Number);
          
          if (period === 'PM' && hour !== 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;
          
          return hour * 60 + minute; // Return minutes since midnight
        };
        
        const openMinutes = convertTo24Hour(openTime);
        const closeMinutes = convertTo24Hour(closeTime);
        const currentMinutes = hours * 60 + minutes;
        
        setIsOpen(currentMinutes >= openMinutes && currentMinutes < closeMinutes);
      } else {
        setIsOpen(false);
      }
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="opening-times-container">
      <div className="opening-times-header">
        <h1>Opening Times</h1>
        <div className={`current-status ${isOpen ? 'open' : 'closed'}`}>
          {isOpen ? 'We\'re Open Now' : 'Currently Closed'}
          <span className="status-time">{currentTime}</span>
        </div>
      </div>
      
      <div className="opening-times-card">
        <div className="hours-grid">
          {openingHours.map((item) => (
            <div 
              key={item.day} 
              className={`day-row ${item.day === currentDay ? 'current-day' : ''}`}
            >
              <div className="day-name">{item.day}</div>
              <div className="day-hours">{item.hours}</div>
            </div>
          ))}
        </div>
        
        <div className="special-notice">
          <h3>Holiday Hours</h3>
          <p>We may operate with special hours during holidays. Please check our social media for announcements about holiday hours.</p>
        </div>
      </div>
      
      <div className="location-section">
        <h2>Our Location</h2>
        <div className="location-card">
          <div className="location-details">
            <p><strong>Address:</strong> 123 Main Street, Cityville, State 12345</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Email:</strong> info@celticalcarwash.com</p>
          </div>
          <div className="map-placeholder">
            <div className="map-overlay">
              <p>Map loading...</p>
              <button className="directions-button">Get Directions</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpeningTimes;