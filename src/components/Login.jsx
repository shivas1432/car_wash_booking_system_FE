import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import GoogleLogin from './GoogleLogin';
import ForgotPassword from './ForgotPassword';
import "../css/auth.css";
import { useNavigate, useLocation } from 'react-router-dom';

import UserContext from '../context/UserContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return path if any, default to main page
  const from = location.state?.from || '/';
  
  const { setUser } = useContext(UserContext);
  
  // Check for token expiration message or other messages
  useEffect(() => {
    // If we have a session expired message from redirect
    if (location.state?.message) {
      setErrorMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    const data = { username: username.toLowerCase(), password };
    
    try {
      const response = await axios.post('http://localhost:5000/login', data, {
        withCredentials: true
      });
      
      console.log('Login successful:', response.data);
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Update user context
      setUser(user);
      
      // Navigate to the page they were trying to access, or the main page
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Error logging in', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Login failed. Please check your credentials and try again.');
      }
      setIsSubmitting(false);
    }
  };
  
  const handleForgotPasswordSubmit = async (email) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/forgot-password', { email });
      alert(response.data.message);
      setIsForgotPassword(false);
    } catch (error) {
      console.error('Error sending reset email', error);
      alert('Error: ' + (error.response?.data?.message || 'Unknown error'));
    }
    setIsSubmitting(false);
  };
  
  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Login</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {!isForgotPassword ? (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Fullname or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
            <p className="forgot-password-link">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                setIsForgotPassword(true);
              }}>Forgot Password?</a>
            </p>
            <p className="register-link">
              Don't have an account? <a href="/register">Register!</a>
            </p>
          </form>
        ) : (
          <ForgotPassword onSubmit={handleForgotPasswordSubmit} isSubmitting={isSubmitting} />
        )}
        <GoogleLogin />
      </div>
    </div>
  );
};

export default Login;