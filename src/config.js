// AION Configuration - Point to local backend during development
const API_BASE = process.env.REACT_APP_API_BASE || (
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:5000'
    : 'https://aion-server.onrender.com'
);
