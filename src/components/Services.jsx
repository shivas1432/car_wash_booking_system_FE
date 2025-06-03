import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/services.css'; 



const Services = () => {
  const [activeCard, setActiveCard] = useState(null);

  const handleCardClick = (cardId) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  return (
    <section className="service-cards">
      <div className="service-container">
        <div className="service-intro">
          <h2>Services</h2>
          <p>
            Our services range from precision interior detailing to premium exterior treatments like ceramic coatings and paint correction. 
            We use high-quality, eco-friendly products and advanced techniques to restore and protect your vehicle. From removing stains and 
            odors to delivering a flawless finish, we ensure your car always looks its best. Our protective coatings enhance shine and defend 
            against dirt, UV rays, and harsh weather. Whether it's routine maintenance or a full transformation, we aim to exceed your expectations 
            with long-lasting results.
          </p>
        </div>

        <div className="service-cards-grid">
          {/* Cards Row 1 */}
          <div className="cards-row">
            <div 
              className={`service-card ${activeCard === 'fullDetail' ? 'active' : ''}`} 
              onClick={() => handleCardClick('fullDetail')}
            >
              <div className="card-icon red">FD</div>
              <h3>Full Detail (3-6 HR)</h3>
              <div className="features-container">
                <ul>
                  <li>Vacuum</li>
                  <li>Blow out crevices & gauges</li>
                  <li>Plastics wiped down & dressed</li>
                  <li>Door jams cleaned</li>
                  <li>Headliner lightly wiped</li>
                  <li>Steam clean treatment</li>
                </ul>
              </div>
            </div>

            <div 
              className={`service-card ${activeCard === 'exteriorDetailLevel1' ? 'active' : ''}`} 
              onClick={() => handleCardClick('exteriorDetailLevel1')}
            >
              <div className="card-icon green">ED</div>
              <h3>Exterior Detail Level 1</h3>
              <div className="features-container">
                <ul>
                  <li>Hand wash</li>
                  <li>3-month paint sealant</li>
                  <li>Tires cleaned & dressed</li>
                  <li>Exterior glass cleaned</li>
                </ul>
              </div>
            </div>

            <div 
              className={`service-card ${activeCard === 'interiorDetail' ? 'active' : ''}`} 
              onClick={() => handleCardClick('interiorDetail')}
            >
              <div className="card-icon blue">ID</div>
              <h3>Interior Detail (2-4 HR)</h3>
              <div className="features-container">
                <ul>
                  <li>Vacuum</li>
                  <li>Blow out crevices & gauges</li>
                  <li>Glass cleaned</li>
                  <li>Plastics wiped down & dressed</li>
                  <li>Door jams cleaned</li>
                  <li>Headliner wiped</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cards Row 2 */}
          <div className="cards-row">
            <div 
              className={`service-card ${activeCard === 'motorcycleDetailLevel1' ? 'active' : ''}`} 
              onClick={() => handleCardClick('motorcycleDetailLevel1')}
            >
              <div className="card-icon green">MD1</div>
              <h3>Motorcycle Detail Level 1</h3>
              <div className="features-container">
                <ul>
                  <li>Hand wash</li>
                  <li>3-month paint sealant</li>
                  <li>30-60 min</li>
                </ul>
              </div>
            </div>

            <div 
              className={`service-card ${activeCard === 'ceramicCoating' ? 'active' : ''}`} 
              onClick={() => handleCardClick('ceramicCoating')}
            >
              <div className="card-icon blue">CC</div>
              <h3>Ceramic Coating (1-3 Days)</h3>
              <div className="features-container">
                <ul>
                  <li>5 Yr Ceramic Coating</li>
                  <li>Price varies based on vehicle condition & color</li>
                </ul>
              </div>
            </div>

            <div 
              className={`service-card ${activeCard === 'paintCorrection1Step' ? 'active' : ''}`} 
              onClick={() => handleCardClick('paintCorrection1Step')}
            >
              <div className="card-icon red">PC</div>
              <h3>Paint Correction - 1 Step</h3>
              <div className="features-container">
                <ul>
                  <li>1-Step Paint Correction</li>
                  <li>Starting at $250</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
