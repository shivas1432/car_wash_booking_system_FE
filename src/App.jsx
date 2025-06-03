import React, { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import { UserProvider } from './context/UserContext';
import UserContext from './context/UserContext';

import App1 from "./components/app1";
import Login from "./components/Login";
import Register from "./components/Register";
import CompleteProfile from "./components/CompleteProfile";
import ResetPassword from "./components/ResetPassword";
import HomePage from "./components/HomePage";
import Booking from './components/Booking';
import MyBooking from './components/MyBookings';
import Profile from "./components/profile";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
 
import Offers from "./components/Offers";
import OpeningTimes from "./components/OpeningTimes";
import AdminDashboard from './components/AdminDashboard';
import InitAdmin from './components/InitAdmin';

import "./css/styles.css";

// Token expiration listener component
const TokenExpirationListener = () => {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenExpired = (event) => {
      console.log('Token expired event detected');
      logout();
      navigate('/login', { 
        state: { message: event.detail?.message || 'Your session has expired. Please log in again.' } 
      });
    };

    // Listen for token expiration events
    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [logout, navigate]);

  return null; // This component doesn't render anything
};

// Main content with routes
const AppContent = () => {
  return (
    <>
      <TokenExpirationListener />
      <Navbar />
      <Routes>
        {/* Make App1 the main landing page */}
        <Route path="/" element={<App1 />} />
          
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
          
        {/* HomePage for login/register buttons */}
        <Route path="/homepage" element={<HomePage />} />
          
        {/* New routes for Offers and Opening Times */}
        <Route path="/offers" element={<Offers />} />
        <Route path="/opening-times" element={<OpeningTimes />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/init-admin" element={<InitAdmin />} />
           
        {/* Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBooking />
          </ProtectedRoute>
        } />
        <Route path="/complete-profile" element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } />
          
        {/* Fallback for any other route */}
        <Route path="*" element={<App1 />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;