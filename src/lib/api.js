import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  // Remove withCredentials since we're using JWT tokens now
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management utilities
const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },
  
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
  
  setTokens: (tokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      if (tokens.expiresIn) {
        const expiryTime = Date.now() + (tokens.expiresIn * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
    }
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    }
  },
  
  isTokenExpired: () => {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem('tokenExpiry');
      if (expiry) {
        return Date.now() > parseInt(expiry);
      }
    }
    return false;
  }
};

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    // Add Authorization header with JWT token
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor with JWT token refresh logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthMeRequest = error.config?.url?.includes('/auth/me');
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isRefreshRequest = error.config?.url?.includes('/auth/refresh');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      
      // Don't try to refresh token for these requests
      if (isAuthMeRequest || isLoginRequest || isRefreshRequest || isLoginPage) {
        TokenManager.clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenManager.getRefreshToken();
      
      if (refreshToken) {
        try {
          console.log('Attempting to refresh token...');
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: refreshToken
          });

          const { tokens } = response.data.data;
          TokenManager.setTokens(tokens);
          
          console.log('Token refreshed successfully');
          processQueue(null, tokens.accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          processQueue(refreshError, null);
          TokenManager.clearTokens();
          
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls updated for JWT
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Handle new JWT response format
      if (response.data?.success && response.data?.data?.tokens) {
        const { tokens } = response.data.data;
        TokenManager.setTokens(tokens);
        console.log('Tokens stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const token = TokenManager.getAccessToken();
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear tokens on logout
      TokenManager.clearTokens();
    }
  },
  
  refreshToken: async () => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken
      });
      
      if (response.data?.success && response.data?.data?.tokens) {
        const { tokens } = response.data.data;
        TokenManager.setTokens(tokens);
        return tokens;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      TokenManager.clearTokens();
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
  getAll: (params) => api.get('/api/admin/orders', { params }),
  getById: (id) => api.get(`/api/admin/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/api/admin/orders/${id}/status`, data),
  getStats: (params) => api.get('/api/admin/orders/stats', { params }),
};

// Users API calls
export const usersAPI = {
  getAll: (params) => api.get('/api/admin/users', { params }),
  updateStatus: (id, data) => api.put(`/api/admin/users/${id}/status`, data),
};

// Reviews API calls
export const reviewsAPI = {
  getAll: (params) => api.get('/api/admin/reviews', { params }),
  approve: (id, data) => api.patch(`/api/admin/reviews/${id}/approve`, data),
  delete: (id) => api.delete(`/api/admin/reviews/${id}`),
};

// Blog API calls
export const blogsAPI = {
  // Admin routes
  getAll: (params) => api.get('/api/admin/blog/posts', { params }),
  getById: (id) => api.get(`/api/admin/blog/posts/${id}`),
  create: (data) => api.post('/api/admin/blog/posts', data),
  update: (id, data) => api.patch(`/api/admin/blog/posts/${id}`, data),
  delete: (id) => api.delete(`/api/admin/blog/posts/${id}`),
  publish: (id) => api.post(`/api/admin/blog/posts/${id}/publish`),
  uploadImage: (id, formData) => api.post(`/api/admin/blog/posts/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Blog Categories API calls
export const blogCategoriesAPI = {
  getAll: (params) => api.get('/api/admin/blog/categories', { params }),
  getById: (id) => api.get(`/api/admin/blog/categories/${id}`),
  create: (data) => api.post('/api/admin/blog/categories', data),
  update: (id, data) => api.patch(`/api/admin/blog/categories/${id}`, data),
  delete: (id) => api.delete(`/api/admin/blog/categories/${id}`),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getStats: (params) => api.get('/api/admin/stats', { params }),
  getHealth: () => api.get('/api/admin/health'),
};

// Tags API calls
export const tagsAPI = {
  getAll: (params) => api.get('/api/admin/tags', { params }),
  getById: (id) => api.get(`/api/admin/tags/${id}`),
  create: (data) => api.post('/api/admin/tags', data),
  update: (id, data) => api.patch(`/api/admin/tags/${id}`, data),
  delete: (id) => api.delete(`/api/admin/tags/${id}`),
  getStats: () => api.get('/api/admin/tags/stats'),
};

// Coupons API calls
export const couponsAPI = {
  getAll: (params) => api.get('/api/admin/coupons', { params }),
  getById: (id) => api.get(`/api/admin/coupons/${id}`),
  create: (data) => api.post('/api/admin/coupons', data),
  update: (id, data) => api.patch(`/api/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/api/admin/coupons/${id}`),
  getStats: (id) => api.get(`/api/admin/coupons/${id}/stats`),
  validate: (code) => api.post('/api/coupons/validate', { code }),
};

// Inventory API calls
export const inventoryAPI = {
  getAll: (params) => api.get('/api/admin/inventory', { params }),
  getLowStock: (params) => api.get('/api/admin/inventory/low-stock', { params }),
  adjustStock: (data) => api.post('/api/admin/inventory/adjust', data),
  bulkAdjust: (data) => api.post('/api/admin/inventory/bulk-adjust', data),
  getMovements: (params) => api.get('/api/admin/inventory/movements', { params }),
};

// Settings API calls
export const settingsAPI = {
  getAll: () => api.get('/api/admin/settings'),
  update: (data) => api.patch('/api/admin/settings', data),
  reset: () => api.post('/api/admin/settings/reset'),
};

// Activity Logs API calls
export const activityLogsAPI = {
  getAll: (params) => api.get('/api/admin/activity-logs', { params }),
};

// Addresses API calls (for user addresses)
export const addressesAPI = {
  getAll: () => api.get('/api/addresses'),
  getById: (id) => api.get(`/api/addresses/${id}`),
  create: (data) => api.post('/api/addresses', data),
  update: (id, data) => api.patch(`/api/addresses/${id}`, data),
  delete: (id) => api.delete(`/api/addresses/${id}`),
  setDefault: (id) => api.patch(`/api/addresses/${id}/default`),
};

// Export TokenManager for use in other files if needed
export { TokenManager };

export default api;