import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { debugInfo, user, isLoggedIn } = useAuth();

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <Paper sx={{ p: 2, minWidth: 300 }} elevation={6}>
        <Typography variant="h6" gutterBottom>
          Auth Debug
        </Typography>
        
        <Alert severity={isLoggedIn ? 'success' : 'warning'} sx={{ mb: 2 }}>
          Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}
        </Alert>

        <Typography variant="body2" gutterBottom>
          <strong>User Object:</strong> {user ? 'Present' : 'Null'}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          <strong>Window.Auth:</strong> {debugInfo.windowAuthAvailable ? 'Available' : 'Missing'}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          <strong>Session Token:</strong> {debugInfo.sessionStorageToken ? 'Present' : 'Missing'}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          <strong>Local Token:</strong> {debugInfo.localStorageToken ? 'Present' : 'Missing'}
        </Typography>

        {debugInfo.windowAuthAvailable && window.Auth && (
          <Typography variant="body2" gutterBottom>
            <strong>Auth.isLoggedIn():</strong> {window.Auth.isLoggedIn ? window.Auth.isLoggedIn() ? 'True' : 'False' : 'Method Missing'}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AuthDebug;
