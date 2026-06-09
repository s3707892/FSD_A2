import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://fsd-a2-6gnarblof-cory-s-projects7.vercel.app',
});

// Attach JWT token to every request if one is stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
