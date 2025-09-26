import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '@/lib/api';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT'
};

// Auth Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, loading: false, error: null, isAuthenticated: !!action.payload };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AUTH_ACTIONS.LOGOUT:
      return { user: null, isAuthenticated: false, loading: false, error: null };
    default:
      return state;
  }
}

// Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
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
      const response = await authAPI.getMe();
      if (response.data?.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authAPI.login(credentials);
      
      if (response.data?.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        return { success: true };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
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