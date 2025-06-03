// config/axios.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Make sure this matches your server URL
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for sessions/cookies if used
});

// Function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Parse the JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    
    // Check expiration
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if there's an error
  }
};

// Add request interceptor to include auth token from localStorage if present
api.interceptors.request.use(
  (config) => {
    // For admin routes, use adminToken
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Check if token is expired before adding to request
      if (!isTokenExpired(token)) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('Admin token expired, not adding to request');
        localStorage.removeItem('adminToken');
      }
    }
    
    // For regular user routes, use token if adminToken is not available
    else {
      const userToken = localStorage.getItem('token');
      if (userToken && !isTokenExpired(userToken)) {
        config.headers['Authorization'] = `Bearer ${userToken}`;
      } else if (userToken && isTokenExpired(userToken)) {
        console.log('User token expired, not adding to request');
        // Don't remove token here, let the response interceptor handle logout
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Request Error:', error.response || error);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Check if error message indicates token expiration
      const errorMsg = error.response.data?.message || '';
      if (
        errorMsg.includes('expired') || 
        errorMsg.includes('invalid token') ||
        errorMsg.includes('jwt expired')
      ) {
        console.log('Token expired error detected in API response');
        
        // Create and dispatch an event for token expiration
        // This allows components to react to token expiration without direct dependency
        const tokenExpiredEvent = new CustomEvent('tokenExpired', {
          detail: { message: 'Your session has expired. Please log in again.' }
        });
        window.dispatchEvent(tokenExpiredEvent);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;