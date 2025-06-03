import React, { useState, useContext, useEffect } from "react";
import "../css/Booking.css";
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const services = [
  { name: "Exterior Car Wash", price: 25, subservices: ["Basic Wash", "Premium Wash"] },
  { name: "Interior Detailing", price: 40, subservices: ["Vacuuming", "Deep Cleaning"] },
  { name: "Tire Shine", price: 15, subservices: ["Standard Shine", "Ultra Shine"] },
  { name: "Exhaust Tip Cleaning", price: 20, subservices: ["Basic Cleaning", "Advanced Polishing"] },
  { name: "Wiper Fluid Top-Up", price: 10, subservices: ["Standard Fluid", "Premium Fluid"] },
];

const timeSlots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];

export default function Booking() {
  const navigate = useNavigate();
  const { userData, refreshUserData } = useContext(UserContext);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubservice, setSelectedSubservice] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({});
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCarSelectionInitialized, setIsCarSelectionInitialized] = useState(false);
  const [fetchingTimeSlots, setFetchingTimeSlots] = useState(false);

  useEffect(() => {
    // Only initialize the selected car once when userData first loads
    if (userData?.cars?.length > 0 && !isCarSelectionInitialized) {
      setSelectedCar(userData.cars[0].plate_number);
      setIsCarSelectionInitialized(true);
    }
    
    // Refresh user data when component mounts
    if (refreshUserData) {
      refreshUserData().catch(err => {
        console.error("Error refreshing data on mount:", err);
      });
    }
  }, [userData, refreshUserData, isCarSelectionInitialized]);

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  // Fetch available time slots from the server
  const fetchAvailableTimeSlots = async (date) => {
    setFetchingTimeSlots(true);
    
    try {
      const response = await fetch(`http://localhost:5000/booking/available-slots?date=${date}`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch available time slots");
      }
      
      const data = await response.json();
      
      // The endpoint returns unavailable times in 24h format
      // We need to convert them to 12h format to match our timeSlots array
      const unavailableSlotsIn12h = data.unavailableTimes.map(slot => {
        return convertTo12HourFormat(slot);
      });
      
      setUnavailableTimes(unavailableSlotsIn12h);
      
      // Clear selected time if it's now unavailable
      if (selectedTime && unavailableSlotsIn12h.includes(selectedTime)) {
        setSelectedTime(null);
      }
      
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      setError("Unable to load available time slots. Please try again.");
    } finally {
      setFetchingTimeSlots(false);
    }
  };

  // Convert 24h format (HH:MM:SS) to 12h format (H:MM AM/PM)
  const convertTo12HourFormat = (time24h) => {
    if (!time24h) return null;
    
    try {
      const [hours, minutes] = time24h.split(':');
      const hour = parseInt(hours);
      
      // Determine AM/PM
      const period = hour >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      const hour12 = hour % 12 || 12;
      
      // Format as "H:MM AM/PM"
      return `${hour12}:${minutes} ${period}`;
    } catch (error) {
      console.error("Error converting time format:", error);
      return null;
    }
  };

  // Explicit handler for car selection to ensure it works properly
  const handleCarSelect = (plateNumber) => {
    console.log("Car selected:", plateNumber);
    setSelectedCar(plateNumber);
  };

  // Handle date selection
  const handleDateSelect = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    // Reset selected time when date changes
    setSelectedTime(null);
  };

  const addToCart = (service, subservice) => {
    const exists = cart.find(item => item.service.name === service.name && item.subservice === subservice);
    if (!exists) {
      setCart([...cart, { service, subservice, price: service.price }]);
    }
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const convertTo24HourFormat = (time) => {
    const [hourMinute, period] = time.split(" ");
    let [hour, minute] = hourMinute.split(":");
    if (period === "PM" && hour !== "12") hour = parseInt(hour) + 12;
    if (period === "AM" && hour === "12") hour = 0;
    return `${String(hour).padStart(2, "0")}:${minute}:00`;
  };

  const handleBooking = () => {
    if (!selectedCar || !selectedDate || !selectedService || !selectedSubservice || !selectedTime) {
      setError("Please complete all selections before booking.");
      return;
    }

    setIsLoading(true);
    setError('');
    
    const carDetails = userData.cars.find(car => car.plate_number === selectedCar);
    const formattedTime = convertTo24HourFormat(selectedTime);

    // Use both phone and phone_number fields to make sure one works
    const phoneNumber = userData.phone || userData.phone_number;

    const bookingData = {
      user_id: userData.id,
      customerName: userData.full_name || userData.username,
      email: userData.email,
      phone: phoneNumber,
      service: selectedService.name,
      subservice: selectedSubservice,
      price: selectedService.price,
      date: selectedDate,
      timeSlot: formattedTime,
      carNumber: selectedCar,
      carModel: carDetails?.model,
      carColor: carDetails?.color,
      carSeats: carDetails?.seats,
      special_requests: ""
    };

    // Log the booking data to verify the details
    console.log("Sending booking data:", bookingData);

    fetch("http://localhost:5000/booking/create", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(bookingData),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.message || 'Error creating booking');
          });
        }
        return res.json();
      })
      .then(data => {
        setIsLoading(false);
        if (data.bookingId) {
          setShowConfirmation(true);
          setConfirmationDetails({
            bookingId: data.bookingId,
            car: carDetails,
            date: selectedDate,
            time: formattedTime,
            total: totalPrice,
          });

          // Add the newly booked time to unavailable times
          setUnavailableTimes([...unavailableTimes, selectedTime]);
          setSuccess('Booking confirmed successfully!');

          // Refresh user data to update bookings list
          if (refreshUserData) {
            refreshUserData();
          }

          // Reset form after successful booking
          setSelectedCar(null);
          setSelectedDate(null);
          setSelectedService(null);
          setSelectedSubservice(null);
          setSelectedTime(null);
          setCart([]);
          
          // Redirect to My Bookings page after 3 seconds
          setTimeout(() => {
            navigate('/my-bookings');
          }, 3000);
        } else {
          setError("Error: Booking failed. Please try again.");
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error("Error booking:", error);
        setError("There was an error with the booking process: " + error.message);
      });
  };

  // Get available dates (next 14 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Format as YYYY-MM-DD for input value
      const formattedDate = date.toISOString().split('T')[0];
      dates.push(formattedDate);
    }
    
    return dates;
  };

  return (
    <div className="booking-container">
      <h2 className="heading">Book a Car Wash</h2>
      
      {/* Error and success messages */}
      {error && <div className="booking-error">{error}</div>}
      {success && <div className="booking-success">{success}</div>}
      {isLoading && <div className="booking-loading">Processing your booking...</div>}

      {/* Car Selection */}
      <div className="form-section">
        <h3 className="section-title">Select Your Car</h3>
        {userData?.cars?.length > 0 ? (
          <div className="car-options">
            {userData.cars.map(car => (
              <div 
                key={car.plate_number} 
                className={`car-option ${selectedCar === car.plate_number ? 'selected' : ''}`}
                onClick={() => handleCarSelect(car.plate_number)}
              >
                <div className="car-model">{car.model}</div>
                <div className="car-plate">{car.plate_number}</div>
                <div className="car-color">{car.color}</div>
                {car.seats && <div className="car-seats">{car.seats} seats</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-cars-message">
            <p>Please <a href="/profile" className="profile-link">add your car details</a> in your profile to continue booking.</p>
          </div>
        )}
        
        {/* Show current selection for debugging */}
        {selectedCar && (
          <div className="selected-car-info">
            <p>Selected: {selectedCar}</p>
          </div>
        )}
      </div>

      {/* Date Picker */}
      <div className="form-section date-time-section">
        <h3 className="section-title">Select Date</h3>
        <div className="date-selection">
          <select
            value={selectedDate || ""}
            onChange={handleDateSelect}
            required
          >
            <option value="">Select a date</option>
            {getAvailableDates().map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Service Selection */}
      {selectedDate && (
        <div className="form-section">
          <h3 className="section-title">Select Service</h3>
          <div className="service-options">
            {services.map((service) => (
              <div
                key={service.name}
                onClick={() => {
                  setSelectedService(service);
                  setSelectedSubservice(null);
                }}
                className={`service-option ${selectedService?.name === service.name ? "selected" : ""}`}
              >
                <div className="service-name">{service.name}</div>
                <div className="service-price">${service.price}</div>
                <div className="service-description">Click to select this service</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subservice Buttons */}
      {selectedService && (
        <div className="form-section">
          <h3 className="section-title">Select Subservice</h3>
          <div className="subservice-options">
            {selectedService.subservices.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubservice(sub);
                  addToCart(selectedService, sub);
                }}
                className={`subservice-button ${selectedSubservice === sub ? "selected" : ""}`}
              >
                {sub} <span className="subservice-price">(+${selectedService.price})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <div className="form-section">
          <h3 className="section-title">Your Cart</h3>
          <div className="cart-content">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.service.name} - {item.subservice}</span>
                  <span className="cart-item-price">${item.price}</span>
                </div>
                <button 
                  className="remove-item-button"
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="total-price">Total: ${totalPrice}</div>
          </div>
        </div>
      )}

      {/* Time Slot Selection */}
      {cart.length > 0 && selectedDate && (
        <div className="form-section">
          <h3 className="section-title">Select Time</h3>
          {fetchingTimeSlots ? (
            <div className="time-slot-loading">Loading available time slots...</div>
          ) : (
            <div className="time-slot-grid">
              {timeSlots.map((time) => {
                const isUnavailable = unavailableTimes.includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => !isUnavailable && setSelectedTime(time)}
                    disabled={isUnavailable}
                    className={`time-slot-button ${selectedTime === time ? "selected" : ""} ${isUnavailable ? "unavailable" : ""}`}
                  >
                    {isUnavailable ? `${time} (Not Available)` : time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Summary and Confirmation */}
      {selectedTime && (
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <div className="summary-section">
              <h4>Customer Information</h4>
              <p><strong>Full Name:</strong> {userData.full_name || userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Phone:</strong> {userData.phone || userData.phone_number || "Not provided"}</p>
            </div>
            
            <div className="summary-section">
              <h4>Vehicle Information</h4>
              <p><strong>Car Plate Number:</strong> {selectedCar}</p>
              {selectedCar && userData.cars && (
                <>
                  <p><strong>Car Model:</strong> {userData.cars.find(car => car.plate_number === selectedCar)?.model}</p>
                  <p><strong>Car Color:</strong> {userData.cars.find(car => car.plate_number === selectedCar)?.color}</p>
                  <p><strong>Seats:</strong> {userData.cars.find(car => car.plate_number === selectedCar)?.seats}</p>
                </>
              )}
            </div>
            
            <div className="summary-section">
              <h4>Service Information</h4>
              <p><strong>Service:</strong> {selectedService?.name}</p>
              <p><strong>Subservice:</strong> {selectedSubservice}</p>
              <p><strong>Price:</strong> ${totalPrice}</p>
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time Slot:</strong> {selectedTime}</p>
            </div>
          </div>
          
          <button 
            className="booking-submit-button"
            onClick={handleBooking}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      )}

      {/* Confirmation Message */}
      {showConfirmation && (
        <div className="confirmation-message">
          <h3>Booking Confirmed!</h3>
          <p><strong>Booking ID:</strong> {confirmationDetails.bookingId}</p>
          <p><strong>Car:</strong> {confirmationDetails.car.model} - {confirmationDetails.car.color}</p>
          <p><strong>Date:</strong> {confirmationDetails.date}</p>
          <p><strong>Time:</strong> {confirmationDetails.time}</p>
          <p><strong>Total:</strong> ${confirmationDetails.total}</p>
          <p>You will be redirected to My Bookings page shortly.</p>
        </div>
      )}
    </div>
  );
}