import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.BACKEND_API_URL || 'http://localhost:5000';
const API_URL = BASE_URL+'/api';
console.log('API service initialized with endpoint:', API_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (Authenticated)`);
      
      // Log FormData contents for debugging
      if (config.data instanceof FormData) {
        console.log('Sending FormData with entries:');
        for (let pair of config.data.entries()) {
          const [key, value] = pair;
          if (value instanceof File) {
            console.log(`- ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
          } else {
            console.log(`- ${key}: ${value}`);
          }
        }
      } else if (config.data && typeof config.data === 'object') {
        console.log('Request payload:', config.data);
      }
    } else {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (Unauthenticated)`);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url} - Success`);
    if (response.data) {
      console.log('Response data:', response.data);
    }
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      console.error(`API Error: ${response.status} ${response.config?.url || 'unknown URL'}`, response.data);
    } else {
      console.error('API Error: Network issue or server unavailable', error);
    }
    
    if (response && response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      toast.error('Session expired. Please log in again.');
      // Optional: Redirect to login page
      // window.location.href = '/';
    }
    
    // Show error message if available
    const errorMessage = response?.data?.message || 'Something went wrong';
    if (response && response.status !== 401) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// Check API connectivity on initialization
console.log('⏳ Testing connection to backend API server...');
api.get('/health-check')
  .then((response) => {
    console.log('✅ Connected to backend API server on port 5000 successfully!', response.data);
  })
  .catch(error => {
    console.warn('⚠️ Unable to connect to backend API server:', error.message);
    console.log('Backend server may not be running. Make sure it\'s started on port 5000.');
    // Alert the user about connection issues
    toast.error('Could not connect to the backend server. Some features may not work.');
  });

export default api;