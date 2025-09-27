// Authentication utilities and helpers

// Check if user has required permissions
export function hasPermission(user, requiredPermissions) {
    if (!user || !user.userType) return false;
    
    const permissions = getUserPermissions(user.userType);
    
    if (Array.isArray(requiredPermissions)) {
      return requiredPermissions.some(permission => permissions.includes(permission));
    }
    
    return permissions.includes(requiredPermissions);
  }
  
  // Get permissions based on user type
  export function getUserPermissions(userType) {
    const permissionMap = {
      admin: [
        'users.read',
        'users.write',
        'users.delete',
        'products.read',
        'products.write',
        'products.delete',
        'categories.read',
        'categories.write',
        'categories.delete',
        'brands.read',
        'brands.write',
        'brands.delete',
        'orders.read',
        'orders.write',
        'orders.update_status',
        'reviews.read',
        'reviews.moderate',
        'analytics.read',
        'settings.read',
        'settings.write'
      ],
      seller: [
        'products.read',
        'products.write',
        'categories.read',
        'brands.read',
        'orders.read',
        'orders.update_status',
        'reviews.read',
        'analytics.read'
      ],
      customer: [
        'products.read',
        'categories.read',
        'brands.read',
        'orders.read',
        'reviews.read'
      ]
    };
  
    return permissionMap[userType] || [];
  }
  
  // Check if user can access a specific route
  export function canAccessRoute(user, route) {
    if (!user) return false;
  
    const routePermissions = {
      '/': ['products.read'], // Dashboard
      '/products': ['products.read'],
      '/products/create': ['products.write'],
      '/products/[id]/edit': ['products.write'],
      '/categories': ['categories.read'],
      '/categories/create': ['categories.write'],
      '/brands': ['brands.read'],
      '/brands/create': ['brands.write'],
      '/orders': ['orders.read'],
      '/orders/[id]': ['orders.read'],
      '/users': ['users.read'],
      '/reviews': ['reviews.read'],
      '/analytics': ['analytics.read'],
      '/settings': ['settings.read']
    };
  
    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // Allow access if no specific permissions required
  
    return hasPermission(user, requiredPermissions);
  }
  
  // Validate session and user data
  export function validateSession(user) {
    if (!user) return false;
    
    // Check if user object has required fields
    const requiredFields = ['id', 'email', 'userType'];
    for (const field of requiredFields) {
      if (!user[field]) return false;
    }
  
    // Check if user is active
    if (user.isActive === false) return false;
  
    // Check if user type is valid
    const validUserTypes = ['admin', 'seller', 'customer'];
    if (!validUserTypes.includes(user.userType)) return false;
  
    return true;
  }
  
  // Format user display name
  export function getUserDisplayName(user) {
    if (!user) return 'Unknown User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    return user.email || 'Unknown User';
  }
  
  // Get user avatar URL or fallback
  export function getUserAvatarUrl(user, fallbackUrl = null) {
    if (user?.avatar?.url) {
      return user.avatar.url;
    }
    
    if (fallbackUrl) {
      return fallbackUrl;
    }
    
    // Generate a placeholder avatar based on user initials
    return generateAvatarUrl(user);
  }
  
  // Generate placeholder avatar URL (you can use services like Gravatar, UI Avatars, etc.)
  export function generateAvatarUrl(user) {
    if (!user) return null;
    
    const name = getUserDisplayName(user);
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
      
    // Using UI Avatars service for placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=ffffff&size=128`;
  }
  
  // Check if user needs to complete profile
  export function needsProfileCompletion(user) {
    if (!user) return true;
    
    const requiredFields = ['firstName', 'lastName'];
    return requiredFields.some(field => !user[field]);
  }
  
  // Get user role display text
  export function getUserRoleText(userType) {
    const roleMap = {
      admin: 'Administrator',
      seller: 'Seller',
      customer: 'Customer'
    };
    
    return roleMap[userType] || 'Unknown';
  }
  
  // Check if user can perform bulk operations
  export function canPerformBulkOperations(user) {
    return hasPermission(user, ['products.write', 'orders.write', 'users.write']);
  }
  
  // Get user's accessible menu items
  export function getAccessibleMenuItems(user) {
    const allMenuItems = [
      {
        name: 'Dashboard',
        href: '/',
        permission: 'products.read',
        icon: 'HomeIcon'
      },
      {
        name: 'Products',
        href: '/products',
        permission: 'products.read',
        icon: 'CubeIcon'
      },
      {
        name: 'Categories',
        href: '/categories',
        permission: 'categories.read',
        icon: 'TagIcon'
      },
      {
        name: 'Brands',
        href: '/brands',
        permission: 'brands.read',
        icon: 'BuildingStorefrontIcon'
      },
      {
        name: 'Orders',
        href: '/orders',
        permission: 'orders.read',
        icon: 'ShoppingBagIcon'
      },
      {
        name: 'Users',
        href: '/users',
        permission: 'users.read',
        icon: 'UsersIcon'
      },
      {
        name: 'Reviews',
        href: '/reviews',
        permission: 'reviews.read',
        icon: 'ChatBubbleBottomCenterTextIcon'
      },
      {
        name: 'Analytics',
        href: '/analytics',
        permission: 'analytics.read',
        icon: 'ChartBarIcon'
      },
      {
        name: 'Settings',
        href: '/settings',
        permission: 'settings.read',
        icon: 'Cog6ToothIcon'
      }
    ];
  
    return allMenuItems.filter(item => hasPermission(user, item.permission));
  }
  
  // Session timeout utilities
  export function getSessionTimeoutWarning() {
    const timeout = parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000');
    const warningTime = timeout - (5 * 60 * 1000); // 5 minutes before timeout
    return warningTime;
  }
  
  export function isSessionExpiringSoon(lastActivity) {
    if (!lastActivity) return false;
    
    const now = Date.now();
    const warningTime = getSessionTimeoutWarning();
    const timeSinceActivity = now - new Date(lastActivity).getTime();
    
    return timeSinceActivity >= warningTime;
  }
  
  // Password strength validation
  export function validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Rate limiting helpers
  export function isRateLimited(attempts, maxAttempts = 5, timeWindow = 300000) {
    if (!attempts || attempts.length === 0) return false;
    
    const now = Date.now();
    const recentAttempts = attempts.filter(attempt => 
      now - new Date(attempt).getTime() < timeWindow
    );
    
    return recentAttempts.length >= maxAttempts;
  }
  
  // Security headers helper
  export function getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), location=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
  }
  
  // Cookie utilities
  export function getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000') / 1000,
      path: '/'
    };
  }