// Source Binder API service with TypeScript interfaces matching backend BinderInfo
const getApiUrl = (endpoint) => {
  // Use same logic as Auth object for API base URL
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    return 'http://localhost:3001' + endpoint;
  }
  return endpoint; // relative path for production
};

const handleAuthError = (error, operation) => {
  console.error(`🚨 Authentication error in ${operation}:`, error);
  
  // Dispatch global auth error event
  const authErrorEvent = new CustomEvent('authError', {
    detail: { 
      message: `Authentication failed during ${operation}`, 
      error: error.message || error,
      operation
    }
  });
  window.dispatchEvent(authErrorEvent);
  
  throw new Error('Authentication required');
};

export const sourceBinderApi = {
  /**
   * Fetch all source binders from the backend
   * @returns Promise<SourceBinder[]> Normalized list of source binders
   */
  getSourceBinders: async () => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'getSourceBinders');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'getSourceBinders');
    }

    try {
      const endpoint = getApiUrl('/api/v1/source/ListBinders');
      console.log('📡 Fetching source binders from:', endpoint);
      
      // Import the utilities dynamically to avoid circular dependency
      const { normalizeSourceBinders } = await import('../../../utils/sourceBinderUtils');
      
      const rawData = await Auth.authGet(endpoint);
      console.log('✅ Source binders loaded (raw):', rawData);
      
      // Normalize the backend BinderInfo data
      const normalizedData = normalizeSourceBinders(rawData || []);
      console.log('✅ Source binders normalized:', normalizedData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'getSourceBinders');
      }
      throw error;
    }
  },

  /**
   * Get a specific source binder by ID
   * @param id - The source binder ID
   * @returns Promise<SourceBinder> Normalized source binder details
   */
  getSourceBinderById: async (id) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'getSourceBinderById');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'getSourceBinderById');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/GetBinder/${id}`);
      console.log('📡 Fetching source binder details from:', endpoint);
      
      // Import the utilities dynamically to avoid circular dependency
      const { normalizeSourceBinder } = await import('../../../utils/sourceBinderUtils');
      
      const rawData = await Auth.authGet(endpoint);
      console.log('✅ Source binder details loaded (raw):', rawData);
      
      // Normalize the backend BinderInfo data
      const normalizedData = normalizeSourceBinder(rawData);
      console.log('✅ Source binder normalized:', normalizedData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'getSourceBinderById');
      }
      throw error;
    }
  },

  /**
   * Create a new source binder
   * @param binderData - The source binder data (maps to backend BinderInfo)
   * @returns Promise<SourceBinder> Created and normalized source binder
   */
  createSourceBinder: async (binderData) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl('/api/v1/source/CreateBinder');
    console.log('📡 Creating source binder:', endpoint, binderData);
    
    // Import the utilities dynamically
    const { normalizeSourceBinder } = await import('../../../utils/sourceBinderUtils');
    
    // Transform frontend data to backend BinderInfo structure
    const backendData = {
      Name: binderData.Name || binderData.name || '',
      Description: binderData.Description || binderData.description || '',
      IsActive: binderData.IsActive !== undefined ? binderData.IsActive : (binderData.isActive !== undefined ? binderData.isActive : true),
      ProtocolVersion: binderData.ProtocolVersion || '1.0',
      SponsorId: binderData.SponsorId,
      StudyId: binderData.StudyId
    };
    
    const rawData = await Auth.authPost(endpoint, backendData);
    console.log('✅ Source binder created (raw):', rawData);
    
    // Normalize the response
    const normalizedData = normalizeSourceBinder(rawData);
    console.log('✅ Source binder normalized:', normalizedData);
    
    return normalizedData;
  },

  /**
   * Update an existing source binder
   * @param id - The source binder ID
   * @param binderData - The updated source binder data
   * @returns Promise<SourceBinder> Updated and normalized source binder
   */
  updateSourceBinder: async (id, binderData) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/UpdateBinder/${id}`);
    console.log('📡 Updating source binder:', endpoint, binderData);
    
    // Import the utilities dynamically
    const { normalizeSourceBinder } = await import('../../../utils/sourceBinderUtils');
    
    // Transform frontend data to backend BinderInfo structure
    const backendData = {};
    if (binderData.Name || binderData.name) {
      backendData.Name = binderData.Name || binderData.name;
    }
    if (binderData.Description || binderData.description) {
      backendData.Description = binderData.Description || binderData.description;
    }
    if (binderData.IsActive !== undefined || binderData.isActive !== undefined) {
      backendData.IsActive = binderData.IsActive !== undefined ? binderData.IsActive : binderData.isActive;
    }
    if (binderData.ProtocolVersion) {
      backendData.ProtocolVersion = binderData.ProtocolVersion;
    }
    if (binderData.SponsorId) {
      backendData.SponsorId = binderData.SponsorId;
    }
    if (binderData.StudyId) {
      backendData.StudyId = binderData.StudyId;
    }
    
    const rawData = await Auth.authPost(endpoint, backendData);
    console.log('✅ Source binder updated (raw):', rawData);
    
    // Normalize the response
    const normalizedData = normalizeSourceBinder(rawData);
    console.log('✅ Source binder normalized:', normalizedData);
    
    return normalizedData;
  },

  /**
   * Delete a source binder
   * @param id - The source binder ID
   * @returns Promise<boolean> Deletion success
   */
  deleteSourceBinder: async (id) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/DeleteBinder/${id}`);
    console.log('📡 Deleting source binder:', endpoint);
    
    const data = await Auth.authPost(endpoint, { id });
    console.log('✅ Source binder deleted:', data);
    
    return true;
  },

  /**
   * Get pages for a specific source binder by ID
   * @param id - The source binder ID
   * @returns Promise<SourcePage[]> Normalized source pages list
   */
  getSourceBinderPages: async (id) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'getSourceBinderPages');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'getSourceBinderPages');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/GetBinderPages/${id}`);
      console.log('📡 Fetching source binder pages from:', endpoint);
      
      // Import the utilities dynamically to avoid circular dependency
      const { normalizeSourcePages } = await import('../../../utils/sourceBinderUtils');
      
      const rawData = await Auth.authGet(endpoint);
      console.log('✅ Source binder pages loaded (raw):', rawData);
      
      // Normalize the backend PageInfo data
      const normalizedData = normalizeSourcePages(rawData || []);
      console.log('✅ Source binder pages normalized:', normalizedData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'getSourceBinderPages');
      }
      throw error;
    }
  },
};
