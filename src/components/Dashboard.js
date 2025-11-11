import React, { useState, useEffect } from 'react';
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
import { apiService } from '../services/apiService';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
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
                Backend Server: https://www.statresearch.com:3001
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
                    <strong>Status:</strong> Connected
                  </Typography>
                  {/* Add more profile fields as needed */}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Profile data not available. The backend might require specific authentication.
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
