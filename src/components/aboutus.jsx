import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  
import "../css/aboutus.css";
import imgSrc1 from '../images/3.jpg'; 
import defaultReviewImg from '../images/3.jpg'; 

// Define defaultUserImg - this was missing and causing the error
const defaultUserImg = defaultReviewImg; // Using the same image as a fallback

const AboutUs = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch reviews from the backend
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/reviews');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Could not load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  // Display stars based on rating value
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <div className="about-us-container">
      {/* Featured Section */}
      <section className="featured-car">
        <div className="featured-car-content">
          <h2 className="featured-title">About Us</h2>
          <div className="car-model">
            <h3 className="car-model-name">CodeUp Academy</h3>
            <span className="car-rating">4.9</span>
            <span className="reviews-count">(1,024 reviews)</span>
          </div>
          <p className="car-description">
            At CodeUp Academy, we transform beginners into tech professionals with practical, hands-on courses. 
            From mastering React to building mobile apps and understanding cybersecurity, our training is designed 
            for real-world impact. Join thousands of learners who've changed their careers with us!
          </p>
        </div>
        <div className="featured-car-image">
          <img src={imgSrc1} alt="CodeUp Students" />
        </div>
      </section>

      {/* Car Wash Reviews Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Customers Say</h2>
        
        {loading ? (
          <div className="loading-reviews">Loading reviews...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="testimonials-grid">
            {reviews.slice(0, 3).map((review) => (
              <div className="testimonial-card" key={review.id}>
                <div className="testimonial-image">
                  <img 
                    src={review.image_url ? `http://localhost:5000${review.image_url}` : defaultReviewImg} 
                    alt="Customer"
                    onError={(e) => { e.target.src = defaultReviewImg }}
                  />
                </div>
                <div className="testimonial-content">
                  <div className="testimonial-rating">
                    <div className="stars">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <h3 className="testimonial-course">{review.service} - {review.subservice}</h3>
                  <p className="testimonial-text">
                    {review.review_text || "Great service! Very satisfied with the results."}
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img 
                        src={review.profile_picture ? `http://localhost:5000${review.profile_picture}` : defaultUserImg}
                        alt={review.display_name}
                        onError={(e) => { e.target.src = defaultUserImg }}
                      />
                    </div>
                    <div className="author-info">
                      <span className="author-name">{review.display_name}</span>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* If we have placeholder reviews when there are no real reviews yet */}
            {reviews.length === 0 && (
              <>
                <div className="testimonial-card">
                  <div className="testimonial-image">
                    <img src={defaultReviewImg} alt="Customer" />
                  </div>
                  <div className="testimonial-content">
                    <div className="testimonial-rating">
                      <div className="stars">
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                      </div>
                    </div>
                    <h3 className="testimonial-course">Full Exterior Wash & Polish</h3>
                    <p className="testimonial-text">
                      My car looks brand new! Super impressed with the detailing and shine. Staff was friendly and the service was quick.
                    </p>
                    <div className="testimonial-author">
                      <span className="author-name">Ayesha R.</span>
                      <span className="author-title">Regular Customer</span>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="testimonial-image">
                    <img src={defaultReviewImg} alt="Customer" />
                  </div>
                  <div className="testimonial-content">
                    <div className="testimonial-rating">
                      <div className="stars">
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star">★</span>
                      </div>
                    </div>
                    <h3 className="testimonial-course">Interior Vacuum & Detailing</h3>
                    <p className="testimonial-text">
                      Great attention to detail! Seats, dashboard, and floor mats all spotless. Booking was easy and fast.
                    </p>
                    <div className="testimonial-author">
                      <span className="author-name">Ravi T.</span>
                      <span className="author-title">Happy Client</span>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="testimonial-image">
                    <img src={defaultReviewImg} alt="Customer" />
                  </div>
                  <div className="testimonial-content">
                    <div className="testimonial-rating">
                      <div className="stars">
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                        <span className="star filled">★</span>
                      </div>
                    </div>
                    <h3 className="testimonial-course">Monthly Maintenance Plan</h3>
                    <p className="testimonial-text">
                      Signed up for the monthly plan. Excellent value! The team is always punctual and consistent with quality.
                    </p>
                    <div className="testimonial-author">
                      <span className="author-name">Lina M.</span>
                      <span className="author-title">Subscriber</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Add Review Button */}
        <div className="add-review-container">
          <Link to="/add-review">
            <button className="add-review-btn">Leave a Review</button>
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3 className="footer-title">Explore</h3>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/courses">Courses</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">About</h3>
            <ul className="footer-links">
              <li><Link to="/mission">Our Mission</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/stories">Student Stories</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Partners</h3>
            <ul className="footer-links">
              <li><Link to="/affiliates">Affiliates</Link></li>
              <li><Link to="/corporate">Corporate Training</Link></li>
              <li><Link to="/hire">Hire Graduates</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Legal</h3>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Use</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">© 2023 CodeUp Academy. All rights reserved.</p>
          <div className="social-icons">
            <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">f</a>
            <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer">t</a>
            <a href="https://linkedin.com" className="social-icon" target="_blank" rel="noopener noreferrer">in</a>
            <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">ig</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;