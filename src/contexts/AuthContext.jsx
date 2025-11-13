import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authProcessing, setAuthProcessing] = useState(false);

  // Debug user state changes
  useEffect(() => {
    console.log('👤 User state changed:', user ? 'LOGGED IN' : 'NOT LOGGED IN', user);
  }, [user]);

  // Global authentication error handler
  const handleAuthError = useCallback((error) => {
    console.warn('🚨 Authentication error detected:', error);
    
    // Clear all auth data
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('statSessionToken');
    
    // Clear user state
    setUser(null);
    setAuthProcessing(false);
    
    // Log out via Auth object if available
    if (window.Auth && typeof window.Auth.logout === 'function') {
      try {
        window.Auth.logout();
      } catch (err) {
        console.error('Error during Auth.logout():', err);
      }
    }
    
    // Redirect to login using React Router navigation
    if (window.location.pathname !== '/login') {
      console.log('🔄 Redirecting to login page');
      window.location.replace('/login');
    }
  }, []);

  // Validate current authentication
  const validateAuth = useCallback(async () => {
    try {
      const authObject = window.Auth;
      
      // Check if Auth object thinks we're logged in
      if (authObject && typeof authObject.isLoggedIn === 'function') {
        const isLoggedIn = authObject.isLoggedIn();
        console.log('🔍 Auth.isLoggedIn():', isLoggedIn);
        
        if (!isLoggedIn) {
          // Auth object says not logged in, clear everything
          handleAuthError(new Error('Not authenticated via Auth object'));
          return false;
        }
        
        // Try to get user data to validate the session
        try {
          const authUser = authObject.getUser();
          if (!authUser) {
            handleAuthError(new Error('No user data available'));
            return false;
          }
          return true;
        } catch (err) {
          console.error('Error getting user from Auth object:', err);
          handleAuthError(err);
          return false;
        }
      }
      
      // Check session/localStorage tokens
      const sessionToken = sessionStorage.getItem('statSessionToken');
      const localToken = localStorage.getItem('authToken');
      
      if (!sessionToken && !localToken) {
        console.log('❌ No authentication tokens found');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Auth validation failed:', error);
      handleAuthError(error);
      return false;
    }
  }, [handleAuthError]);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking auth status...');
        
        // Wait a bit for the Auth object to be initialized if it's not ready yet
        let authObject = window.Auth;
        if (!authObject) {
          console.log('⏳ Auth object not available, waiting...');
          // Wait up to 2 seconds for Auth to be initialized
          for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.Auth) {
              authObject = window.Auth;
              break;
            }
          }
        }

        // Validate authentication
        const isValid = await validateAuth();
        if (!isValid) {
          console.log('❌ Authentication validation failed');
          setUser(null);
          return;
        }

        if (authObject && typeof authObject.isLoggedIn === 'function' && authObject.isLoggedIn()) {
          console.log('✅ User is logged in via Auth object');
          const authUser = authObject.getUser();
          console.log('👤 User data:', authUser);
          setUser(authUser);
        } else {
          console.log('❌ Auth object says not logged in, checking storage fallbacks...');
          
          // Check sessionStorage first (used by embedded Auth)
          const sessionToken = sessionStorage.getItem('statSessionToken');
          if (sessionToken) {
            console.log('✅ Found session token in sessionStorage');
            setUser({ token: sessionToken });
            return;
          }
          
          // Fallback to localStorage token check
          const localToken = localStorage.getItem('authToken');
          if (localToken) {
            console.log('✅ Found token in localStorage');
            setUser({ token: localToken });
            return;
          }
          
          console.log('❌ No authentication found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth status check failed:', error);
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes from our Auth object
    const handleAuthStateChange = (event) => {
      console.log('🔄 Auth state changed:', event.detail);
      setAuthProcessing(false); // Stop processing when auth state changes
      
      if (event.detail.loggedIn && event.detail.user) {
        console.log('✅ Setting user from auth state change:', event.detail.user);
        setUser(event.detail.user);
      } else if (event.detail.processing) {
        // Handle processing state from embedded Auth
        setAuthProcessing(true);
      } else {
        console.log('❌ Clearing user from auth state change');
        setUser(null);
      }
    };

    // Add listener for auth state changes
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    // Add global error handler for authentication failures
    window.addEventListener('authError', (event) => {
      console.log('🚨 Global auth error event:', event.detail);
      handleAuthError(new Error(event.detail.message || 'Authentication error'));
    });
    
    // Check initial auth status
    checkAuthStatus();

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      window.removeEventListener('authError', handleAuthStateChange);
    };
  }, [validateAuth, handleAuthError]);

  const login = async (credentials) => {
    try {
      setAuthProcessing(true);
      
      // Use embedded Auth object if available, otherwise fallback to apiService
      if (window.Auth && window.Auth.login) {
        const user = await window.Auth.login();
        setUser(user);
        return { success: true };
      } else {
        // Fallback to apiService for username/password login
        const response = await apiService.login(credentials);
        const { token, user: userData } = response.data;
        
        localStorage.setItem('authToken', token);
        setUser({ token, ...userData });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.message || error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setAuthProcessing(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Use embedded Auth object logout if available
      if (window.Auth && window.Auth.logout) {
        await window.Auth.logout();
      }
      
      // Clear all tokens
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('statSessionToken');
      
      setUser(null);
      setAuthProcessing(false);
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if logout fails
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('statSessionToken');
      setUser(null);
      setAuthProcessing(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    authProcessing,
    handleAuthError,
    validateAuth,
    // Add debug info for troubleshooting
    isLoggedIn: !!user,
    debugInfo: {
      userState: user,
      windowAuthAvailable: !!window.Auth,
      sessionStorageToken: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('statSessionToken') : null,
      localStorageToken: typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
