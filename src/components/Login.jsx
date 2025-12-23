import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

var Auth = (function () {
    'use strict';

  // Google authentication utilities (Auth implementation continues below)
    // Client does NOT need to know it; server validates the received credential.
    // (Kept for renderButton fallback themes; can be blank if using password-less only.)
    var CLIENT_ID = '433232869281-jr409nki449q55oclm7chet102inc6tp.apps.googleusercontent.com';

    // Endpoints - auto-detect API server or use configured base
    var API_BASE_URL = (function () {
        // If we're on localhost (development), point to the local API server
        if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
            return 'http://localhost:3001'; // Local development API server port
        }
        // Otherwise use relative paths (same origin)
        return '';
    })();
    var AUTH_EXCHANGE_ENDPOINT = API_BASE_URL + '/api/v1/users/Authenticate'; // Expects { idToken } and returns local token/guid

    console.log('[Auth] Using API base URL:', API_BASE_URL || '(relative)');

    // State
    var _localToken = null;      // local session token/guid (preferred for Authorization)
    var _user = null;            // parsed user info from Google token (decoded transiently)
    var _pendingResolve = null;  // pending login promise resolve
    var _pendingReject = null;   // pending login promise reject
    var _gsiLoaded = false;      // Google Identity script loaded
    var _gsiInitialized = false; // google.accounts.id.initialize called
    var _renderedContainer = null; // last rendered button container

    // Storage keys
    var STORAGE_LOCAL_TOKEN = 'statSessionToken';

    function loadGsiScript() {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            _gsiLoaded = true;
            return Promise.resolve();
        }
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existing) {
                existing.addEventListener('load', function () { _gsiLoaded = true; resolve(); });
                existing.addEventListener('error', function (e) { reject(e || new Error('Failed to load Google GSI')); });
                return;
            }
            var s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.async = true;
            s.defer = true;
            s.onload = function () { _gsiLoaded = true; resolve(); };
            s.onerror = function (e) { reject(e || new Error('Failed to load Google GSI')); };
            document.head.appendChild(s);
        });
    }

    function parseJwt(token) {
        try {
            var parts = (token || '').split('.');
            if (parts.length < 2) { return null; }
            var base64Url = parts[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var json = atob(base64);
            var decoded = decodeURIComponent(Array.prototype.map.call(json, function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(decoded);
        } catch (e) {
            return null;
        }
    }

    function setLocalToken(token) {
        _localToken = token || null;
        try {
            if (token) { sessionStorage.setItem(STORAGE_LOCAL_TOKEN, token); }
            else { sessionStorage.removeItem(STORAGE_LOCAL_TOKEN); }
        } catch (e) { /* ignore */ }
    }

    function setLocalUser(user) {
        _user = user || null;
    }

    function loadTokensFromStorage() {
        try {
            var lt = sessionStorage.getItem(STORAGE_LOCAL_TOKEN);
            _localToken = lt || null;
            _user = null; // user info is derived during login; not persisted client-side
        } catch (e) { /* ignore */ }
    }

    function getAuthHeader() {
        // Only use local token issued by our server
        var token = _localToken;
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }

    function exchangeGoogleTokenWithServer(idToken) {
        // Posts Google ID token to server; expects { guid | token | sessionToken }
        console.log('[Auth] Exchanging Google token with server...');
        return fetch(AUTH_EXCHANGE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: idToken })
        }).then(function (res) {
            console.log('[Auth] Server response status:', res.status);
            if (!res.ok) {
                return res.text().then(function (t) {
                    console.error('[Auth] Exchange failed:', t);
                    try {
                        var errObj = JSON.parse(t);
                        throw new Error('Auth exchange failed: ' + (errObj.error || t));
                    } catch (e) {
                        throw new Error('Auth exchange failed (HTTP ' + res.status + '): ' + t);
                    }
                });
            }
            return res.json();
        }).then(function (data) {
            console.log('[Auth] Exchange response received:', data);
            var local = data && (data.guid || data.token || data.sessionToken || data.id || data.accessToken);
            if (!local) {
                console.error('[Auth] No token in response:', data);
                throw new Error('No local token returned from server');
            }
            console.log('[Auth] Local token stored');
            setLocalToken(local);
            setLocalUser(data.user);
            return data; // Return the full response including user object
        }).catch(function (err) {
            console.error('[Auth] Exchange error:', err);
            
            // Check if this is a server connectivity issue
            if (err.message.includes('fetch') || 
                err.message.includes('NetworkError') ||
                err.message.includes('Failed to fetch') ||
                err.message.toLowerCase().includes('connection') ||
                err.message.includes('ECONNREFUSED') ||
                err.message.includes('timeout') ||
                err.name === 'TypeError') {
                
                console.error('[Auth] 🔴 SERVER CONNECTIVITY ISSUE DETECTED DURING TOKEN EXCHANGE');
                
                // Dispatch a special server error event
                try {
                    var serverErrorEvent = new CustomEvent('serverError', { 
                        detail: { 
                            type: 'connectivity',
                            message: 'Unable to connect to the authentication server. Please check if the server is running and try again.',
                            originalError: err.message,
                            context: 'Google OAuth token exchange'
                        } 
                    });
                    window.dispatchEvent(serverErrorEvent);
                } catch (e) { 
                    console.error('Failed to dispatch server error event:', e); 
                }
                
                throw new Error('SERVER_DISCONNECTED');
            }
            
            throw err;
        });
    }

    function init() {
        loadTokensFromStorage();
        return loadGsiScript().then(function () {
            if (_gsiInitialized) { return; }
            function handleCredentialResponse(resp) {
                if (!resp || !resp.credential) {
                    if (_pendingReject) { _pendingReject(new Error('No credential received')); _pendingReject = _pendingResolve = null; }
                    return;
                }
                
                // Dispatch processing started event
                try {
                    var processingEvent = new CustomEvent('authStateChanged', { detail: { processing: true } });
                    window.dispatchEvent(processingEvent);
                } catch (e) { console.error('Failed to dispatch processing event:', e); }
                
                var googleIdToken = resp.credential;
                _user = parseJwt(googleIdToken) || { email: '', name: '' };
                // Exchange Google token with server for local session token
                exchangeGoogleTokenWithServer(googleIdToken)
                    .then(function (tokenData) {
                        // Update _user with server response if available
                        if (tokenData && tokenData.user) {
                            _user = tokenData.user;
                        }
                        console.log('[Auth] Login successful, user:', _user);
                        // Dispatch event for UI updates
                        try {
                            var event = new CustomEvent('authStateChanged', { detail: { loggedIn: true, user: _user, processing: false } });
                            window.dispatchEvent(event);
                        } catch (e) { /* ignore */ }
                        if (_pendingResolve) { _pendingResolve(_user); }
                    })
                    .catch(function (err) { 
                        // Dispatch processing stopped event on error
                        try {
                            var errorEvent = new CustomEvent('authStateChanged', { detail: { processing: false, error: err.message } });
                            window.dispatchEvent(errorEvent);
                        } catch (e) { /* ignore */ }
                        if (_pendingReject) { _pendingReject(err); } 
                    })
                    .finally(function () { _pendingReject = _pendingResolve = null; });
            }

            if (!(window.google && window.google.accounts && window.google.accounts.id)) {
                throw new Error('Google GSI failed to load');
            }
            google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse
            });
            _gsiInitialized = true;
        }).catch(function (e) {
            console.error('Auth.init failed', e);
        });
    }

    function login() {
        return new Promise(function (resolve, reject) {
            if (_localToken) { resolve(_user); return; }
            _pendingResolve = resolve;
            _pendingReject = reject;

            // Dispatch processing started event
            try {
                var processingEvent = new CustomEvent('authStateChanged', { detail: { processing: true } });
                window.dispatchEvent(processingEvent);
            } catch (e) { console.error('Failed to dispatch processing event:', e); }

            if (window.google && window.google.accounts && window.google.accounts.id) {
                try {
                    // Shows the One Tap / chooser UI; user interaction will invoke our callback
                    google.accounts.id.prompt();
                } catch (e) {
                    // Dispatch processing stopped event on error
                    try {
                        var errorEvent = new CustomEvent('authStateChanged', { detail: { processing: false, error: e.message } });
                        window.dispatchEvent(errorEvent);
                    } catch (evt) { /* ignore */ }
                    _pendingResolve = _pendingReject = null;
                    reject(e);
                }
            } else {
                // Dispatch processing stopped event on error
                try {
                    var errorEvent = new CustomEvent('authStateChanged', { detail: { processing: false, error: 'Google auth not initialized' } });
                    window.dispatchEvent(errorEvent);
                } catch (evt) { /* ignore */ }
                _pendingResolve = _pendingReject = null;
                reject(new Error('Google auth not initialized'));
            }
        });
    }

    function logout() {
        return new Promise(function (resolve) {
            // disable auto selection if available
            try {
                if (window.google && window.google.accounts && window.google.accounts.id && typeof google.accounts.id.disableAutoSelect === 'function') {
                    google.accounts.id.disableAutoSelect();
                }
            } catch (e) { /* ignore */ }

            setLocalToken(null);
            _user = null;
            resolve();
        });
    }

    function isLoggedIn() {
        return !!_localToken;
    }

    function authGet(endpoint) {
        if (!_localToken) { return Promise.reject(new Error('Not authenticated')); }
        return fetch(endpoint, {
            headers: getAuthHeader()
        }).then(function (res) {
            if (!res.ok) {
                return res.text().then(function (t) { throw new Error('HTTP ' + res.status + ': ' + t); });
            }
            return res.json();
        });
    }

    function authPost(endpoint, body) {
        if (!_localToken) { return Promise.reject(new Error('Not authenticated')); }
        return fetch(endpoint, {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader()),
            body: JSON.stringify(body || {})
        }).then(function (res) {
            if (!res.ok) {
                return res.text().then(function (t) { throw new Error('HTTP ' + res.status + ': ' + t); });
            }
            var ct = res.headers.get('content-type') || '';
            if (ct.indexOf('application/json') >= 0) { return res.json(); }
            return res.text();
        });
    }

    // Render Google Sign-In button into a container element and handle token exchange
    // container: HTMLElement or selector string
    // options: Google button options e.g., { theme: 'outline', size: 'large' }
    function renderGoogleLogin(container, options) {
        var el = container;
        if (typeof container === 'string') {
            el = document.querySelector(container);
        }
        if (!el) { throw new Error('Container element not found'); }

        return init().then(function () {
            // Clear old button if re-rendering
            if (_renderedContainer && _renderedContainer !== el) {
                try { _renderedContainer.innerHTML = ''; } catch (e) { /* ignore */ }
            }
            _renderedContainer = el;
            try {
                google.accounts.id.renderButton(el, Object.assign({
                    theme: 'outline',
                    size: 'large',
                    type: 'standard',
                    text: 'signin_with',
                    shape: 'rectangular'
                }, options || {}));
            } catch (e) {
                console.error('Failed to render Google button', e);
                throw e;
            }
        });
    }

    function validateAuth() {
        // /api/v1/users/ValidateSession
        if (!_localToken) { return Promise.resolve(false); }
        return fetch(API_BASE_URL + '/api/v1/users/ValidateSession', {
            headers: getAuthHeader()
        }).then(async function (res) {
            if (!res.ok) {
                return res.text().then(function (t) { throw new Error('HTTP ' + res.status + ': ' + t); });
            }
            const data = await res.json();
            setLocalUser(data.user);
            return data;
        }).catch(function (err) {
            console.error('[Auth] Validation error:', err);
            
            // Check if this is a server connectivity issue
            if (err.message.includes('fetch') || 
                err.message.includes('NetworkError') ||
                err.message.includes('Failed to fetch') ||
                err.message.toLowerCase().includes('connection') ||
                err.message.includes('ECONNREFUSED') ||
                err.message.includes('timeout') ||
                err.name === 'TypeError') {
                
                console.error('[Auth] 🔴 SERVER CONNECTIVITY ISSUE DETECTED DURING VALIDATION');
                
                // Dispatch a special server error event
                try {
                    var serverErrorEvent = new CustomEvent('serverError', { 
                        detail: { 
                            type: 'connectivity',
                            message: 'Unable to connect to the authentication server for session validation. Please check if the server is running.',
                            originalError: err.message,
                            context: 'Session validation'
                        } 
                    });
                    window.dispatchEvent(serverErrorEvent);
                } catch (e) { 
                    console.error('Failed to dispatch server error event:', e); 
                }
            }
            
            throw err;
        });
    }

    // Ensure init runs (sourceEditor already calls Auth.init())
    // Expose public API
    return {
        init: init,
        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        authGet: authGet,
        authPost: authPost,
        renderGoogleLogin: renderGoogleLogin,
        getLocalToken: function () { return _localToken; },
        getUser: function () { return _user; },
        validateAuth: validateAuth
    };
})();


