import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

/**
 * AuthGuard component that protects routes and validates authentication
 * Provides additional validation beyond the basic user check
 */
const AuthGuard = ({ children }) => {
  const { user, loading, validateAuth, handleAuthError } = useAuth();
  const location = useLocation();
  const [validating, setValidating] = useState(false);
  const [authValid, setAuthValid] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (loading) return; // Wait for initial auth check
      
      if (!user) {
        setAuthValid(false);
        return;
      }

      // Additional validation for protected routes
      setValidating(true);
      try {
        const isValid = await validateAuth();
        setAuthValid(isValid);
        
        if (!isValid) {
          console.log('🚨 Auth validation failed in AuthGuard');
          handleAuthError(new Error('Session validation failed'));
        }
      } catch (error) {
        console.error('❌ Auth validation error in AuthGuard:', error);
        setAuthValid(false);
        handleAuthError(error);
      } finally {
        setValidating(false);
      }
    };

    checkAuthentication();
  }, [user, loading, validateAuth, handleAuthError, location.pathname]);

  // Show loading during initial auth check
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Show loading during additional validation
  if (validating) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Validating session...
        </Typography>
      </Box>
    );
  }

  // If no user or validation failed, redirect to login
  if (!user || authValid === false) {
    console.log('🔄 AuthGuard redirecting to login - user:', !!user, 'authValid:', authValid);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If validation is still pending, show loading
  if (authValid === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Authentication is valid, render the protected content
  return children;
};

export default AuthGuard;
