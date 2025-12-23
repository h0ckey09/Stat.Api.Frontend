import { useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { 
  SourceElement, 
  CreateSourceElementData, 
  UpdateSourceElementData,
  SourceElementReviewData,
  SourceElementFilters,
  SourceElementSort
} from '../../../types/sourceElement';
import { sourceElementApi } from '../services/sourceElementApi.js';

/**
 * Check if error is authentication-related
 */
const isAuthError = (error: any): boolean => {
  const message = error.message || '';
  return message.includes('Authentication') || 
         message.includes('Not authenticated') || 
         message.includes('authentication') ||
         message.includes('unauthorized') ||
         error.status === 401;
};

/**
 * Custom hook for managing source elements for a specific page with TypeScript support and pagination
 * @param sourcePageId - Source page ID
 * @param chunkSize - Number of elements to load per chunk (default: 50, undefined = load all at once)
 * @returns Source elements state and methods with proper typing
 */
export const useSourceElements = (sourcePageId: string | number | undefined, chunkSize: number = 50) => {
  const [sourceElements, setSourceElements] = useState<SourceElement[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  /**
   * Load all source elements in chunks
   */
  const loadAllElementsInChunks = useCallback(async (): Promise<void> => {
    if (!sourcePageId) return;

    try {
      setLoading(true);
      setError('');
      setSourceElements([]);
      
      let allElements: SourceElement[] = [];
      let offset = 0;
      let totalCount = 0;
      let hasMore = true;

      console.log(`📦 Loading elements in chunks of ${chunkSize}...`);

      while (hasMore) {
        const data = await sourceElementApi.getSourceElementsByPage(sourcePageId, {
          limit: chunkSize,
          offset: offset
        });

        // Handle both old (array) and new (object with elements/total) response formats
        let elements: SourceElement[];
        let fetchedTotal: number;
        
        if (Array.isArray(data)) {
          elements = data;
          fetchedTotal = data.length;
          hasMore = false; // Old API doesn't support pagination, stop after first fetch
        } else {
          elements = data.elements || [];
          fetchedTotal = data.total || 0;
          totalCount = fetchedTotal;
          
          // Add elements to our collection
          allElements = [...allElements, ...elements];
          
          console.log(`✅ Loaded chunk: ${elements.length} elements (${allElements.length}/${totalCount})`);
          
          // Force immediate synchronous update using flushSync
          // This prevents React from batching updates and forces a render after each chunk
          flushSync(() => {
            setSourceElements([...allElements]);
            setTotal(totalCount);
          });
          
          // Check if we have more to load
          hasMore = allElements.length < totalCount;
          offset += chunkSize;
        }
        
        // If old API, just set all elements
        if (Array.isArray(data)) {
          setSourceElements(elements);
          setTotal(elements.length);
        }
      }

      console.log(`✅ All elements loaded: ${allElements.length} total`);
      
    } catch (error: any) {
      console.error('❌ Failed to load source elements:', error);
      
      // Check if it's an authentication error
      if (isAuthError(error)) {
        console.log('🚨 Authentication error detected in useSourceElements');
        setError('Authentication required');
      } else {
        setError(error.message || 'Failed to load source elements');
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [sourcePageId, chunkSize]);

  /**
   * Load source elements (legacy method for compatibility)
   */
  const loadSourceElements = useCallback(async (options?: { limit?: number; offset?: number }): Promise<void> => {
    if (!sourcePageId) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await sourceElementApi.getSourceElementsByPage(sourcePageId, options);
      
      // Handle both old (array) and new (object with elements/total) response formats
      if (Array.isArray(data)) {
        setSourceElements(data);
        setTotal(data.length);
      } else {
        setSourceElements(data.elements || []);
        setTotal(data.total || 0);
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load source elements:', error);
      
      if (isAuthError(error)) {
        console.log('🚨 Authentication error detected in useSourceElements');
        setError('Authentication required');
      } else {
        setError(error.message || 'Failed to load source elements');
      }
    } finally {
      setLoading(false);
    }
  }, [sourcePageId]);

  /**
   * Refresh source elements list (reloads all chunks)
   */
  const refreshSourceElements = useCallback((): void => {
    loadAllElementsInChunks();
  }, [loadAllElementsInChunks]);

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    setError('');
  }, []);

  useEffect(() => {
    if (sourcePageId) {
      loadAllElementsInChunks();
    }
  }, [sourcePageId, loadAllElementsInChunks]);

  return {
    sourceElements,
    total,
    loading,
    isLoadingMore,
    error,
    loadSourceElements,
    refreshSourceElements,
    clearError,
    setError: useCallback((newError: string) => setError(newError), [])
  };
};

/**
 * Custom hook for managing a single source element with TypeScript support
 * @param id - Source element ID
 * @returns Source element state and methods with proper typing
 */
export const useSourceElement = (id: string | number | undefined) => {
  const [sourceElement, setSourceElement] = useState<SourceElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Load source element details
   */
  const loadSourceElement = useCallback(async (): Promise<void> => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await sourceElementApi.getSourceElementById(id);
      setSourceElement(data);
      
    } catch (error: any) {
      console.error('❌ Failed to load source element:', error);
      
      // Check if it's an authentication error
      if (isAuthError(error)) {
        console.log('🚨 Authentication error detected in useSourceElement');
        // The global auth error handler will handle logout/redirect
        setError('Authentication required');
      } else {
        setError(error.message || 'Failed to load source element');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Update source element
   * @param elementData - Updated source element data
   */
  const updateSourceElement = useCallback(async (elementData: UpdateSourceElementData): Promise<SourceElement> => {
    if (!id) throw new Error('No source element ID provided');

    try {
      setLoading(true);
      setError('');
      
      const updatedElement = await sourceElementApi.updateSourceElement(id, elementData);
      setSourceElement(updatedElement);
      
      return updatedElement;
    } catch (error: any) {
      console.error('❌ Failed to update source element:', error);
      setError(error.message || 'Failed to update source element');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Delete source element
   */
  const deleteSourceElement = useCallback(async (): Promise<boolean> => {
    if (!id) throw new Error('No source element ID provided');

    try {
      setLoading(true);
      setError('');
      
      const result = await sourceElementApi.deleteSourceElement(id);
      setSourceElement(null);
      
      return result;
    } catch (error: any) {
      console.error('❌ Failed to delete source element:', error);
      setError(error.message || 'Failed to delete source element');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Review source element
   * @param reviewData - Review data
   */
  const reviewSourceElement = useCallback(async (reviewData: SourceElementReviewData): Promise<SourceElement> => {
    if (!id) throw new Error('No source element ID provided');

    try {
      setLoading(true);
      setError('');
      
      const reviewedElement = await sourceElementApi.reviewSourceElement(id, reviewData);
      setSourceElement(reviewedElement);
      
      return reviewedElement;
    } catch (error: any) {
      console.error('❌ Failed to review source element:', error);
      setError(error.message || 'Failed to review source element');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Clone source element
   * @param targetPageId - Optional target page ID
   */
  const cloneSourceElement = useCallback(async (targetPageId?: number): Promise<SourceElement> => {
    if (!id) throw new Error('No source element ID provided');

    try {
      setLoading(true);
      setError('');
      
      const clonedElement = await sourceElementApi.cloneSourceElement(id, targetPageId);
      
      return clonedElement;
    } catch (error: any) {
      console.error('❌ Failed to clone source element:', error);
      setError(error.message || 'Failed to clone source element');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSourceElement();
    }
  }, [id, loadSourceElement]);

  return {
    sourceElement,
    loading,
    error,
    loadSourceElement,
    updateSourceElement,
    deleteSourceElement,
    reviewSourceElement,
    cloneSourceElement,
    clearError: useCallback(() => setError(''), [])
  };
};

/**
 * Custom hook for creating source elements with TypeScript support
 * @returns Creation state and methods with proper typing
 */
export const useCreateSourceElement = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Create a new source element
   * @param elementData - Source element data
   */
  const createSourceElement = useCallback(async (elementData: CreateSourceElementData): Promise<SourceElement> => {
    try {
      setLoading(true);
      setError('');
      
      const newElement = await sourceElementApi.createSourceElement(elementData);
      
      return newElement;
    } catch (error: any) {
      console.error('❌ Failed to create source element:', error);
      setError(error.message || 'Failed to create source element');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createSourceElement,
    clearError: useCallback(() => setError(''), [])
  };
};

/**
 * Custom hook for reordering source elements with TypeScript support
 * @param sourcePageId - Source page ID
 * @returns Reordering state and methods with proper typing
 */
export const useReorderSourceElements = (sourcePageId: string | number | undefined) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Reorder source elements
   * @param elementOrders - Array of {id, order} objects
   */
  const reorderElements = useCallback(async (elementOrders: Array<{ id: number; order: number }>): Promise<SourceElement[]> => {
    if (!sourcePageId) throw new Error('No source page ID provided');

    try {
      setLoading(true);
      setError('');
      
      const reorderedElements = await sourceElementApi.reorderSourceElements(sourcePageId, elementOrders);
      
      return reorderedElements;
    } catch (error: any) {
      console.error('❌ Failed to reorder source elements:', error);
      setError(error.message || 'Failed to reorder source elements');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sourcePageId]);

  return {
    loading,
    error,
    reorderElements,
    clearError: useCallback(() => setError(''), [])
  };
};

/**
 * Custom hook for rendering source element HTML from the server
 * @param elementId - Source element ID
 * @returns Rendered HTML state and methods with proper typing
 */
export const useRenderElementHtml = (elementId?: string | number) => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Fetch rendered HTML from the server
   */
  const fetchHtml = useCallback(async (id?: string | number): Promise<string> => {
    const targetId = id || elementId;
    
    if (!targetId) {
      throw new Error('No element ID provided');
    }

    // Check if user is authenticated before attempting to fetch
    if (!window.Auth?.isLoggedIn?.()) {
      const errorMessage = 'Authentication required to render element';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setLoading(true);
      setError('');
      
      const renderedHtml = await sourceElementApi.renderElementHtml(targetId);
      setHtml(renderedHtml);
      
      return renderedHtml;
    } catch (error: any) {
      console.error('❌ Failed to render element HTML:', error);
      const errorMessage = error.message || 'Failed to render element HTML';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [elementId]);

  /**
   * Fetch HTML on mount if elementId is provided
   */
  useEffect(() => {
    if (elementId) {
      fetchHtml(elementId).catch(() => {
        // Error already handled in fetchHtml
      });
    }
  }, [elementId]); // Only depend on elementId, not fetchHtml

  return {
    html,
    loading,
    error,
    fetchHtml,
    clearError: useCallback(() => setError(''), []),
    clearHtml: useCallback(() => setHtml(''), [])
  };
};
