(function () {
    'use strict';

    // Initialize after DOM ready
    function init() {
        // Ensure Auth is present
        if (typeof Auth === 'undefined') { return; }
        Auth.init();

        var authButton = document.getElementById('authButton');
        var status = document.getElementById('status');
        var currentUser = document.getElementById('currentUser');
        var usernameEl = document.getElementById('username');

        function setLoggedOutUi() {
            authButton.textContent = 'Login';
            status.className = 'alert alert-light';
            status.textContent = '';
            var msg = document.createElement('div');
            msg.textContent = 'You are not signed in. Click Login or use Google Sign-In below.';
            msg.className = 'mb-2';
            status.appendChild(msg);

            // Create container for Google button dynamically
            var gContainer = document.createElement('div');
            gContainer.id = 'googleLogin';
            status.appendChild(gContainer);
            if (currentUser) { currentUser.style.display = 'none'; }

            Auth.renderGoogleLogin('#googleLogin', { theme: 'outline', size: 'large' })
                .then(function () { console.log('Google button rendered'); })
                .catch(function (err) { console.error('Render failed', err); });


        }

        function setLoggedInUi() {
            authButton.textContent = 'Logout';
            status.className = 'alert alert-info';
            status.textContent = 'Signed in. Loading binders...';
            if (currentUser) {
                currentUser.style.display = 'inline-block';
                // username will be populated after fetching from server
                usernameEl.textContent = '...';
            }
        }

        function renderBinders(list) {
            status.className = 'alert alert-light';
            if (!Array.isArray(list) || list.length === 0) {
                status.textContent = 'No binders found.';
                return;
            }

            // build minimal table
            var table = document.createElement('table');
            table.className = 'table table-sm table-striped';
            var thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Name</th><th>ID</th><th>Status</th></tr>';
            table.appendChild(thead);

            var tbody = document.createElement('tbody');
            list.forEach(function (item) {
                var name = item && (item.Name || item.name || item.title || item.displayName) || '(unnamed)';
                var id = item && (item.Id || item.id || item.guid || item.binderId) || '';
                var statusLabel = (item.Status && (item.Status.Name || item.Status)) || (item.status || '');
                var tr = document.createElement('tr');
                tr.innerHTML = '<td>' + escapeHtml(name) + '</td><td>' + escapeHtml(id) + '</td><td>' + escapeHtml(statusLabel) + '</td>';
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            // replace status with table
            status.innerHTML = '';
            status.appendChild(table);
        }

        function escapeHtml(s) {
            return String(s || '').replace(/[&<>"']/g, function (m) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
            });
        }

        function getQueryParam(name) {
            var params = new URLSearchParams(window.location.search);
            return params.get(name);
        }

        function loadBinders() {
            // Strategy: If binderId is provided in querystring, load its pages (simple view)
            var binderId = getQueryParam('binderId');
            if (binderId && typeof BinderApisV2Client === 'function') {
                try {
                    var client = new BinderApisV2Client();
                    client.getBinderPages(binderId, { simple: true, onlyActive: false })
                        .then(function (pages) {
                            renderBinders(Array.isArray(pages) ? pages : []);
                        }, function (err) {
                            status.className = 'alert alert-danger';
                            status.textContent = 'Failed to load binder pages.';
                            console.error('getBinderPages error', err);
                        });
                    return;
                } catch (e) {
                    // fall through to message
                }
            }

            // If no binderId, show list of accessible binders
            if (typeof BinderApisV2Client === 'function') {
                try {
                    var clientList = new BinderApisV2Client();
                    if (clientList.listBinders) {
                        clientList.listBinders().then(function (list) {
                            if (Array.isArray(list) && list.length) {
                                renderBinders(list);
                            } else {
                                status.className = 'alert alert-warning';
                                status.textContent = 'No binders available.';
                            }
                        }, function (err) {
                            status.className = 'alert alert-danger';
                            status.textContent = 'Failed to list binders.';
                            console.error('listBinders error', err);
                        });
                        return;
                    }
                } catch (e) { /* ignore */ }
            }
            status.className = 'alert alert-warning';
            status.textContent = 'Provide a binderId in the URL to view pages, e.g. ?binderId=123';
        }

        function loadCurrentUser() {
            if (typeof Auth.authGet !== 'function') { return Promise.resolve(null); }
            return Auth.authGet('/api/v1/users/GetCurrentUser')
                .then(function (u) {
                    console.log('[sourceEditor] Current user:', u);
                    try { sessionStorage.setItem('currentUser', JSON.stringify(u || {})); } catch (e) { }
                    if (u && u.name) {
                        usernameEl.textContent = u.name;
                    } else if (u && u.email) {
                        usernameEl.textContent = u.email;
                    } else {
                        console.warn('[sourceEditor] User object missing name/email:', u);
                        usernameEl.textContent = 'user';
                    }
                    return u;
                })
                .catch(function (err) {
                    console.warn('GetCurrentUser failed', err);
                    usernameEl.textContent = 'user';
                    return null;
                });
        }

        function updateUi() {
            if (Auth.isLoggedIn && Auth.isLoggedIn()) {
                setLoggedInUi();
                loadCurrentUser().finally(function () {
                    loadBinders();
                });
            } else {
                setLoggedOutUi();
            }
        }

        // Helper to display user from auth event data
        function displayUserFromAuthEvent(user) {
            if (!user) return;
            if (user.name) {
                usernameEl.textContent = user.name;
            } else if (user.email) {
                usernameEl.textContent = user.email;
            }
        }

        // wire auth button: login or logout
        authButton.addEventListener('click', function () {
            if (Auth.isLoggedIn && Auth.isLoggedIn()) {
                Auth.logout().then(function () {
                    updateUi();
                });
            } else {
                // trigger Google sign-in flow (Auth.login returns a Promise that resolves with user info)
                Auth.login().then(function () {
                    updateUi();
                }).catch(function (err) {
                    alert('Login failed.');
                    console.error('login error', err);
                    updateUi();
                });
            }
        });

        // Listen for auth state changes from Auth library
        window.addEventListener('authStateChanged', function (e) {
            console.log('[sourceEditor] Auth state changed:', e.detail);
            if (e.detail && e.detail.loggedIn && e.detail.user) {
                displayUserFromAuthEvent(e.detail.user);
            }
            updateUi();
        });

        // initial UI
        updateUi();
    }

    // run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ...existing code...
})();