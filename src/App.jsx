import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import ApiExplorer from './components/ApiExplorer.jsx';
import AuthDebug from './components/AuthDebug.jsx';
import ServerError from './components/ServerError.jsx';
import { SourceBinderList, SourceBinderListPage, SourceBinderDetailsPage, SourcePageDetailsPage } from './features/source_binder';
import './App.css';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function AppContent() {
  const { user, loading, authProcessing } = useAuth();

  // Show loading spinner during initial auth check
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Show authentication processing overlay
  if (authProcessing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={64} sx={{ mb: 3 }} />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>
          Authenticating...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we process your login
        </Typography>
      </Box>
    );
  }

  return (
    <div className="App">
      {user && <Navbar />}
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 1 }}>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } 
          />
          <Route 
            path="/source-binders" 
            element={
              <AuthGuard>
                <SourceBinderListPage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/source-binders/:id" 
            element={
              <AuthGuard>
                <SourceBinderDetailsPage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/source-binders/:id/pages/:pageId" 
            element={
              <AuthGuard>
                <SourcePageDetailsPage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/api-explorer" 
            element={
              <AuthGuard>
                <ApiExplorer />
              </AuthGuard>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Container>
      {/* Debug and error components */}
      <AuthDebug />
      <ServerError />
    </div>
  );
}

function App() {
  // Make sure Auth object is available early
  useEffect(() => {
    if (!window.Auth) {
      console.log('⚠️ Auth object not available on window');
    } else {
      console.log('✅ Auth object available on window');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App
