import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import axios from 'axios';
import '../css/MyBookings.css';

export default function MyBookings() {
  const { userData, setUser, refreshUserData } = useContext(UserContext);
  const [bookings, setBookings] = useState(userData?.bookings || []);
  const [loading, setLoading] = useState(!userData?.bookings?.length);
  const [error, setError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  // Function to load bookings
  const loadBookings = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      if (refreshUserData) {
        await refreshUserData();
      }

      if (userData && userData.bookings && Array.isArray(userData.bookings)) {
        setBookings(userData.bookings);
      } else {
        const token = localStorage.getItem('token');
        // Use the correct API endpoint
        const response = await axios.get('http://localhost:5000/booking', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          // Change: Map any pending status to confirmed
          const updatedBookings = response.data.map(booking => {
            if (booking.status && booking.status.toLowerCase() === 'pending') {
              return { ...booking, status: 'confirmed' };
            }
            return booking;
          });
          
          setBookings(updatedBookings);

          if (userData && setUser) {
            const updatedUserData = { ...userData, bookings: updatedBookings };
            setUser(updatedUserData);
          }
        }
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(true); // Load on first mount
  }, []);

  // Update bookings when userData changes
  useEffect(() => {
    if (userData?.bookings && Array.isArray(userData.bookings)) {
      // Change: Map any pending status to confirmed
      const updatedBookings = userData.bookings.map(booking => {
        if (booking.status && booking.status.toLowerCase() === 'pending') {
          return { ...booking, status: 'confirmed' };
        }
        return booking;
      });
      setBookings(updatedBookings);
    }
  }, [userData]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      // Fixed API endpoint to match your backend route
      await axios.put(
        `http://localhost:5000/booking/${bookingId}/cancel`,
        {}, // Empty body is fine for this endpoint
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      );
      setBookings(updatedBookings);

      // Update context if needed
      if (userData && userData.bookings && setUser) {
        const updatedUserData = { ...userData, bookings: updatedBookings };
        setUser(updatedUserData);
      }

      // Refresh user data to get the latest bookings
      if (refreshUserData) {
        await refreshUserData();
      }

      setCancelSuccess(`Booking #${bookingId} has been cancelled successfully.`);
      setTimeout(() => {
        setCancelSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canCancelBooking = (status) => {
    const cancellableStatuses = ['pending', 'confirmed', 'work started', 'in_progress'];
    return cancellableStatuses.includes(status?.toLowerCase() || 'pending');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Check if timeString is in HH:MM:SS format
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      let period = 'AM';
      
      let displayHour = hour;
      if (hour > 12) {
        displayHour = hour - 12;
        period = 'PM';
      } else if (hour === 12) {
        period = 'PM';
      } else if (hour === 0) {
        displayHour = 12;
      }
      
      return `${displayHour}:${minutes} ${period}`;
    }
    
    // If not in the expected format, just return as is
    return timeString;
  };

  const getCarDetails = (booking) => {
    if (booking.plate_number && booking.model) {
      return {
        plate_number: booking.plate_number,
        model: booking.model,
        color: booking.color,
        seats: booking.seats
      };
    }

    if (userData?.cars && booking.car_id) {
      const car = userData.cars.find(car => car.id === booking.car_id);
      if (car) return car;
    }

    return null;
  };

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <h2>My Bookings</h2>
        <Link to="/booking" className="new-booking-button">New Booking</Link>
      </div>

      {/* Success and error messages */}
      {cancelSuccess && <div className="booking-success">{cancelSuccess}</div>}
      {error && <div className="booking-error">{error}</div>}
      {loading && bookings.length === 0 && <div className="booking-loading">Loading your bookings...</div>}

      {/* Refresh button */}
      <div className="refresh-container">
        <button
          className="refresh-button"
          onClick={() => loadBookings(true)}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Bookings'}
        </button>
      </div>

      {bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map((booking) => {
            // Change: Map 'pending' to 'confirmed' for display
            let status = booking.status ? booking.status.toLowerCase() : 'confirmed';
            if (status === 'pending') {
              status = 'confirmed';
            }
            
            const carDetails = getCarDetails(booking);
            const serviceDisplay = booking.service_type || booking.service || 'Service';
            const subserviceDisplay = booking.special_requests || booking.subservice || '';

            return (
              <div className="booking-card" key={booking.id}>
                <div className="booking-header">
                  <h3>Booking ID: {booking.id}</h3>
                  <span className={`status ${status}`}>
                    {status === 'pending' ? 'confirmed' : (booking.status || 'confirmed')}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="booking-info">
                    <p><strong>Customer:</strong> {booking.customer_name || userData.full_name || userData.username}</p>
                    <p><strong>Email:</strong> {booking.email || userData.email}</p>
                    <p><strong>Phone:</strong> {booking.phone || userData.phone_number || 'Not provided'}</p>
                    <p><strong>Service:</strong> {serviceDisplay}</p>
                    {subserviceDisplay && <p><strong>Details:</strong> {subserviceDisplay}</p>}
                  </div>

                  {carDetails && (
                    <div className="booking-car-details">
                      <p><strong>Car Plate:</strong> {carDetails.plate_number}</p>
                      <p><strong>Model:</strong> {carDetails.model}</p>
                      <p><strong>Color:</strong> {carDetails.color}</p>
                      {carDetails.seats && <p><strong>Seats:</strong> {carDetails.seats}</p>}
                    </div>
                  )}

                  {booking.price && (
                    <div className="booking-price">
                      <p><strong>Price:</strong> ${booking.price}</p>
                    </div>
                  )}

                  <div className="booking-time">
                    <p><strong>Date:</strong> {formatDate(booking.booking_date || booking.date)}</p>
                    <p><strong>Time:</strong> {formatTime(booking.booking_time || booking.time_slot)}</p>
                    {booking.created_at && <p><strong>Created:</strong> {formatDate(booking.created_at)}</p>}
                  </div>

                  <div className="booking-status-info">
                    {/* Change: Removed separate pending message, both pending and confirmed show the same message */}
                    {(status === 'pending' || status === 'confirmed') && <p>Your booking has been confirmed. Please bring your car at the scheduled time.</p>}
                    {(status === 'in_progress' || status === 'work started') && <p>We're currently servicing your car.</p>}
                    {status === 'ready to collect' && <p>Your car is ready! You can pick it up at your convenience.</p>}
                    {(status === 'completed' || status === 'delivered') && <p>Service completed. Thank you for your business!</p>}
                    {status === 'cancelled' && <p>This booking has been cancelled.</p>}
                  </div>

                  {canCancelBooking(status) && (
                    <div className="booking-actions">
                      <button
                        className="cancel-booking-btn"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Cancel Booking'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="no-bookings">
            <p>You don't have any bookings yet.</p>
            <Link to="/booking" className="booking-link">Make your first booking</Link>
          </div>
        )
      )}
    </div>
  );
}