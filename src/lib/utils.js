// Tailwind CSS class name merger
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  
  // Format currency
  export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Assuming amount is in cents
  }
  
  // Format date
  export function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }
  
  // Format relative time
  export function formatRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];
  
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }
  
    return 'just now';
  }
  
  // Capitalize first letter
  export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // Generate slug from string
  export function generateSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Validate email
  export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Truncate text
  export function truncate(str, length = 100) {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  }
  
  // Debounce function
  export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Get status badge color
  export function getStatusColor(status) {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
  
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
  
  // Handle API errors
  export function handleAPIError(error) {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
  
    if (error.message) {
      return error.message;
    }
  
    return 'Something went wrong';
  }
  
  // File upload validation
  export function validateFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    } = options;
  
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
  
    if (!allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }
  
    return null;
  }
  
  // Parse query params - removes empty strings and undefined values
  export function parseQueryParams(query) {
    const params = {};

    Object.keys(query).forEach(key => {
      const value = query[key];
      // Only include non-empty values
      if (value !== '' && value !== null && value !== undefined && value !== 'undefined') {
        params[key] = value;
      }
    });

    return params;
  }

  // Clean params for API calls - removes empty strings, converts booleans
  export function cleanApiParams(params) {
    const cleaned = {};

    Object.keys(params).forEach(key => {
      const value = params[key];

      // Skip empty strings, null, undefined
      if (value === '' || value === null || value === undefined || value === 'undefined') {
        return;
      }

      // Convert string booleans to actual booleans
      if (value === 'true') {
        cleaned[key] = true;
      } else if (value === 'false') {
        cleaned[key] = false;
      } else {
        cleaned[key] = value;
      }
    });

    return cleaned;
  }
  
  // Format file size
  export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Normalize API response to handle inconsistent backend response structures
   * Handles multiple possible response formats:
   * - response.data.data
   * - response.data.items
   * - response.data.products/blogs/etc
   * - response.data directly
   *
   * @param {Object} response - Axios response object
   * @param {String} dataKey - Optional key to look for (e.g., 'products', 'blogs')
   * @returns {Object} - Normalized data with items and pagination
   */
  export function normalizeApiResponse(response, dataKey = null) {
    const responseData = response.data;

    // Try different possible data locations
    let items = null;
    let pagination = null;

    // Check for nested data.data structure
    if (responseData.data) {
      if (Array.isArray(responseData.data)) {
        items = responseData.data;
      } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
        items = responseData.data.data;
        pagination = responseData.data.pagination;
      } else if (dataKey && responseData.data[dataKey]) {
        items = responseData.data[dataKey];
      } else if (responseData.data.items) {
        items = responseData.data.items;
      } else {
        // If data is an object with a specific key
        items = responseData.data;
      }
    }

    // Check for direct key (products, blogs, etc)
    if (!items && dataKey && responseData[dataKey]) {
      items = responseData[dataKey];
    }

    // Check for items key
    if (!items && responseData.items) {
      items = responseData.items;
    }

    // Fallback to responseData itself if it's an array
    if (!items && Array.isArray(responseData)) {
      items = responseData;
    }

    // Get pagination info
    if (!pagination) {
      pagination = responseData.pagination || responseData.data?.pagination || {
        totalItems: items?.length || 0,
        totalPages: 1,
        currentPage: 1,
        limit: items?.length || 20
      };
    }

    return {
      items: items || [],
      pagination: pagination
    };
  }