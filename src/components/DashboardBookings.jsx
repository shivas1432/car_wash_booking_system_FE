import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import '../css/dashboard.css';

const DashboardBookings = ({ handleUpdateBooking, displayStatus }) => {
  // Initialize week to start on Monday
  const getWeekStartDate = (date = new Date()) => {
    const newDate = new Date(date);
    const dayOfWeek = newDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = newDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get Monday
    return new Date(newDate.setDate(diff));
  };

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateBookings, setDateBookings] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  // Calendar navigation states
  const [calendarDates, setCalendarDates] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(new Date()));
  
  // Time slots
  const timeSlots = [
    "9:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];
  
  const [availableTimeSlots, setAvailableTimeSlots] = useState({});
  
  // Convert date string to YYYY-MM-DD format for comparison
  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Parse the date string to a Date object
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      
      // Format to YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };
  
  // Fetch all bookings - simple approach that will actually work
  const fetchAllBookings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Use the new approach - modify the file that import in server.js
      // Get all data without limitations
      const response = await api.get('/api/admin/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fix the SQL in dashboard.js or admin.js to show all bookings
      console.log("Modify the SQL in your admin summary endpoint to show all bookings");
      
      // Get the data we have
      const bookingsData = response.data.recentBookings || [];
      
      // If we received fewer bookings than the total count, show a warning
      if (response.data.counts?.bookings > bookingsData.length) {
        setError(`Only showing ${bookingsData.length} of ${response.data.counts.bookings} bookings. To fix: Remove LIMIT 5 from your SQL query in the summary endpoint.`);
      }
      
      const mappedBookings = bookingsData.map(booking => ({
        ...booking,
        status: booking.status?.toLowerCase() === 'pending' ? 'confirmed' : (booking.status || 'confirmed'),
        normalizedDate: formatDateForComparison(booking.date)
      }));
      
      setBookings(mappedBookings);
      filterBookingsByDate(mappedBookings, selectedDate);
      calculateAvailableTimeSlots(mappedBookings);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError('Failed to load bookings. Please check your connection.');
      setLoading(false);
    }
  };
  
  // Set up polling to refresh bookings data regularly (every 30 seconds)
  useEffect(() => {
    // Initial fetch
    fetchAllBookings();
    
    // Set up polling for real-time updates
    const pollingInterval = setInterval(() => {
      fetchAllBookings();
    }, 30000); // Every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(pollingInterval);
  }, []);
  
  // Calculate available time slots for each date
  const calculateAvailableTimeSlots = (allBookings) => {
    // Create a map to track available slots for each date
    const availabilityMap = {};
    
    // Get all dates from the next 30 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const formattedDate = formatDateForComparison(date);
      dates.push(formattedDate);
      
      // Initialize all slots as available for this date
      availabilityMap[formattedDate] = [...timeSlots];
    }
    
    // Mark booked slots as unavailable - but only if booking isn't cancelled
    allBookings.forEach(booking => {
      if (booking.normalizedDate && booking.time_slot && booking.status !== 'cancelled') {
        const date = booking.normalizedDate;
        if (availabilityMap[date]) {
          // Extract just the hour:minute part
          const timeSlot = booking.time_slot.split(':').slice(0, 2).join(':');
          
          // Remove booked slot from available slots
          availabilityMap[date] = availabilityMap[date].filter(slot => slot !== timeSlot);
        }
      }
    });
    
    setAvailableTimeSlots(availabilityMap);
  };
  
  // Update calendar dates
  const updateCalendarDates = (startDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    
    // Generate dates for a week
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      dates.push(date);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendarDates(dates);
  };
  
  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Get day name
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Get day number
  const getDayNumber = (date) => {
    return date.getDate();
  };
  
  // Get month name
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
    updateCalendarDates(newWeekStart);
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
    updateCalendarDates(newWeekStart);
  };
  
  // Select date
  const selectDate = (date) => {
    setSelectedDate(date);
    filterBookingsByDate(bookings, date);
  };
  
  // Is date selected
  const isDateSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };
  
  // Count bookings for a date
  const getBookingCountForDate = (date) => {
    if (!bookings || bookings.length === 0) return 0;
    
    // Format the date to YYYY-MM-DD for comparison
    const dateString = formatDateForComparison(date);
    
    // Count bookings that match this date
    const count = bookings.filter(booking => {
      return booking.normalizedDate === dateString;
    }).length;
    
    return count;
  };
  
  // Filter bookings by selected date
  const filterBookingsByDate = (allBookings, date) => {
    if (!allBookings || allBookings.length === 0) {
      console.log("No bookings to filter");
      setDateBookings([]);
      return;
    }
    
    // Format the selected date to YYYY-MM-DD for comparison
    const dateString = formatDateForComparison(date);
    console.log("Filtering for date:", dateString);
    
    // Filter bookings by normalized date
    const filtered = allBookings.filter(booking => {
      return booking.normalizedDate === dateString;
    });
    
    // Sort by time slot
    filtered.sort((a, b) => {
      if (!a.time_slot || !b.time_slot) return 0;
      
      const timeA = a.time_slot.split(':').map(Number);
      const timeB = b.time_slot.split(':').map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0]; // Sort by hour
      }
      return timeA[1] - timeB[1]; // Sort by minute
    });
    
    setDateBookings(filtered);
  };
  
  // Format time slot for display (convert 24h to 12h format)
  const formatTimeSlot = (timeSlot) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Wrapper for updating booking status
  const updateBookingStatus = async (bookingId, status) => {
    try {
      await handleUpdateBooking(bookingId, status);
      
      // Update local booking status
      setDateBookings(dateBookings.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));
      
      setUpdateSuccess(`Booking #${bookingId} updated to ${status}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
      
      // Refresh all bookings
      fetchAllBookings();
    } catch (err) {
      setError(err.message || 'Failed to update booking');
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    // Initialize calendar dates 
    updateCalendarDates(currentWeekStart);
    
    // Fetch all bookings
    fetchAllBookings();
    
    // Initialize with today's date
    const today = new Date();
    setSelectedDate(today);
  }, []);
  
  // Update date bookings when selected date changes
  useEffect(() => {
    if (bookings.length > 0) {
      filterBookingsByDate(bookings, selectedDate);
    }
  }, [selectedDate]);
  
  return (
    <div className="admin-bookings-view">
      {/* Error and success messages */}
      {error && <div className="admin-error">{error}</div>}
      {updateSuccess && <div className="admin-success">{updateSuccess}</div>}
      
      {/* Calendar */}
      <div className="admin-calendar-container">
        <div className="admin-calendar-header">
          <h2>Bookings Calendar</h2>
          <div className="admin-calendar-nav">
            <button onClick={goToPreviousWeek} className="admin-calendar-nav-btn">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="admin-calendar-month">
              {getMonthName(currentWeekStart)} {currentWeekStart.getFullYear()}
            </span>
            <button onClick={goToNextWeek} className="admin-calendar-nav-btn">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div className="admin-calendar">
          {calendarDates.map((date, index) => (
            <div 
              key={index} 
              className={`admin-calendar-day ${isDateSelected(date) ? 'selected' : ''}`}
              onClick={() => selectDate(date)}
            >
              <div className="admin-calendar-day-name">{getDayName(date)}</div>
              <div className="admin-calendar-day-number">{getDayNumber(date)}</div>
              <div className="admin-calendar-day-month">{getMonthName(date)}</div>
              <div className="admin-calendar-booking-count">
                {getBookingCountForDate(date) > 0 && (
                  <span className="admin-calendar-badge">
                    {getBookingCountForDate(date)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Available Time Slots */}
      <div className="admin-time-slots-container">
        <div className="admin-time-slots-header">
          <h2>Available Time Slots for {formatDate(selectedDate)}</h2>
        </div>
        <div className="admin-time-slots-grid">
          {timeSlots.map((timeSlot, index) => {
            const dateString = formatDateForComparison(selectedDate);
            const isAvailable = availableTimeSlots[dateString] && 
                              availableTimeSlots[dateString].includes(timeSlot);
            
            return (
              <div 
                key={index} 
                className={`admin-time-slot ${isAvailable ? 'available' : 'booked'}`}
              >
                <span className="admin-time-slot-text">{formatTimeSlot(timeSlot)}</span>
                <span className="admin-time-slot-status">
                  {isAvailable ? 'Available' : 'Booked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bookings for selected date */}
      <div className="admin-bookings-list-container">
        <div className="admin-bookings-list-header">
          <h2>Bookings for {formatDate(selectedDate)}</h2>
          <span className="admin-count-badge">{dateBookings.length}</span>
        </div>
        
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <span>Loading bookings...</span>
          </div>
        ) : (
          <div className="admin-bookings-list">
            {dateBookings.map(booking => {
              // Get the booking status for display
              const statusDisplay = displayStatus(booking.status);
              // Get the real status for button logic
              const realStatus = booking.status || 'pending';
              
              return (
                <div key={booking.id} className="admin-booking-item">
                  <div className="admin-booking-header">
                    <span className="admin-booking-id">#{booking.id}</span>
                    <span className={`admin-booking-status ${realStatus === 'pending' ? 'confirmed' : (realStatus || 'confirmed')}`}>
                      {statusDisplay}
                    </span>
                  </div>
                  
                  <div className="admin-booking-detail">
                    <span>User:</span>
                    <span>{booking.username || 'Unknown'}</span>
                  </div>
                  <div className="admin-booking-detail">
                    <span>Service:</span>
                    <span>{booking.service} - {booking.subservice}</span>
                  </div>
                  <div className="admin-booking-detail">
                    <span>Time:</span>
                    <span>{booking.time_slot}</span>
                  </div>
                  <div className="admin-booking-detail">
                    <span>Car:</span>
                    <span>{booking.model} ({booking.plate_number})</span>
                  </div>
                  <div className="admin-booking-detail">
                    <span>Price:</span>
                    <span>${booking.price}</span>
                  </div>
                  
                  {/* Status update actions */}
                  <div className="admin-booking-actions">
                    <button 
                      className={`admin-status-btn work-started ${realStatus === 'work started' ? 'active' : ''}`}
                      onClick={() => updateBookingStatus(booking.id, 'work started')}
                      disabled={realStatus === 'work started' || realStatus === 'ready to collect' || realStatus === 'delivered' || realStatus === 'cancelled'}
                    >
                      Work Started
                    </button>
                    <button 
                      className={`admin-status-btn ready ${realStatus === 'ready to collect' ? 'active' : ''}`}
                      onClick={() => updateBookingStatus(booking.id, 'ready to collect')}
                      disabled={realStatus === 'ready to collect' || realStatus === 'delivered' || realStatus === 'cancelled' || !['work started', 'confirmed', 'pending'].includes(realStatus)}
                    >
                      Ready
                    </button>
                    <button 
                      className={`admin-status-btn delivered ${realStatus === 'delivered' ? 'active' : ''}`}
                      onClick={() => updateBookingStatus(booking.id, 'delivered')}
                      disabled={realStatus === 'delivered' || realStatus === 'cancelled' || realStatus !== 'ready to collect'}
                    >
                      Delivered
                    </button>
                    <button 
                      className={`admin-status-btn cancelled ${realStatus === 'cancelled' ? 'active' : ''}`}
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      disabled={realStatus === 'delivered' || realStatus === 'cancelled'}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
            
            {dateBookings.length === 0 && !loading && (
              <div className="admin-no-data">No bookings for this date</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardBookings;