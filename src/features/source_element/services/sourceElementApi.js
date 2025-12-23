// Source Element API service with TypeScript interfaces
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

// Helper to get token from storage with expiry check
const getTokenFromStorage = () => {
  // Try sessionStorage first
  const sessionItem = sessionStorage.getItem('statSessionToken');
  if (sessionItem) {
    try {
      const parsed = JSON.parse(sessionItem);
      const now = new Date().getTime();
      if (now <= parsed.expiry) {
        return parsed.token;
      }
    } catch (e) {
      // Old format, might be just a string - remove it
      sessionStorage.removeItem('statSessionToken');
    }
  }
  
  // Try localStorage
  const localItem = localStorage.getItem('authToken');
  if (localItem) {
    try {
      const parsed = JSON.parse(localItem);
      const now = new Date().getTime();
      if (now <= parsed.expiry) {
        return parsed.token;
      }
    } catch (e) {
      // Old format, might be just a string - remove it
      localStorage.removeItem('authToken');
    }
  }
  
  return null;
};

// Helper to check if authentication is available
const isAuthAvailable = () => {
  const Auth = window.Auth;
  const token = getTokenFromStorage();
  
  return (Auth && Auth.isLoggedIn()) || token !== null;
};

// Helper to perform authenticated POST requests with fallback to manual fetch
const authPost = async (endpoint, data) => {
  const Auth = window.Auth;
  const token = getTokenFromStorage();
  
  // Use Auth object if available, otherwise use fetch with manual auth
  if (Auth && typeof Auth.authPost === 'function' && Auth.isLoggedIn()) {
    return await Auth.authPost(endpoint, data);
  } else if (token) {
    // Fallback to manual fetch with token headers
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } else {
    throw new Error('Authentication not available');
  }
};

export const sourceElementApi = {
  /**
   * Fetch all source elements for a specific source page with pagination
   * @param sourcePageId - The source page ID
   * @param options - Pagination options { limit, offset }
   * @returns Promise<{ elements: SourceElement[], total: number }> Normalized list of source elements with total count
   */
  getSourceElementsByPage: async (sourcePageId, options = {}) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'getSourceElementsByPage');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'getSourceElementsByPage');
    }

    try {
      const { limit, offset } = options;
      let endpoint = `/api/v1/source/GetPageElements/${sourcePageId}`;
      
      // Add pagination query params if provided
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit);
      if (offset !== undefined) params.append('offset', offset);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const fullUrl = getApiUrl(endpoint);
      
      // Import the utilities dynamically to avoid circular dependency
      const { normalizeSourceElements } = await import('../../../utils/sourceElementUtils');
      
      const rawData = await Auth.authGet(fullUrl);
      
      // Handle both paginated response { elements: [], total: n } and legacy array response
      let elements, total;
      if (Array.isArray(rawData)) {
        // Legacy response - just an array
        elements = rawData;
        total = rawData.length;
      } else if (rawData && rawData.elements) {
        // Paginated response
        elements = rawData.elements || [];
        total = rawData.total || rawData.totalCount || elements.length;
      } else {
        elements = [];
        total = 0;
      }
      
      // Normalize the backend element data
      const normalizedData = normalizeSourceElements(elements);
      
      return {
        elements: normalizedData,
        total: total
      };
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'getSourceElementsByPage');
      }
      throw error;
    }
  },

  /**
   * Get a specific source element by ID
   * @param id - The source element ID
   * @returns Promise<SourceElement> Normalized source element details
   */
  getSourceElementById: async (id) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'getSourceElementById');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'getSourceElementById');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/GetElement/${id}`);
      
      // Import the utilities dynamically to avoid circular dependency
      const { normalizeSourceElement } = await import('../../../utils/sourceElementUtils');
      
      const rawData = await Auth.authGet(endpoint);
      
      // Normalize the backend element data
      const normalizedData = normalizeSourceElement(rawData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'getSourceElementById');
      }
      throw error;
    }
  },

  /**
   * Create a new source element
   * @param elementData - The source element data
   * @returns Promise<SourceElement> Created and normalized source element
   */
  createSourceElement: async (elementData) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'createSourceElement');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'createSourceElement');
    }

    try {
      const endpoint = getApiUrl('/api/v1/source/CreateElement');
      
      // Import the utilities dynamically
      const { normalizeSourceElement } = await import('../../../utils/sourceElementUtils');
      
      // Transform frontend data to backend structure
      const backendData = {
        Id: 0,
        SourcePage: elementData.sourcePageId,
        Order: elementData.order || 0,
        Label: elementData.label || '',
        ElementTypeId: elementData.elementTypeId,
        ElementData: elementData.elementData || '{}',
        EditorNotes: elementData.editorNotes || '',
        CloneOfElementId: -1,
        IsActiveClone: false
      };
      
      const rawData = await Auth.authPost(endpoint, backendData);
      
      // Normalize the response
      const normalizedData = normalizeSourceElement(rawData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'createSourceElement');
      }
      throw error;
    }
  },

  /**
   * Update an existing source element
   * @param id - The source element ID
   * @param elementData - The updated source element data
   * @returns Promise<SourceElement> Updated and normalized source element
   */
  updateSourceElement: async (id, elementData) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'updateSourceElement');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'updateSourceElement');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/UpdateElement/${id}`);
      
      // Import the utilities dynamically
      const { normalizeSourceElement } = await import('../../../utils/sourceElementUtils');
      
      // Transform frontend data to backend structure
      const backendData = {};
      if (elementData.label !== undefined) {
        backendData.Label = elementData.label;
      }
      if (elementData.elementTypeId !== undefined) {
        backendData.ElementTypeId = elementData.elementTypeId;
      }
      if (elementData.elementData !== undefined) {
        backendData.ElementData = elementData.elementData;
      }
      if (elementData.editorNotes !== undefined) {
        backendData.EditorNotes = elementData.editorNotes;
      }
      if (elementData.order !== undefined) {
        backendData.Order = elementData.order;
      }
      if (elementData.reviewerApproved !== undefined) {
        backendData.ReviewerApproved = elementData.reviewerApproved;
      }
      if (elementData.reviewerNotes !== undefined) {
        backendData.ReviewerNotes = elementData.reviewerNotes;
      }
      if (elementData.isDisabled !== undefined) {
        backendData.IsDisabled = elementData.isDisabled;
      }
      if (elementData.isSelected !== undefined) {
        backendData.IsSelected_FOR_UI_ONLY = elementData.isSelected;
      }
      
      const rawData = await Auth.authPost(endpoint, backendData);
      
      // Normalize the response
      const normalizedData = normalizeSourceElement(rawData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'updateSourceElement');
      }
      throw error;
    }
  },

  /**
   * Delete a source element
   * @param id - The source element ID
   * @returns Promise<boolean> Deletion success
   */
  deleteSourceElement: async (id) => {
    if (!isAuthAvailable()) {
      handleAuthError(new Error('Authentication not available'), 'deleteSourceElement');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/DeleteElement/${id}`);
      
      const data = await authPost(endpoint, { id });
      
      return true;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'deleteSourceElement');
      }
      throw error;
    }
  },

  /**
   * Set the order of a source element
   * @param id - The source element ID
   * @param order - The new order value
   * @param returnOrderOnly - If true, returns only element IDs and orders (faster)
   * @returns Promise<boolean | Array<{id: number, order: number}>> Update success or order array
   */
  setElementOrder: async (id, order, returnOrderOnly = false) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'setElementOrder');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'setElementOrder');
    }

    try {
      let endpoint = getApiUrl(`/api/v1/source/UpdateElementOrder/${id}`);
      if (returnOrderOnly) {
        endpoint += '?returnOrderOnly=true';
      }
      
      const data = await Auth.authPost(endpoint, { order });
      
      // If returnOrderOnly was requested, normalize and return the order array
      if (returnOrderOnly && Array.isArray(data)) {
        return data.map(item => ({
          id: item.id || item.Id,
          order: item.order || item.Order
        }));
      }
      
      return true;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'setElementOrder');
      }
      throw error;
    }
  },

  /**
   * Review a source element
   * @param id - The source element ID
   * @param reviewData - Review data (approved/rejected with notes)
   * @returns Promise<SourceElement> Updated source element
   */
  reviewSourceElement: async (id, reviewData) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'reviewSourceElement');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'reviewSourceElement');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/ReviewElement/${id}`);
      
      // Import the utilities dynamically
      const { normalizeSourceElement } = await import('../../../utils/sourceElementUtils');
      
      // Transform frontend review data to backend structure
      const backendData = {
        ReviewerApproved: reviewData.approved,
        ReviewerNotes: reviewData.notes || null,
        ReviewStatusId: reviewData.reviewStatusId || null
      };
      
      const rawData = await Auth.authPost(endpoint, backendData);
      
      // Normalize the response
      const normalizedData = normalizeSourceElement(rawData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'reviewSourceElement');
      }
      throw error;
    }
  },

  /**
   * Clone a source element
   * @param id - The source element ID to clone
   * @param targetPageId - Optional target page ID (defaults to same page)
   * @returns Promise<SourceElement> Cloned source element
   */
  cloneSourceElement: async (id, targetPageId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'cloneSourceElement');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'cloneSourceElement');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/CloneElement/${id}`);
      
      // Import the utilities dynamically
      const { normalizeSourceElement } = await import('../../../utils/sourceElementUtils');
      
      const backendData = targetPageId ? { TargetPageId: targetPageId } : {};
      
      const rawData = await Auth.authPost(endpoint, backendData);
      
      // Normalize the response
      const normalizedData = normalizeSourceElement(rawData);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'cloneSourceElement');
      }
      throw error;
    }
  },

  /**
   * Reorder source elements on a page
   * @param sourcePageId - The source page ID
   * @param elementOrders - Array of {id, order} objects
   * @returns Promise<SourceElement[]> Updated source elements
   */
  reorderSourceElements: async (sourcePageId, elementOrders) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'reorderSourceElements');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'reorderSourceElements');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/ReorderElements/${sourcePageId}`);
      
      // Import the utilities dynamically
      const { normalizeSourceElements } = await import('../../../utils/sourceElementUtils');
      
      const backendData = {
        ElementOrders: elementOrders
      };
      
      const rawData = await Auth.authPost(endpoint, backendData);
      
      // Normalize the response
      const normalizedData = normalizeSourceElements(rawData || []);
      
      return normalizedData;
    } catch (error) {
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'reorderSourceElements');
      }
      throw error;
    }
  },

  /**
   * Get server-rendered HTML for a source element
   * @param elementId - The source element ID
   * @returns Promise<string> Rendered HTML string from the server
   */
  renderElementHtml: async (elementId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'renderElementHtml');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'renderElementHtml');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/RenderElementHtml/${elementId}`);
      
      // Get the auth token - check both sessionStorage and localStorage
      const authToken = sessionStorage.getItem('statSessionToken') || localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      
      // Use fetch directly to get HTML as text instead of JSON
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'text/html, application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(new Error('Unauthorized'), 'renderElementHtml');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the content type to determine how to parse the response
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // If response is JSON, parse it and extract HTML
        const data = await response.json();
        
        if (typeof data === 'string') {
          return data;
        } else if (data && data.html) {
          return data.html;
        } else if (data && data.Html) {
          return data.Html;
        } else {
          console.warn('Unexpected JSON response format from RenderElementHtml:', data);
          return JSON.stringify(data);
        }
      } else {
        // If response is HTML/text, return it directly
        const html = await response.text();
        return html;
      }
    } catch (error) {
      console.error('❌ Error rendering element HTML:', error);
      
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'renderElementHtml');
      }
      throw error;
    }
  },

  /**
   * Get element orders for a page
   * @param sourcePageId - The source page ID
   * @returns Promise<Array<{id: number, order: number}>> Array of element IDs and their orders
   */
  getElementsOrderForPage: async (sourcePageId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'getElementsOrderForPage');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'getElementsOrderForPage');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/GetElementsOrderForPage/${sourcePageId}`);
      const rawData = await Auth.authGet(endpoint);
      
      // Normalize the response - expect array of {id, order} or {Id, Order}
      if (Array.isArray(rawData)) {
        return rawData.map(item => ({
          id: item.id || item.Id,
          order: item.order || item.Order
        }));
      }
      
      return [];
    } catch (error) {
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'getElementsOrderForPage');
      }
      throw error;
    }
  },

  /**
   * Reorder elements to standardize spacing (spaces by 10s)
   * @param sourcePageId - The source page ID
   * @returns Promise<void>
   */
  standardizeElementOrder: async (sourcePageId) => {
    const Auth = window.Auth;
    
    if (!Auth) {
      handleAuthError(new Error('Authentication not available'), 'standardizeElementOrder');
    }

    if (!Auth.isLoggedIn()) {
      handleAuthError(new Error('Not authenticated'), 'standardizeElementOrder');
    }

    try {
      const endpoint = getApiUrl(`/api/v1/source/ReorderElements/${sourcePageId}`);
      await Auth.authPost(endpoint, {});
      
      return;
    } catch (error) {
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      )) {
        handleAuthError(error, 'standardizeElementOrder');
      }
      throw error;
    }
  }
};
