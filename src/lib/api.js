import axios from 'axios';

const API_URL = '';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to handle auth token if available
api.interceptors.request.use(
  (config) => {
    // Add debug logging
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    // If there's a stored auth token, add it to headers
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    // Store auth token if provided in response
    if (response.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.token);
      }
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 errors
    if (error.response?.status === 401) {
      const isAuthMeRequest = error.config?.url?.includes('/auth/me');
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      
      // Clear stored auth token on 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
      
      // Don't redirect if we're checking auth status, logging in, or already on login page
      if (!isAuthMeRequest && !isLoginRequest && !isLoginPage) {
        console.log('401 unauthorized, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls with improved error handling
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Store token if provided
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      // Clear stored token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear token even if logout request fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
      throw error;
    }
  },
  
  getMe: () => api.get('/auth/me'),
  getStatus: () => api.get('/auth/status'),
  switchRole: (userType) => api.post('/auth/switch-role', { userType }),
};

// Products API calls
export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  uploadImages: (id, formData) => api.post(`/api/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getReviews: (id, params) => api.get(`/api/products/${id}/reviews`, { params }),
  search: (params) => api.get('/api/products/search', { params }),
  getFilters: () => api.get('/api/products/search/filters'),
};

// Categories API calls
export const categoriesAPI = {
  getAll: (params) => api.get('/api/categories', { params }),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
  uploadImage: (id, formData) => api.post(`/api/categories/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Brands API calls
export const brandsAPI = {
  getAll: (params) => api.get('/api/brands', { params }),
  getById: (id) => api.get(`/api/brands/${id}`),
  create: (data) => api.post('/api/brands', data),
  update: (id, data) => api.put(`/api/brands/${id}`, data),
  delete: (id) => api.delete(`/api/brands/${id}`),
  uploadLogo: (id, formData) => api.post(`/api/brands/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Orders API calls
export const ordersAPI = {
  getAll: (params) => api.get('/api/orders/admin/all', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  updateStatus: (id, data) => api.put(`/api/orders/${id}/status`, data),
  getStats: (params) => api.get('/api/orders/admin/stats', { params }),
};

// Users API calls
export const usersAPI = {
  getAll: (params) => api.get('/api/admin/users', { params }),
  updateStatus: (id, data) => api.put(`/api/admin/users/${id}/status`, data),
};

// Reviews API calls
export const reviewsAPI = {
  getAll: (params) => api.get('/api/admin/reviews', { params }),
  approve: (id, data) => api.put(`/api/admin/reviews/${id}/approve`, data),
  delete: (id) => api.delete(`/api/reviews/${id}`),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getStats: (params) => api.get('/api/admin/stats', { params }),
  getHealth: () => api.get('/api/admin/health'),
};

export default api;