const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showFallbackButton, setShowFallbackButton] = useState(true);
  const googleButtonRef = useRef(null);
  // holds cleanup for any listeners or resources created by setupAuthGoogleLogin
  const cleanupRef = useRef(null);
  const { login, authProcessing } = useAuth();
  const navigate = useNavigate();

  // Setup Google authentication using embedded Auth object
  useEffect(() => {
    const setupEmbeddedAuth = async () => {
      console.log('� Setting up embedded Auth object...');
      
      try {
        // Auth is now embedded in this file, so set it on window
        window.Auth = Auth;
        console.log('✅ Auth object available on window');
        console.log('Available Auth methods:', Object.keys(Auth));
        
        await setupAuthGoogleLogin();
        
      } catch (error) {
        console.error('❌ Failed to setup embedded Auth:', error);
        setError('Failed to setup authentication: ' + error.message);
        setShowFallbackButton(true);
      }
    };

    setupEmbeddedAuth();
    // cleanup when component unmounts
    return () => {
      try {
        if (cleanupRef.current && typeof cleanupRef.current === 'function') {
          cleanupRef.current();
        }
      } catch (e) { /* ignore cleanup errors */ }
    };
  }, []);

  // Setup Google login using embedded Auth.renderGoogleLogin
  const setupAuthGoogleLogin = async () => {
    try {
      console.log('🚀 Setting up Auth.renderGoogleLogin...');
      
      if (!Auth || typeof Auth.renderGoogleLogin !== 'function') {
        console.error('Available Auth methods:', Auth ? Object.keys(Auth) : 'Auth not available');
        throw new Error('Auth.renderGoogleLogin not available');
      }

      // Initialize Auth if needed
      if (typeof Auth.init === 'function') {
        console.log('🔧 Initializing Auth...');
        try {
          await Auth.init();
          console.log('✅ Auth initialized successfully');
        } catch (initError) {
          console.error('❌ Auth initialization failed:', initError);
          throw initError;
        }
      }

      // Setup auth state change listener
      const handleAuthStateChange = (event) => {
        console.log('🔄 Auth state changed:', event.detail);
        if (event.detail.loggedIn && event.detail.user) {
          console.log('✅ User authenticated:', event.detail.user);
          setGoogleLoading(false);
          navigate('/dashboard');
        } else if (event.detail.processing) {
          console.log('🔄 Authentication processing...');
          setGoogleLoading(true);
        } else {
          setGoogleLoading(false);
        }
      };

      // Add event listener for auth state changes and register cleanup
      window.addEventListener('authStateChanged', handleAuthStateChange);
      // Save cleanup so useEffect can remove it on unmount
      cleanupRef.current = function () {
        try { window.removeEventListener('authStateChanged', handleAuthStateChange); } catch (e) { /* ignore */ }
      };

      // Render Google login button using embedded Auth.renderGoogleLogin
      if (!googleButtonRef.current) {
        console.error('❌ Google button container not available');
        setShowFallbackButton(true);
        return;
      }

      console.log('🎨 Rendering Google login button...');
      console.log('🌐 Current origin:', window.location.origin);
      console.log('🔗 Current port:', window.location.port);
      
      try {
        await Auth.renderGoogleLogin(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular'
        });
        
        console.log('✅ Google login button rendered successfully via embedded Auth.renderGoogleLogin');
        setShowFallbackButton(false); // Hide fallback Material-UI button
      } catch (renderError) {
        console.error('❌ Failed to render Google button:', renderError);
        console.error('🚨 This might be a GSI origin mismatch error');
        setShowFallbackButton(true);
        throw renderError;
      }
      
    } catch (error) {
      console.error('❌ Failed to setup Auth.renderGoogleLogin:', error);
      console.error('📋 Error details:', error.message);
      
      // Check for common GSI errors
      if (error.message && error.message.includes('origin')) {
        console.error('🚨 GSI ORIGIN ERROR: Make sure your Google OAuth console includes:', window.location.origin);
        setError('Google OAuth origin mismatch. Check console for details.');
      } else if (error.message && error.message.includes('client')) {
        console.error('🚨 GSI CLIENT ERROR: Check your Google OAuth client ID');
        setError('Google OAuth client configuration error. Check console for details.');
      } else if (error.message && error.message.includes('Google GSI failed to load')) {
        console.error('🚨 GSI SCRIPT ERROR: Google Identity Services script failed to load');
        setError('Google Sign-In script failed to load. Check your internet connection.');
      } else {
        setError('Google authentication setup failed: ' + error.message);
      }
      
      setShowFallbackButton(true); // Show fallback button
    }
  };

  const setupSimpleGoogleAuth = () => {
    // This function is deprecated - now using Auth.renderGoogleLogin
    console.log('setupSimpleGoogleAuth deprecated, using Auth.renderGoogleLogin instead');
  };

  const handleGoogleCredentialResponse = async (response) => {
    // This function is deprecated - now using Auth.renderGoogleLogin
    console.log('handleGoogleCredentialResponse deprecated, using Auth.renderGoogleLogin instead');
  };

  const setupFallbackButton = () => {
    // This function is now mainly for clearing the Google button container
    // The actual fallback button is handled by the Material-UI Button in JSX
    setShowFallbackButton(true);
    if (googleButtonRef.current) {
      googleButtonRef.current.innerHTML = '';
    }
  };

  const setupGoogleAuth = async () => {
    // This function is deprecated - now using setupAuthGoogleLogin
    console.log('setupGoogleAuth deprecated, using setupAuthGoogleLogin instead');
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🚀 Fallback Google login triggered');
      setGoogleLoading(true);
      setError('');

      if (!Auth || typeof Auth.login !== 'function') {
        throw new Error('Auth.login method not available');
      }

      // Use embedded Auth.login() method which triggers the Google OAuth flow
      console.log('📞 Calling embedded Auth.login()...');
      const user = await Auth.login();
      console.log('✅ Authentication successful:', user);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Google authentication error:', error);
      setError(error.message || 'Google authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        position: 'relative'
      }}
    >
      {/* Processing Overlay */}
      {(authProcessing || googleLoading) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            Authenticating with Google...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we process your login
          </Typography>
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, opacity: (authProcessing || googleLoading) ? 0.7 : 1 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Google Login Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Sign in with Google
          </Typography>
          
          {/* Google Button Container */}
          <Box 
            ref={googleButtonRef}
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              minHeight: '40px',
              mb: 2
            }}
          />
          
          {/* Fallback Material-UI Button */}
          {showFallbackButton && (
            <>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleLogin}
                disabled={googleLoading || authProcessing}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M18 9.2c0-.6-.05-1.18-.15-1.75H9.2v3.31h4.95c-.21 1.12-.85 2.06-1.81 2.69v2.24h2.93C16.95 14.14 18 11.86 18 9.2z"/>
                    <path fill="#34A853" d="M9.2 18c2.43 0 4.47-.8 5.96-2.18l-2.93-2.24c-.8.54-1.81.86-3.03.86-2.33 0-4.31-1.58-5.01-3.71H1.13v2.31C2.62 15.58 5.68 18 9.2 18z"/>
                    <path fill="#FBBC04" d="M4.19 10.73c-.18-.54-.28-1.12-.28-1.73s.1-1.19.28-1.73V4.96H1.13C.41 6.4 0 7.75 0 9.2s.41 2.8 1.13 4.24l3.06-2.71z"/>
                    <path fill="#EA4335" d="M9.2 3.58c1.31 0 2.49.45 3.42 1.34l2.56-2.56C13.67.68 11.63 0 9.2 0 5.68 0 2.62 2.42 1.13 6.27l3.06 2.31c.7-2.13 2.68-3.71 5.01-3.71z"/>
                  </svg>
                }
                sx={{
                  borderColor: '#dadce0',
                  color: '#3c4043',
                  '&:hover': {
                    borderColor: '#dadce0',
                    backgroundColor: '#f8f9fa',
                  }
                }}
              >
                {(googleLoading || authProcessing) ? 'Signing in...' : 'Sign in with Google'}
              </Button>
              
              {(googleLoading || authProcessing) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Username/Password Form */}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Sign in with Username
          </Typography>
          
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading || authProcessing}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading || authProcessing}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || authProcessing}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>

        <Typography variant="body2" color="text.secondary" align="center">
          Enter your credentials to access the Stat API
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
