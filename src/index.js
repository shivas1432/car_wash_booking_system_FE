import React from 'react';
import ReactDOM from 'react-dom/client';  // Ensure you import from 'react-dom/client' in React 18+
import './css/styles.css';  // Make sure this is the correct path to your styles
import App from './App';

// Create a root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your application using the new API
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
