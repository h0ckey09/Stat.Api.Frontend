import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

// Token expiration helpers
const TOKEN_EXPIRY_HOURS = 1;
const TOKEN_RENEWAL_THRESHOLD_MINUTES = 15;

const setTokenWithExpiry = (storageType, key, value) => {
  const now = new Date();
  const expiryTime = now.getTime() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000); // 1 hour from now
  
  const item = {
    token: value,
    expiry: expiryTime
  };
  
  if (storageType === 'session') {
    sessionStorage.setItem(key, JSON.stringify(item));
  } else {
    localStorage.setItem(key, JSON.stringify(item));
  }
};

const getTokenWithExpiry = (storageType, key) => {
  const itemStr = storageType === 'session' 
    ? sessionStorage.getItem(key) 
    : localStorage.getItem(key);
    
  if (!itemStr) {
    return null;
  }
  
  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    
    // Check if token is expired
    if (now > item.expiry) {
      console.log(`⏰ Token expired (${storageType}Storage)`);
      // Remove expired token
      if (storageType === 'session') {
        sessionStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
      return null;
    }
    
    // Check if token should be renewed (older than 15 minutes, or less than 45 minutes until expiry)
    const tokenAge = now - (item.expiry - (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000));
    const timeUntilExpiry = item.expiry - now;
    const renewalThreshold = TOKEN_RENEWAL_THRESHOLD_MINUTES * 60 * 1000;
    
    if (tokenAge >= renewalThreshold || timeUntilExpiry <= (45 * 60 * 1000)) {
      console.log(`🔄 Token eligible for renewal (age: ${Math.round(tokenAge / 60000)}min, until expiry: ${Math.round(timeUntilExpiry / 60000)}min)`);
      // Renew the token expiry
      setTokenWithExpiry(storageType, key, item.token);
    }
    
    return item.token;
  } catch (e) {
    // If parsing fails, it might be an old token format (plain string)
    // Treat it as expired and remove it
    console.log(`⚠️ Invalid token format in ${storageType}Storage, removing`);
    if (storageType === 'session') {
      sessionStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
    return null;
  }
};

const clearTokens = () => {
  sessionStorage.removeItem('statSessionToken');
  localStorage.removeItem('authToken');
};

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
    console.warn('🚨 handleAuthError called with:', error.message);
    console.trace('Stack trace for handleAuthError');
    
    // Special handling for server connectivity issues
    if (error.message === 'SERVER_DISCONNECTED') {
      console.error('🔴 Server disconnected - not clearing auth state to preserve session');
      // Don't clear auth data immediately for server issues
      // Let the user try to reconnect first
      setAuthProcessing(false);
      return;
    }
    
    console.warn('⚠️ Clearing auth tokens due to error:', error.message);
    
    // Clear all auth data for other errors
    clearTokens();
    
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
    if (window.location.pathname !== '/login' && error.message !== 'SERVER_DISCONNECTED') {
      console.log('🔄 Redirecting to login page');
      window.location.replace('/login');
    }
  }, []);

  // Validate current authentication
  const validateAuth = useCallback(async () => {
    try {
      console.log('🔍 validateAuth called');
      // First check for stored tokens (localStorage persists across refreshes)
      const sessionToken = getTokenWithExpiry('session', 'statSessionToken');
      const localToken = getTokenWithExpiry('local', 'authToken');
      
      if (sessionToken || localToken) {
        console.log('✅ Valid token found in storage during validation - returning true');
        return true;
      }
      
      console.log('⚠️ No valid tokens in storage, checking Auth object...');
      const authObject = window.Auth;
      
      // Check if Auth object thinks we're logged in
      if (authObject && typeof authObject.isLoggedIn === 'function') {
        const isLoggedIn = authObject.isLoggedIn();
        console.log('🔍 Auth.isLoggedIn():', isLoggedIn);
        
        if (!isLoggedIn) {
          // Auth object says not logged in, clear everything
          console.log('❌ Auth object says not logged in');
          handleAuthError(new Error('Not authenticated via Auth object'));
          return false;
        }
        
        // Try to validate with server if Auth object has validateAuth method
        if (typeof authObject.validateAuth === 'function') {
          try {
            console.log('🌐 Validating session with server...');
            const validationResult = await authObject.validateAuth();
            
            if (validationResult && validationResult.user) {
              console.log('✅ Server validation successful');
              // Don't call setUser here - let the main auth check handle it
              return true;
            } else {
              console.log('❌ Server validation failed - no user data');
              handleAuthError(new Error('Server validation failed'));
              return false;
            }
          } catch (validationError) {
            console.error('🚨 Server validation error:', validationError);
            
            // Check if this is a server connectivity issue
            if (validationError.message.includes('fetch') || 
                validationError.message.includes('NetworkError') ||
                validationError.message.includes('Failed to fetch') ||
                validationError.message.toLowerCase().includes('connection') ||
                validationError.message.includes('ECONNREFUSED') ||
                validationError.message.includes('timeout')) {
              
              console.error('🔴 SERVER CONNECTIVITY ISSUE DETECTED');
              
              // Dispatch a special server error event
              try {
                const serverErrorEvent = new CustomEvent('serverError', { 
                  detail: { 
                    type: 'connectivity',
                    message: 'Unable to connect to the authentication server. Please check your connection and try again.',
                    originalError: validationError.message
                  } 
                });
                window.dispatchEvent(serverErrorEvent);
              } catch (e) { 
                console.error('Failed to dispatch server error event:', e); 
              }
              
              handleAuthError(new Error('SERVER_DISCONNECTED'));
              return false;
            }
            
            // Other validation errors
            handleAuthError(validationError);
            return false;
          }
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
      
      // If we get here, no Auth object and no tokens found
      console.log('❌ No authentication tokens found');
      return false;
    } catch (error) {
      console.error('❌ Auth validation failed:', error);
      
      // Check for server connectivity issues in general auth validation
      if (error.message.includes('fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('Failed to fetch') ||
          error.message.toLowerCase().includes('connection') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('timeout')) {
        
        console.error('🔴 SERVER CONNECTIVITY ISSUE DETECTED IN AUTH VALIDATION');
        
        // Dispatch a special server error event
        try {
          const serverErrorEvent = new CustomEvent('serverError', { 
            detail: { 
              type: 'connectivity',
              message: 'Unable to connect to the authentication server. Please check your connection and try again.',
              originalError: error.message
            } 
          });
          window.dispatchEvent(serverErrorEvent);
        } catch (e) { 
          console.error('Failed to dispatch server error event:', e); 
        }
        
        handleAuthError(new Error('SERVER_DISCONNECTED'));
      } else {
        handleAuthError(error);
      }
      
      return false;
    }
  }, [handleAuthError]);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking auth status...');
        
        // First, check for stored tokens (prioritize persistence across reloads)
        const sessionToken = getTokenWithExpiry('session', 'statSessionToken');
        const localToken = getTokenWithExpiry('local', 'authToken');
        
        console.log('📦 Token check:', {
          sessionToken: sessionToken ? 'VALID' : 'MISSING/EXPIRED',
          localToken: localToken ? 'VALID' : 'MISSING/EXPIRED'
        });
        
        if (sessionToken || localToken) {
          console.log('✅ Found valid authentication token');
          const token = sessionToken || localToken;
          
          // Ensure both storage locations have the token with expiry
          if (sessionToken && !localToken) {
            console.log('💾 Copying sessionToken to localStorage');
            setTokenWithExpiry('local', 'authToken', sessionToken);
          } else if (localToken && !sessionToken) {
            console.log('💾 Copying localStorage to sessionToken');
            setTokenWithExpiry('session', 'statSessionToken', localToken);
          }
          
          // Set user immediately from token to avoid redirect
          console.log('✅ Setting user with token');
          setUser({ token });
          setLoading(false);
          
          // Then try to validate/enrich with Auth object in the background
          let authObject = window.Auth;
          if (!authObject) {
            console.log('⏳ Auth object not available, waiting...');
            for (let i = 0; i < 20; i++) {
              await new Promise(resolve => setTimeout(resolve, 100));
              if (window.Auth) {
                authObject = window.Auth;
                break;
              }
            }
          }
          
          // If Auth object is available, try to sync with it
          if (authObject && typeof authObject.isLoggedIn === 'function' && authObject.isLoggedIn()) {
            const authUser = authObject.getUser();
            if (authUser) {
              console.log('✅ Synced with Auth object user data');
              setUser(authUser);
            }
          } else {
            console.log('⚠️ Auth object not available or not logged in, but token exists - staying logged in');
          }
          
          console.log('✅ checkAuthStatus completed - user should be set');
          return;
        }
        
        console.log('❌ No stored tokens found at all');
        // No stored tokens, check Auth object
        console.log('🔍 No stored tokens, checking Auth object...');
        
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

        // If validation was successful and we have an Auth object, use its user data
        if (authObject && typeof authObject.isLoggedIn === 'function' && authObject.isLoggedIn()) {
          console.log('✅ User is logged in via Auth object');
          const authUser = authObject.getUser();
          console.log('👤 User data:', authUser);
          
          // Save to both storage locations with expiry
          const newSessionToken = getTokenWithExpiry('session', 'statSessionToken');
          if (newSessionToken) {
            setTokenWithExpiry('local', 'authToken', newSessionToken);
          }
          
          // Only set user if it's different from current user to prevent loops
          if (!user || JSON.stringify(user) !== JSON.stringify(authUser)) {
            setUser(authUser);
          }
        } else {
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
        
        // Also save token to storage with expiry if available
        const sessionToken = getTokenWithExpiry('session', 'statSessionToken');
        if (sessionToken) {
          setTokenWithExpiry('local', 'authToken', sessionToken);
        }
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
  }, []); // Empty dependency array - only run once on mount

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
        
        setTokenWithExpiry('local', 'authToken', token);
        setTokenWithExpiry('session', 'statSessionToken', token);
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
