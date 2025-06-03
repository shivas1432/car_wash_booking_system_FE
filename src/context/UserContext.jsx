import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create the context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user data from localStorage when app loads
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing stored user data', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Logout: Remove user data and token from localStorage
  const logout = useCallback(() => {
    setUserData(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    // Clear any axios default headers
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Check token expiration
  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Decode the token payload (middle part of JWT between dots)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if payload has expiration
      if (!payload.exp) return false;
      
      // Convert exp to milliseconds and compare with current time
      const expiration = payload.exp * 1000; // JWT exp is in seconds
      const isExpired = Date.now() >= expiration;
      
      if (isExpired) {
        console.log('Token is expired, logging out');
        logout();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if there's an error
    }
  }, [logout]);

  // Simpler manual refresh function that's more reliable
  const refreshUserData = useCallback(async () => {
    // First check if token is expired
    if (checkTokenExpiration()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await axios.get('http://localhost:5000/api/user/refresh', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        // Update local state and localStorage
        setUserData(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Only logout on 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  }, [checkTokenExpiration, logout]);

  // Set up automatic periodic refresh and token check
  useEffect(() => {
    let refreshInterval;
    let tokenCheckInterval;
    
    if (userData) {
      // Refresh user data every 30 seconds if user is logged in
      refreshInterval = setInterval(() => {
        refreshUserData();
      }, 30000); // 30 seconds
      
      // Check token expiration every 5 minutes
      tokenCheckInterval = setInterval(() => {
        checkTokenExpiration();
      }, 300000); // 5 minutes
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      if (tokenCheckInterval) clearInterval(tokenCheckInterval);
    };
  }, [userData, refreshUserData, checkTokenExpiration]);

  // Set up axios interceptor for handling token expiration errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Check if error is due to token expiration
        if (
          error.response && 
          error.response.status === 401 &&
          (error.response.data?.message?.includes('expired') || 
           error.response.data?.message?.includes('invalid token'))
        ) {
          console.log('Token expired error caught by interceptor');
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Set user data and store in localStorage
  const setUser = useCallback((data) => {
    setUserData(data);
    if (data) {
      localStorage.setItem('user', JSON.stringify(data));
    }
  }, []);

  // Update specific user data fields
  const updateUserData = useCallback((updatedFields) => {
    if (userData) {
      const updated = { ...userData, ...updatedFields };
      setUserData(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{
      userData,
      setUser,
      updateUserData,
      refreshUserData,
      logout,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;