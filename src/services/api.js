import axios from 'axios';

const API_BASE_URL = "https://expense-tracker-backend-k52q.onrender.com/api";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          error.message = data.error || 'Bad Request - Please check your input';
          break;
        case 404:
          error.message = data.error || 'Resource not found';
          break;
        case 500:
          error.message = data.error || 'Server error - Please try again later';
          break;
        case 503:
          error.message = 'Service unavailable - Please check if backend is running';
          break;
        default:
          error.message = data.error || `Error ${status}: ${error.message}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout - Please check your internet connection';
      } else {
        error.message = 'Network error - Please check if backend server is running on http://localhost:5000';
      }
    } else {
      // Something else happened
      error.message = error.message || 'Unknown error occurred';
    }
    
    // Show alert for network errors
    if (error.message.includes('Network error') || error.message.includes('backend server')) {
      setTimeout(() => {
        alert(`🚨 Connection Error:\n${error.message}\n\nMake sure:\n1. Backend server is running\n2. URL: ${API_BASE_URL}\n3. No firewall blocking the connection`);
      }, 100);
    }
    
    return Promise.reject(error);
  }
);

// API methods for expenses
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  create: (expenseData) => api.post('/expenses', expenseData),
  delete: (id) => api.delete(`/expenses/${id}`),
  getAnalytics: () => api.get('/expenses/analytics'),
};

// API methods for OCR
export const ocrAPI = {
  scanReceipt: (formData) => api.post('/ocr/scan-receipt', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 seconds for file upload
  }),
  test: () => api.get('/ocr/test'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;