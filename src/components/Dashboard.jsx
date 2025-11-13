import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SourceBinderTable, useSourceBinders } from '../features/source_binder';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get the Auth object from window (set by Login component)
  const Auth = window.Auth;

  // Use the source binder hook
  const {
    sourceBinders,
    loading: bindersLoading,
    error: bindersError,
    loadSourceBinders,
    refreshSourceBinders,
    clearError: clearBindersError
  } = useSourceBinders();

  useEffect(() => {
    fetchProfile();
    
    // Load source binders once on component mount
    loadSourceBinders().catch((error) => {
      // Handle authentication errors
      if (error.message && error.message.includes('Not authenticated')) {
        navigate('/login');
      }
    });
  }, []); // Empty dependency array to prevent infinite loops

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      // Use Auth object for authenticated requests if available
      if (Auth && Auth.isLoggedIn()) {
        // You can implement profile fetching here if needed
        setProfile({ status: 'Connected', user: Auth.getUser() });
      } else {
        setProfile(null);
        setError('Not authenticated');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [Auth]);

  const handleLogout = async () => {
    try {
      if (Auth && Auth.logout) {
        await Auth.logout();
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login anyway
      navigate('/login');
    }
  };

  const handleViewSourceBinderDetails = (binder) => {
    const binderId = binder.id || binder.binderId;
    if (binderId) {
      // Navigate to source binder details page when implemented
      navigate(`/source-binders/${binderId}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Welcome to Stat API Frontend
                </Typography>
                <Typography variant="body1" paragraph>
                  This is your dashboard where you can manage your account and explore the available API endpoints.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Backend Server: http://localhost:3001
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Profile Information
                </Typography>
                {profile ? (
                  <Box>
                    <Typography variant="body1">
                      <strong>Status:</strong> {profile.status || 'Connected'}
                    </Typography>
                    {profile.user && (
                      <Typography variant="body1">
                        <strong>User:</strong> {profile.user.email || profile.user.name || 'N/A'}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Profile data not available. Please ensure you are logged in.
                  </Typography>
                )}
                <Button 
                  variant="outlined" 
                  onClick={fetchProfile} 
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Refresh Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Source Binders Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    Source Binders
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={refreshSourceBinders}
                    disabled={bindersLoading}
                  >
                    {bindersLoading ? <CircularProgress size={20} /> : 'Refresh'}
                  </Button>
                </Box>

                {bindersError && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={clearBindersError}>
                    {bindersError}
                  </Alert>
                )}

                <SourceBinderTable
                  sourceBinders={sourceBinders}
                  onViewDetails={handleViewSourceBinderDetails}
                  loading={bindersLoading}
                />

                {/* Debug Info */}
                {sourceBinders.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Loaded {sourceBinders.length} source binder(s)
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" href="/api-explorer">
                    Explore API
                  </Button>
                  <Button variant="outlined" onClick={refreshSourceBinders}>
                    Refresh Source Binders
                  </Button>
                  <Button variant="outlined">
                    View Documentation
                  </Button>
                  <Button variant="outlined">
                    Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
};

export default Dashboard;
