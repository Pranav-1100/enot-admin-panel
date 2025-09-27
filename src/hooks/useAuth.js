import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '@/lib/api';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  SET_INITIALIZED: 'SET_INITIALIZED'
};

// Auth Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    case AUTH_ACTIONS.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        loading: false, 
        error: null, 
        isAuthenticated: !!action.payload,
        initialized: true 
      };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false, initialized: true };
    case AUTH_ACTIONS.LOGOUT:
      return { 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: null, 
        initialized: true 
      };
    case AUTH_ACTIONS.SET_INITIALIZED:
      return { ...state, initialized: true, loading: false };
    default:
      return state;
  }
}

// Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      console.log('Checking authentication status...');
      
      // Add small delay to ensure any pending authentication is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await authAPI.getMe();
      
      console.log('Auth check response:', response.data);
      
      // Handle different possible response structures
      let user = null;
      if (response.data?.user) {
        user = response.data.user;
      } else if (response.data?.success && response.data?.data?.user) {
        user = response.data.data.user;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        user = response.data.data;
      }
      
      if (user) {
        console.log('User authenticated:', user);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      } else {
        console.log('No user found in response');
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    } catch (error) {
      console.log('Auth check failed:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url
      });
      
      // Only set error if it's not a 401 (unauthorized) or network error
      if (error.response?.status !== 401 && !error.message.includes('Network Error')) {
        console.error('Auth check error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Authentication check failed' });
      } else {
        // User is not authenticated, but that's not an error
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      console.log('Attempting login for:', credentials.email);
      
      const response = await authAPI.login(credentials);
      
      console.log('Login response:', response.data);
      
      // Handle different possible response structures
      let user = null;
      if (response.data?.success && response.data?.data?.user) {
        user = response.data.data.user;
      } else if (response.data?.user) {
        user = response.data.user;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        user = response.data.data;
      }
      
      if (user) {
        console.log('Login successful for user:', user);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        
        // Small delay to ensure state is updated before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { success: true, user };
      } else {
        throw new Error('Login failed - Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Login failed';
      
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
    
    // Clear any stored tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const switchRole = async (userType) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authAPI.switchRole(userType);
      
      let user = null;
      if (response.data?.user) {
        user = response.data.user;
      } else if (response.data?.data?.user) {
        user = response.data.data.user;
      }
      
      if (user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        return { success: true };
      } else {
        throw new Error('Role switch failed - Invalid response');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          'Role switch failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      switchRole,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}