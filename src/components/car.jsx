import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/profile.css";

const API_CAR_URL = "http://localhost:5000/api/add-car";
const API_CAR_DELETE_URL = "http://localhost:5000/api/delete-car";

const CarManager = ({ userData, setUser }) => {
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCar, setNewCar] = useState({
    plateNumber: "",
    model: "",
    color: "",
    seats: "",
  });

  // Fetch cars after user data is loaded (e.g., after login or page refresh)
  useEffect(() => {
    if (userData && userData.id) {
      // Make sure cars are available in userData after login
      setNewCar({
        plateNumber: "",
        model: "",
        color: "",
        seats: "",
      });
    } console.log("User Data on Load: ", userData); 
  }, [userData]);

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setNewCar({ ...newCar, [name]: value });
  };

  const handleAddCar = () => {
    const token = localStorage.getItem("token");
    if (!newCar.plateNumber || !newCar.model) return;

    axios
      .post(
        API_CAR_URL,
        {
          userId: userData.id,
          ...newCar,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        const addedCar = {
          ...newCar,
          id: res.data?.id || Date.now(),
        };
        setUser({
          ...userData,
          cars: [...userData.cars, addedCar], // Add the new car to the list
        });
        setNewCar({ plateNumber: "", model: "", color: "", seats: "" });
        setIsAddingCar(false);
      })
      .catch((err) => {
        console.error("Error adding car:", err);
      });
  };

  const handleRemoveCar = (carId) => {
    const token = localStorage.getItem("token");

    axios
      .delete(`${API_CAR_DELETE_URL}/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        const updatedCars = userData.cars.filter((car) => car.id !== carId);
        setUser({ ...userData, cars: updatedCars });
      })
      .catch((error) => {
        console.error("Error deleting car:", error);
      });
  };

  return (
    <div className="car-section">
      <h3>My Vehicles</h3>
      {userData.cars.length === 0 ? (
        <div className="no-cars">
          <p>No vehicles added yet</p>
          <button onClick={() => setIsAddingCar(true)}>+ Add Vehicle</button>
        </div>
      ) : (
        <div className="car-list">
         {userData.cars.map((car) => {
  console.log("Plate number:", car.plate_number);  
  return (
    <div className="car-item" key={car.id}>
      <div className="car-info">
        <div className="car-plate">{car.plate_number}</div>
        <div className="car-details">
          <span>{car.model}</span>
          <span>{car.color}</span>
          {car.seats && <span>{car.seats} seats</span>}
        </div>
      </div>
      <button onClick={() => handleRemoveCar(car.id)}>Remove</button>
    </div>
  );
})}

        </div>
      )}

      <button onClick={() => setIsAddingCar(true)}>+ Add Another Vehicle</button>

      {isAddingCar && (
        <div className="add-car-form">
          <h3>Add Vehicle</h3>
          <form>
            <input
              type="text"
              name="plateNumber"
              value={newCar.plateNumber}
              placeholder="Plate Number"
              onChange={handleCarChange}
            />
            <input
              type="text"
              name="model"
              value={newCar.model}
              placeholder="Model"
              onChange={handleCarChange}
            />
            <input
              type="text"
              name="color"
              value={newCar.color}
              placeholder="Color"
              onChange={handleCarChange}
            />
            <input
              type="text"
              name="seats"
              value={newCar.seats}
              placeholder="Seats"
              onChange={handleCarChange}
            />
            <button type="button" onClick={handleAddCar}>
              Add Car
            </button>
            <button type="button" onClick={() => setIsAddingCar(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CarManager;
