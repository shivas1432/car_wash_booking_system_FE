import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext";
import CarManager from './CarManager'; 
import axios from "axios";
import "../css/profile.css";

// Fix the API URL to match backend route structure
const API_URL = "http://localhost:5000/api";

function Profile() {
  const { userData, refreshUserData } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [pointAnimation, setPointAnimation] = useState(null);
  const [previousPoints, setPreviousPoints] = useState(0);
  
  // Only initialize editFormData when component mounts or when switching to edit mode
  // but not on every userData change when already in edit mode
  useEffect(() => {
    if (userData && !isEditing) {
      // Make sure we create a fresh copy of userData
      setEditFormData({ ...userData });
    }
    
    // Refresh data when component mounts to ensure we have latest
    if (userData && !isEditing) {
      refreshUserData().catch(err => {
        console.error("Error refreshing data on mount:", err);
      });
    }
  }, [userData, refreshUserData, isEditing]);

  // Track points changes to show animation
  useEffect(() => {
    if (userData && previousPoints > 0 && userData.points > previousPoints) {
      // Show point animation when points increase
      const pointsAdded = userData.points - previousPoints;
      setPointAnimation(`+${pointsAdded}`);
      
      // Clear animation after delay
      const timer = setTimeout(() => {
        setPointAnimation(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Update previous points
    if (userData && userData.points) {
      setPreviousPoints(userData.points);
    }
  }, [userData?.points, previousPoints]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    // Update the form data directly with the new value
    // Make sure we're not tied to userData when editing
    setEditFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear any existing error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Prevent the default event behavior to ensure the change stays
    e.preventDefault();
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setFieldErrors({});

    try {
      const token = localStorage.getItem("token");
      // Fix the API endpoint to match with backend
      await axios.put(`${API_URL}/profile`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Refresh user data after successful update
      await refreshUserData();
    } catch (error) {
      console.error("Error updating profile", error);
      
      // Handle specific field errors from backend
      if (error.response?.data?.duplicateFields) {
        const newFieldErrors = {};
        error.response.data.duplicateFields.forEach(field => {
          newFieldErrors[field] = `This ${field} is already in use`;
        });
        setFieldErrors(newFieldErrors);
      }
      
      setStatusMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // If userData is null or not loaded, show loading message
  if (!userData) {
    return <div className="loading-container">Loading user data...</div>;
  }

  // Determine loyalty status based on points
  const getLoyaltyStatus = (points) => {
    if (points >= 100) {
      return {
        status: "Gold Member",
        discount: "10%",
        tier: "gold"
      };
    } else if (points >= 50) {
      return {
        status: "Silver Member",
        discount: "5%",
        tier: "silver"
      };
    }
    return null;
  };

  const loyaltyStatus = getLoyaltyStatus(userData.points || 0);

  return (
    <div className="profile-container">
      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}
      
      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-header">
            <Link to="/" className="back-button">
              Back
            </Link>
            <h1>My Profile</h1>
            <button 
              className="edit-button" 
              onClick={() => {
                // Set the edit form data to the current userData when starting to edit
                setEditFormData({ ...userData });
                setIsEditing(true);
                // Clear any existing field errors and status messages
                setFieldErrors({});
                setStatusMessage(null);
              }}
              disabled={isLoading}
            >
              Edit
            </button>
          </div>

          <div className="profile-picture-container">
            {userData.profilePicture ? (
              <img
                src={userData.profilePicture}
                alt="Profile"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                {userData.username?.charAt(0)}
              </div>
            )}
            <h2>{userData.full_name || userData.username || "User"}</h2>
          </div>

          <div className="profile-details">
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Phone:</strong> {userData.phone || userData.phone_number || "Not provided"}
            </p>
            <p>
              <strong>Address:</strong> {userData.address || "Not provided"}
            </p>
            <p>
              <strong>Points:</strong> {userData.points || 0}
              {pointAnimation && <span className="point-increment">{pointAnimation}</span>}
            </p>
            {loyaltyStatus && (
              <div className="loyalty-status" data-tier={loyaltyStatus.tier}>
                <p><strong>Loyalty Status:</strong> {loyaltyStatus.status}</p>
                <p>You get {loyaltyStatus.discount} discount on all services!</p>
              </div>
            )}
          </div>

          {/* Pass refreshUserData to CarManager */}
          <CarManager userData={userData} refreshUserData={refreshUserData} />
        </div>
      ) : (
        <div className="profile-edit">
          <div className="profile-header">
            <h1>Edit Profile</h1>
            <div>
              <button 
                className="cancel-button" 
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original userData when canceling
                  setEditFormData({ ...userData });
                  // Clear any field errors
                  setFieldErrors({});
                  setStatusMessage(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          
          <form className="profile-form" onSubmit={(e) => {
            // Prevent the default form submission
            e.preventDefault();
            handleSaveChanges();
          }}>
            <div className={`form-group ${fieldErrors.username ? 'has-error' : ''}`}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={editFormData.username || ""}
                onChange={handleEditChange}
                disabled={isLoading}
              />
              {fieldErrors.username && (
                <div className="field-error-message">{fieldErrors.username}</div>
              )}
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                value={editFormData.full_name || ""}
                onChange={handleEditChange}
                disabled={isLoading}
              />
            </div>
            <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editFormData.email || ""}
                onChange={handleEditChange}
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <div className="field-error-message">{fieldErrors.email}</div>
              )}
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={editFormData.phone || editFormData.phone_number || ""}
                onChange={handleEditChange}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={editFormData.address || ""}
                onChange={handleEditChange}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Profile Picture</label>
              <input
                type="file"
                name="profilePicture"
                onChange={handleProfilePictureChange}
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;