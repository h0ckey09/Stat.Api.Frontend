var Auth = (function () {
    'use strict';

    // Google OAuth Client ID is now provided only server-side for verification.
    // Client does NOT need to know it; server validates the received credential.
    // (Kept for renderButton fallback themes; can be blank if using password-less only.)
    var CLIENT_ID = '433232869281-jr409nki449q55oclm7chet102inc6tp.apps.googleusercontent.com';

    // Endpoints - auto-detect API server or use configured base
    var API_BASE_URL = (function () {
        // If we're on localhost:5500 (VS Code Live Server), point to the API server
        if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
            // Check if we're on a non-standard port (like 5500 for Live Server)
            if (window.location.port && window.location.port !== '3000' && window.location.port !== '3001') {
                return 'http://localhost:3001'; // Default API server port
            }
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
                            var event = new CustomEvent('authStateChanged', { detail: { loggedIn: true, user: _user } });
                            window.dispatchEvent(event);
                        } catch (e) { /* ignore */ }
                        if (_pendingResolve) { _pendingResolve(_user); }
                    })
                    .catch(function (err) { if (_pendingReject) { _pendingReject(err); } })
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

            if (window.google && window.google.accounts && window.google.accounts.id) {
                try {
                    // Shows the One Tap / chooser UI; user interaction will invoke our callback
                    google.accounts.id.prompt();
                } catch (e) {
                    _pendingResolve = _pendingReject = null;
                    reject(e);
                }
            } else {
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
                const data = await res.json();
                setLocalUser(data.user);
                return res.text().then(function (t) { throw new Error('HTTP ' + res.status + ': ' + t); });
            }
            return res.json();
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
