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
  initialized: false // Add this to track if initial auth check is complete
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
      
      // Try to get current user
      const response = await authAPI.getMe();
      
      console.log('Auth check response:', response.data); // Debug log
      
      if (response.data?.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      } else if (response.data?.success && response.data?.data?.user) {
        // Handle different response structure
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data.user });
      } else {
        // No user found, but request was successful
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    } catch (error) {
      console.log('Auth check failed:', error.response?.status, error.message);
      
      // Only set error if it's not a 401 (unauthorized)
      // 401 just means user is not logged in
      if (error.response?.status !== 401) {
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
      const response = await authAPI.login(credentials);
      
      console.log('Login response:', response.data); // Debug log
      
      if (response.data?.success && response.data?.data?.user) {
        const user = response.data.data.user;
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        return { success: true, user };
      } else if (response.data?.user) {
        // Handle different response structure
        const user = response.data.user;
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        return { success: true, user };
      } else {
        throw new Error('Login failed - Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const switchRole = async (userType) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authAPI.switchRole(userType);
      if (response.data?.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        return { success: true };
      } else if (response.data?.data?.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data.user });
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Role switch failed';
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