import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: Handle 401 Unauthorized (Stale/Expired Sessions)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Stale or invalid session detected (401). Clearing token and redirecting to login...");
      localStorage.removeItem('token');
      // Redirect to login page if they are not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;