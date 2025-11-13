import {
  RawSourceBinderData,
  SourceBinder,
  CreateSourceBinderData,
  UpdateSourceBinderData,
  SourceBinderListResponse,
  SourceBinderDetailsResponse,
  PaginationParams
} from '../../../types/sourceBinder';
import { normalizeSourceBinder, normalizeSourceBinders } from '../../../utils/sourceBinderUtils';

// Source Binder API service with TypeScript interfaces
const getApiUrl = (endpoint: string): string => {
  // Use same logic as Auth object for API base URL
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    return 'http://localhost:3001' + endpoint;
  }
  return endpoint; // relative path for production
};

export const sourceBinderApi = {
  /**
   * Fetch all source binders from the backend
   * @returns Promise<SourceBinder[]> Normalized list of source binders
   */
  getSourceBinders: async (): Promise<SourceBinder[]> => {
    const Auth = (window as any).Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl('/api/v1/source/ListBinders');
    console.log('📡 Fetching source binders from:', endpoint);
    
    const rawData: RawSourceBinderData[] = await Auth.authGet(endpoint);
    console.log('✅ Source binders loaded (raw):', rawData);
    
    // Normalize the inconsistent backend data
    const normalizedData = normalizeSourceBinders(rawData || []);
    console.log('✅ Source binders normalized:', normalizedData);
    
    return normalizedData;
  },

  /**
   * Get a specific source binder by ID
   * @param id - The source binder ID
   * @returns Promise<SourceBinder> Normalized source binder details
   */
  getSourceBinderById: async (id: string | number): Promise<SourceBinder> => {
    const Auth = (window as any).Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/GetBinder/${id}`);
    console.log('📡 Fetching source binder details from:', endpoint);
    
    const rawData: RawSourceBinderData = await Auth.authGet(endpoint);
    console.log('✅ Source binder details loaded (raw):', rawData);
    
    // Normalize the inconsistent backend data
    const normalizedData = normalizeSourceBinder(rawData);
    console.log('✅ Source binder normalized:', normalizedData);
    
    return normalizedData;
  },

  /**
   * Create a new source binder
   * @param binderData - The source binder data
   * @returns Promise<SourceBinder> Created and normalized source binder
   */
  createSourceBinder: async (binderData: CreateSourceBinderData): Promise<SourceBinder> => {
    const Auth = (window as any).Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl('/api/v1/source/CreateBinder');
    console.log('📡 Creating source binder:', endpoint, binderData);
    
    const rawData: RawSourceBinderData = await Auth.authPost(endpoint, binderData);
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
  updateSourceBinder: async (id: string | number, binderData: UpdateSourceBinderData): Promise<SourceBinder> => {
    const Auth = (window as any).Auth;
    
    if (!Auth) {
      throw new Error('Authentication not available');
    }

    if (!Auth.isLoggedIn()) {
      throw new Error('Not authenticated');
    }

    const endpoint = getApiUrl(`/api/v1/source/UpdateBinder/${id}`);
    console.log('📡 Updating source binder:', endpoint, binderData);
    
    const rawData: RawSourceBinderData = await Auth.authPost(endpoint, binderData);
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
  deleteSourceBinder: async (id: string | number): Promise<boolean> => {
    const Auth = (window as any).Auth;
    
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
  }
};
