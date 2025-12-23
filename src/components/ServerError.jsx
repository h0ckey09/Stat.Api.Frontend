import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ServerError = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    const handleServerError = (event) => {
      console.log('🚨 ServerError component received server error:', event.detail);
      setErrorDetails(event.detail);
      setIsOpen(true);
    };

    // Listen for server error events
    window.addEventListener('serverError', handleServerError);

    return () => {
      window.removeEventListener('serverError', handleServerError);
    };
  }, []);

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1);
    setIsOpen(false);
    
    // Reload the page to retry authentication
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const getErrorMessage = () => {
    if (!errorDetails) return 'Unknown server error occurred.';
    
    if (errorDetails.type === 'connectivity') {
      return errorDetails.message || 'Unable to connect to the server. Please check your connection and try again.';
    }
    
    return errorDetails.message || 'A server error occurred. Please try again.';
  };

  const getErrorSeverity = () => {
    if (!errorDetails) return 'error';
    
    if (errorDetails.type === 'connectivity') {
      return 'error';
    }
    
    return 'warning';
  };

  if (!isOpen || !errorDetails) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon color="error" />
          <Typography variant="h6">
            Server Connection Error
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert 
          severity={getErrorSeverity()} 
          icon={<WarningIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body1" gutterBottom>
            {getErrorMessage()}
          </Typography>
        </Alert>

        {errorDetails.type === 'connectivity' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Common causes:</strong>
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>
                <Typography variant="body2" color="text.secondary">
                  The authentication server is not running
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Network connectivity issues
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Server configuration problems
                </Typography>
              </li>
            </ul>
          </Box>
        )}

        {retryAttempts > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Retry attempts: ${retryAttempts}`}
              color="info"
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              Technical Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ backgroundColor: 'grey.50', p: 1, borderRadius: 1 }}>
              <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(errorDetails, null, 2)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleDismiss}
          color="inherit"
        >
          Dismiss
        </Button>
        <Button
          onClick={handleRetry}
          variant="contained"
          startIcon={<RefreshIcon />}
          color="primary"
        >
          Retry Connection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServerError;
