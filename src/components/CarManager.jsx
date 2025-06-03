import React, { useState } from 'react';
import axios from 'axios';
import '../css/carmanager.css';
// Fix the API URL to match backend route structure
const API_URL = "http://localhost:5000/api";

function CarManager({ userData, refreshUserData }) {
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCar, setNewCar] = useState({
    plateNumber: '',
    model: '',
    color: '',
    seats: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [animateCar, setAnimateCar] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCar({ ...newCar, [name]: value });
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simple validation
    if (!newCar.plateNumber || !newCar.model || !newCar.color) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      // Fix the API endpoint to match the backend route
      await axios.post(
        `${API_URL}/profile/add-car`, 
        newCar, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Car added successfully');
      
      // Reset form
      setNewCar({
        plateNumber: '',
        model: '',
        color: '',
        seats: ''
      });
      
      // Close the form after successful submission
      setIsAddingCar(false);
      
      // Refresh user data to get updated cars list
      await refreshUserData();
    } catch (err) {
      console.error('Error adding car:', err);
      setError(err.response?.data?.message || 'Failed to add car');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    
    try {
      // Fix the API endpoint to match the backend route
      await axios.delete(
        `${API_URL}/profile/delete-car/${carId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Car deleted successfully');
      
      // Refresh user data to get updated cars list
      await refreshUserData();
    } catch (err) {
      console.error('Error deleting car:', err);
      setError(err.response?.data?.message || 'Failed to delete car');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset messages when toggling the form
  const toggleAddCar = () => {
    setIsAddingCar(!isAddingCar);
    setError('');
    setSuccess('');
  };

  // Function to get appropriate emoji for car based on seats
  const getCarEmoji = (seats) => {
    if (!seats) return "🚗";
    const numSeats = parseInt(seats);
    if (numSeats <= 2) return "🏎️";
    if (numSeats <= 4) return "🚗";
    if (numSeats <= 5) return "🚙";
    return "🚐";
  };

  return (
    <div className="car-manager">
      <h3>My Vehicles</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {isLoading && <div className="loading-indicator">Processing your request...</div>}
      
      {userData.cars && userData.cars.length > 0 ? (
        <div className="cars-list">
          {userData.cars.map(car => (
            <div 
              key={car.id} 
              className="car-item"
              data-seats={car.seats}
              onMouseEnter={() => setAnimateCar(car.id)}
              onMouseLeave={() => setAnimateCar(null)}
            >
              <div className="car-details">
                <p><strong>Plate:</strong> {car.plate_number}</p>
                <p><strong>Model:</strong> {car.model}</p>
                <p className="car-color">
                  <strong>Color:</strong> {car.color}
                  <span className="color-dot" style={{backgroundColor: car.color}}></span>
                </p>
                {car.seats && <p><strong>Seats:</strong> {car.seats} {getCarEmoji(car.seats)}</p>}
              </div>
              <button 
                className="delete-car-button" 
                onClick={() => handleDeleteCar(car.id)}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't added any vehicles yet.</p>
      )}
      
      {!isAddingCar ? (
        <button 
          className="add-car-button" 
          onClick={toggleAddCar}
          disabled={isLoading}
        >
          Add New Vehicle
        </button>
      ) : (
        <div className="add-car-form">
          <h4>Add New Vehicle</h4>
          <form onSubmit={handleAddCar}>
            <div className="form-group">
              <label>Plate Number*</label>
              <input
                type="text"
                name="plateNumber"
                value={newCar.plateNumber}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="E.g., ABC123"
              />
            </div>
            <div className="form-group">
              <label>Model*</label>
              <input
                type="text"
                name="model"
                value={newCar.model}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="E.g., Toyota Camry"
              />
            </div>
            <div className="form-group">
              <label>Color*</label>
              <input
                type="text"
                name="color"
                value={newCar.color}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="E.g., Blue"
              />
            </div>
            <div className="form-group">
              <label>Seats</label>
              <input
                type="number"
                name="seats"
                value={newCar.seats}
                onChange={handleInputChange}
                disabled={isLoading}
                min="1"
                max="12"
                placeholder="E.g., 5"
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Vehicle'}
              </button>
              <button 
                type="button" 
                className="cancel-button" 
                onClick={toggleAddCar}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CarManager;