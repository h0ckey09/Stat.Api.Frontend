// Source Page API service
const getApiUrl = (endpoint) => {
  // Use same logic as Auth object for API base URL
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    return 'http://localhost:3001' + endpoint;
  }
  return endpoint; // relative path for production
};

export const sourcePageApi = {
  /**
   * Fetch all source pages
   * @returns {Promise<Array>} List of source pages
   */
  getSourcePages: async () => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl('/api/v1/source/ListPages');
    console.log('📡 Fetching source pages from:', endpoint);
    
    const data = await Auth.authGet(endpoint);
    console.log('✅ Source pages loaded:', data);
    
    return data || [];
  },

  /**
   * Fetch source pages for a specific binder
   * @param {string|number} binderId - The source binder ID
   * @returns {Promise<Array>} List of source pages for the binder
   */
  getSourcePagesByBinder: async (binderId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/GetBinderPages/${binderId}`);
    console.log('📡 Fetching source pages for binder from:', endpoint);
    
    const data = await Auth.authGet(endpoint);
    console.log('✅ Source pages for binder loaded:', data);
    
    return data || [];
  },

  /**
   * Get a specific source page by ID
   * @param {string|number} pageId - The source page ID
   * @returns {Promise<Object>} Source page details
   */
  getSourcePageById: async (pageId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/GetPage/${pageId}`);
    console.log('📡 Fetching source page details from:', endpoint);
    
    const data = await Auth.authGet(endpoint);
    console.log('✅ Source page details loaded:', data);
    
    return data;
  },

  /**
   * Create a new source page
   * @param {Object} pageData - The source page data
   * @returns {Promise<Object>} Created source page
   */
  createSourcePage: async (pageData) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl('/api/v1/source/CreatePage');
    console.log('📡 Creating source page:', endpoint, pageData);
    
    const data = await Auth.authPost(endpoint, pageData);
    console.log('✅ Source page created:', data);
    
    return data;
  },

  /**
   * Update an existing source page
   * @param {string|number} pageId - The source page ID
   * @param {Object} pageData - The updated source page data
   * @returns {Promise<Object>} Updated source page
   */
  updateSourcePage: async (pageId, pageData) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/UpdatePage/${pageId}`);
    console.log('📡 Updating source page:', endpoint, pageData);
    
    const data = await Auth.authPost(endpoint, pageData);
    console.log('✅ Source page updated:', data);
    
    return data;
  },

  /**
   * Delete a source page
   * @param {string|number} pageId - The source page ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteSourcePage: async (pageId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/DeletePage/${pageId}`);
    console.log('📡 Deleting source page:', endpoint);
    
    const data = await Auth.authPost(endpoint, { id: pageId });
    console.log('✅ Source page deleted:', data);
    
    return data;
  },

  /**
   * Add a page to a binder
   * @param {string|number} binderId - The source binder ID
   * @param {string|number} pageId - The source page ID
   * @returns {Promise<Object>} Addition result
   */
  addPageToBinder: async (binderId, pageId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/AddPageToBinder`);
    console.log('📡 Adding page to binder:', endpoint, { binderId, pageId });
    
    const data = await Auth.authPost(endpoint, { binderId, pageId });
    console.log('✅ Page added to binder:', data);
    
    return data;
  },

  /**
   * Remove a page from a binder
   * @param {string|number} binderId - The source binder ID
   * @param {string|number} pageId - The source page ID
   * @returns {Promise<Object>} Removal result
   */
  removePageFromBinder: async (binderId, pageId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/RemovePageFromBinder`);
    console.log('📡 Removing page from binder:', endpoint, { binderId, pageId });
    
    const data = await Auth.authPost(endpoint, { binderId, pageId });
    console.log('✅ Page removed from binder:', data);
    
    return data;
  }
};
