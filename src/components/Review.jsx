import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import '../css/AddReview.css';

const AddReview = () => {
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();
  
  // States for form handling
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  // Fetch user's completed bookings
  useEffect(() => {
    if (!userData?.id) {
      navigate('/login');
      return;
    }
    
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const response = await fetch('http://localhost:5000/booking', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const allBookings = await response.json();
        
        // Filter for completed or delivered bookings only
        const completedBookings = allBookings.filter(booking => 
          booking.status === 'completed' || booking.status === 'delivered'
        );
        
        setBookings(completedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Unable to load your bookings. Please try again later.');
      } finally {
        setLoadingBookings(false);
      }
    };
    
    fetchBookings();
  }, [userData, navigate]);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBooking) {
      setError('Please select a booking to review');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('booking_id', selectedBooking);
    formData.append('rating', rating);
    formData.append('review_text', reviewText);
    if (image) {
      formData.append('image', image);
    }
    
    try {
      const response = await fetch('http://localhost:5000/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      setSuccess('Your review has been submitted successfully!');
      
      // Reset form
      setSelectedBooking('');
      setRating(5);
      setReviewText('');
      setImage(null);
      setImagePreview(null);
      
      // Redirect to about us page after 2 seconds
      setTimeout(() => {
        navigate('/about');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-review-container">
      <h2 className="add-review-title">Share Your Experience</h2>
      
      {error && <div className="review-error">{error}</div>}
      {success && <div className="review-success">{success}</div>}
      
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="booking">Select a Service to Review</label>
          {loadingBookings ? (
            <div className="loading-bookings">Loading your completed services...</div>
          ) : bookings.length > 0 ? (
            <select 
              id="booking" 
              value={selectedBooking} 
              onChange={(e) => setSelectedBooking(e.target.value)}
              required
            >
              <option value="">-- Select a completed service --</option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  {booking.service} - {booking.subservice} ({new Date(booking.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          ) : (
            <div className="no-bookings">
              You don't have any completed services to review yet.
              <button type="button" onClick={() => navigate('/booking')} className="book-service-btn">
                Book a Service
              </button>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="rating">Rating</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className={`star ${rating >= star ? 'selected' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="review">Your Review</label>
          <textarea
            id="review"
            rows="5"
            placeholder="Tell us about your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Add a Photo (Optional)</label>
          <input 
            type="file" 
            id="image" 
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button type="button" onClick={() => {
                setImage(null);
                setImagePreview(null);
              }}>
                Remove
              </button>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={loading || !selectedBooking}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default AddReview;