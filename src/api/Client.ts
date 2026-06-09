import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://a2-fsd-pra01-02-wed-6-30pm-alex-team-24-v893.onrender.com',
});

// Attach JWT token to every request if one is storedd
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
