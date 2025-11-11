import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [authModule, setAuthModule] = useState(null);

  useEffect(() => {
    // Initialize Auth module and check existing session
    const initAuth = async () => {
      // Access the global Auth object from authApisV2Client.js
      if (window.Auth) {
        setAuthModule(window.Auth);
        await window.Auth.init();
        
        // Check if already logged in
        if (window.Auth.isLoggedIn()) {
          const currentUser = window.Auth.getUser();
          setUser(currentUser);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const handleAuthStateChange = (event) => {
      if (event.detail && event.detail.loggedIn) {
        setUser(event.detail.user);
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    return () => window.removeEventListener('authStateChanged', handleAuthStateChange);
  }, []);

  const login = async () => {
    try {
      if (!authModule) {
        throw new Error('Auth module not initialized');
      }
      const userData = await authModule.login();
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    if (authModule) {
      await authModule.logout();
    }
    setUser(null);
  };

  const validateAuth = async () => {
    if (!authModule) return false;
    try {
      await authModule.validateAuth();
      return true;
    } catch (error) {
      console.error('Auth validation failed:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isLoggedIn: authModule ? authModule.isLoggedIn() : false,
    validateAuth,
    authModule
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
