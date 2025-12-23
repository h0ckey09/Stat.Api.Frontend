import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Chip, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';

const AuthDebug = () => {
  const { debugInfo, user, isLoggedIn } = useAuth();
  const [serverStatus, setServerStatus] = useState('checking');
  const [isOpen, setIsOpen] = useState(true);

  // Check server connectivity
  useEffect(() => {
    let pingInterval = 10000; // Start with 10 seconds
    let intervalId;
    let isConnected = false;

    const checkServerStatus = async () => {
      try {
        // Try to reach the API base URL
        const apiBase = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
          ? 'http://localhost:3001' 
          : '';
        
        console.log('🔍 Checking server status at:', apiBase + '/api/v1/administrative/ping');
          
        const response = await fetch(apiBase + '/api/v1/administrative/ping', { 
          method: 'POST',
          signal: AbortSignal.timeout(12000) // 12 second timeout
        });
        
        console.log('📡 Server response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Server response data:', data);
          if (data.message === 'Ok') {
            setServerStatus('online');
            
            // Once we get a successful ping, reduce frequency to 2 minutes
            if (!isConnected) {
              isConnected = true;
              pingInterval = 120000;
              clearInterval(intervalId);
              intervalId = setInterval(checkServerStatus, pingInterval);
              console.log('✅ Server online - reducing ping frequency to 2 minutes');
            }
          } else {
            setServerStatus('error');
            // If we were connected, reset to faster ping
            if (isConnected) {
              isConnected = false;
              pingInterval = 10000;
              clearInterval(intervalId);
              intervalId = setInterval(checkServerStatus, pingInterval);
              console.log('⚠️ Server error - increasing ping frequency to 10 seconds');
            }
          }
        } else {
          console.warn('⚠️ Server returned non-OK status:', response.status);
          setServerStatus('error');
          // If we were connected, reset to faster ping
          if (isConnected) {
            isConnected = false;
            pingInterval = 10000;
            clearInterval(intervalId);
            intervalId = setInterval(checkServerStatus, pingInterval);
            console.log('⚠️ Server error - increasing ping frequency to 10 seconds');
          }
        }
      } catch (error) {
        console.error('❌ Server ping check failed:', error.name, error.message);
        setServerStatus('offline');
        // If we were connected, reset to faster ping
        if (isConnected) {
          isConnected = false;
          pingInterval = 10000;
          clearInterval(intervalId);
          intervalId = setInterval(checkServerStatus, pingInterval);
          console.log('❌ Server offline - increasing ping frequency to 10 seconds');
        }
      }
    };

    // Reset timer when we receive any server response
    const handleServerResponse = () => {
      if (isConnected) {
        console.log('🔄 Server response received - resetting 2-minute ping timer');
        clearInterval(intervalId);
        intervalId = setInterval(checkServerStatus, pingInterval);
        setServerStatus('online');
      }
    };

    // Listen for server responses from API calls
    window.addEventListener('serverResponse', handleServerResponse);

    checkServerStatus();
    
    // Initial check every 10 seconds
    intervalId = setInterval(checkServerStatus, pingInterval);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('serverResponse', handleServerResponse);
    };
  }, []);

  const getServerStatusColor = () => {
    switch (serverStatus) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'error': return 'warning';
      default: return 'default';
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online': return 'Server Online';
      case 'offline': return 'Server Offline';
      case 'error': return 'Server Error';
      default: return 'Checking...';
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: isOpen ? 16 : -300, 
      zIndex: 9999,
      transition: 'right 0.3s ease-in-out'
    }}>
      {/* Toggle button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'absolute',
          left: -40,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          boxShadow: 3,
        }}
        size="small"
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </IconButton>

      <Paper sx={{ p: 2, minWidth: 300 }} elevation={6}>
        <Typography variant="h6" gutterBottom>
          Auth Debug
        </Typography>
        
        <Alert severity={isLoggedIn ? 'success' : 'warning'} sx={{ mb: 2 }}>
          Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={getServerStatusText()}
            color={getServerStatusColor()}
            size="small"
            variant="filled"
          />
        </Box>

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
