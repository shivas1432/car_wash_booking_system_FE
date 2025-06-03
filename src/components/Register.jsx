import React, { useState } from 'react';
import axios from 'axios';
import "../css/auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    address: '',
    profilePicture: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // To hold error messages

  // Function to handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if required fields are missing
    if (!formData.username || !formData.password || !formData.email || !formData.phoneNumber) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous error message

    const data = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      phone_number: formData.phoneNumber,
      address: formData.address,
      profile_picture: formData.profilePicture,
    };

    try {
      const response = await axios.post('http://localhost:5000/register', data);
      alert(response.data.message);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error registering', error.response?.data || error.message);

      // Show the error message from the backend
      setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again later.');
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="username"
            placeholder="Fullname"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="auth-input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="auth-input"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="auth-input"
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className="auth-input"
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            className="auth-input"
          />

          <input
            type="text"
            name="profilePicture"
            placeholder="Profile Picture URL"
            value={formData.profilePicture}
            onChange={handleInputChange}
            className="auth-input"
          />

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
          <p className="login-link">
  Already a user? <a href="/login">Login!</a>
</p>

        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error messages */}
      </div>
    </div>
  );
};

export default Register;
