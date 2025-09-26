import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
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