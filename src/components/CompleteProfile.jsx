import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const CompleteProfile = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const googleId = queryParams.get('google_id');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { google_id: googleId, phone_number: phoneNumber, address };

    try {
      const response = await axios.post('http://localhost:5000/complete-profile', data);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error completing profile', error);
      alert('Profile update failed');
    }
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default CompleteProfile;
