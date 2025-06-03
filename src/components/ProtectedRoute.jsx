import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import UserContext from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { userData, loading } = useContext(UserContext);
  const location = useLocation();

  // Function to check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      // Decode the JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      
      // Check if token is expired
      const expiration = payload.exp * 1000; // Convert seconds to milliseconds
      return Date.now() >= expiration;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if there's an error
    }
  };

  // Check token expiration on route access
  useEffect(() => {
    if (!loading && userData) {
      if (isTokenExpired()) {
        console.log('Token expired in protected route');
        // Logout will be handled by UserContext
      }
    }
  }, [loading, userData]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If not logged in or token expired, redirect to login
  if (!userData || isTokenExpired()) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, show the protected content
  return children;
};

export default ProtectedRoute;