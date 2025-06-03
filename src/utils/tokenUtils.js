// utils/tokenUtils.js

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // Decode the JWT payload (middle part between dots)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if payload has expiration
      if (!payload.exp) return false;
      
      // Convert exp to milliseconds and compare with current time
      const expiration = payload.exp * 1000; // JWT exp is in seconds
      return Date.now() >= expiration;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if there's an error
    }
  };
  
  /**
   * Gets time remaining before token expiration in milliseconds
   * @param {string} token - The JWT token to check
   * @returns {number} Time remaining in milliseconds, 0 if expired or invalid
   */
  export const getTokenTimeRemaining = (token) => {
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return 0;
      
      const expiration = payload.exp * 1000;
      return Math.max(0, expiration - Date.now());
    } catch (error) {
      console.error('Error calculating token time remaining:', error);
      return 0;
    }
  };
  
  /**
   * Extracts user ID from token payload
   * @param {string} token - The JWT token
   * @returns {string|null} User ID or null if not present/token invalid
   */
  export const getUserIdFromToken = (token) => {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId || null;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  };