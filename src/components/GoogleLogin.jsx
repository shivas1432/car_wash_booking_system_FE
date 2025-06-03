import React from 'react';
import "../css/auth.css";

const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="google-login1">
      <button className="google-btn1" onClick={handleGoogleLogin}>
       <p>Login with Google</p> 
      </button>
    </div>
  );
};

export default GoogleLogin;
