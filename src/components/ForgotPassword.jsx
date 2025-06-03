import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // To show loading spinner or disable submit button
  const [message, setMessage] = useState(''); // To show success or error messages
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous messages
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsSubmitting(true); // Start the loading process

    try {
      // Sending the request to the backend to initiate password reset
      const response = await axios.post('http://localhost:5000/forgot-password', { email });
      setIsSubmitting(false); // Reset loading state
      setMessage(response.data.message); // Show success message
    } catch (error) {
      setIsSubmitting(false); // Reset loading state
      if (error.response && error.response.data) {
        setError(error.response.data.message); // Show error message from backend
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
        </button>
      </form>

      {/* Display success message */}
      {message && <div className="success-message">{message}</div>}

      {/* Display error message */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ForgotPassword;
