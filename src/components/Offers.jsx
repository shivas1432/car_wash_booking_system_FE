import React from 'react';
import '../css/offers.css';

const Offers = () => {
  return (
    <div className="offers-container">
      <div className="offers-header">
        <h1>Special Offers</h1>
        <p>Check back soon for exciting deals on our car wash services!</p>
      </div>
      
      <div className="coming-soon-container">
        <div className="coming-soon-icon">
          <i className="offer-icon">🏷️</i>
        </div>
        <h2>No Current Offers</h2>
        <p>We're working on some amazing deals for you. Please check back soon!</p>
        
        <div className="newsletter-signup">
          <h3>Get Notified About Future Offers</h3>
          <p>Sign up to our newsletter to be the first to know about upcoming promotions.</p>
          
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      
      <div className="why-choose-us">
        <h2>Why Choose Our Car Wash?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">✨</div>
            <h3>Premium Quality</h3>
            <p>We use only high-quality products to ensure your car shines like new.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">⏱️</div>
            <h3>Quick Service</h3>
            <p>Most of our services take less than 30 minutes, getting you back on the road fast.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">♻️</div>
            <h3>Eco-Friendly</h3>
            <p>Our cleaning products are environmentally friendly and safe for your vehicle.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Best Value</h3>
            <p>Competitive pricing with loyalty rewards for regular customers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;