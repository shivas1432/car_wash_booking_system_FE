import React, { useState } from 'react';
import api from '../config/axios';

const InitAdmin = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  const initializeAdmin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/admin/initialize-codes', {
        setupKey: 'setup_admin_codes_123'
      });
      setResult(`Success: ${response.data.message}`);
    } catch (err) {
      setResult(`Error: ${err.response?.data?.message || err.message}`);
      console.error('Full error:', err); // Log the full error for debugging
    }
    setLoading(false);
  };
  
  return (
    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
      <h1>Initialize Admin System</h1>
      <button 
        onClick={initializeAdmin}
        disabled={loading}
        style={{padding: '10px 15px', background: '#2a69ac', color: 'white', border: 'none', cursor: 'pointer'}}
      >
        {loading ? 'Initializing...' : 'Initialize Admin Tables and Codes'}
      </button>
      {result && <div style={{marginTop: '20px', padding: '10px', border: '1px solid #ccc'}}>{result}</div>}
    </div>
  );
};

export default InitAdmin;