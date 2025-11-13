import { useState, useEffect, useCallback } from 'react';
import { SourceBinder, SourcePage, CreateSourceBinderData, UpdateSourceBinderData } from '../../../types/sourceBinder';
import { sourceBinderApi } from '../services/sourceBinderApi.js';

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
 * Custom hook for managing source binders with TypeScript support
 * @returns Source binder state and methods with proper typing
 */
export const useSourceBinders = () => {
  const [sourceBinders, setSourceBinders] = useState<SourceBinder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Load all source binders
   */
  const loadSourceBinders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      const data = await sourceBinderApi.getSourceBinders();
      setSourceBinders(data);
      
    } catch (error: any) {
      console.error('❌ Failed to load source binders:', error);
      
      // Check if it's an authentication error
      if (isAuthError(error)) {
        console.log('🚨 Authentication error detected in useSourceBinders');
        // The global auth error handler will handle logout/redirect
        setError('Authentication required');
      } else {
        setError(error.message || 'Failed to load source binders');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh source binders list
   */
  const refreshSourceBinders = useCallback((): void => {
    loadSourceBinders();
  }, [loadSourceBinders]);

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    setError('');
  }, []);

  return {
    sourceBinders,
    loading,
    error,
    loadSourceBinders,
    refreshSourceBinders,
    clearError,
    setError
  };
};

/**
 * Custom hook for managing a single source binder with TypeScript support
 * @param id - Source binder ID
 * @returns Source binder state and methods with proper typing
 */
export const useSourceBinder = (id: string | number | undefined) => {
  const [sourceBinder, setSourceBinder] = useState<SourceBinder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Load source binder details
   */
  const loadSourceBinder = useCallback(async (): Promise<void> => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await sourceBinderApi.getSourceBinderById(id);
      setSourceBinder(data);
      
    } catch (error: any) {
      console.error('❌ Failed to load source binder:', error);
      
      // Check if it's an authentication error
      if (isAuthError(error)) {
        console.log('🚨 Authentication error detected in useSourceBinder');
        // The global auth error handler will handle logout/redirect
        setError('Authentication required');
      } else {
        setError(error.message || 'Failed to load source binder');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Update source binder
   * @param binderData - Updated source binder data
   */
  const updateSourceBinder = useCallback(async (binderData: UpdateSourceBinderData): Promise<SourceBinder> => {
    if (!id) throw new Error('No source binder ID provided');

    try {
      setLoading(true);
      setError('');
      
      const updatedBinder = await sourceBinderApi.updateSourceBinder(id, binderData);
      setSourceBinder(updatedBinder);
      
      return updatedBinder;
    } catch (error: any) {
      console.error('❌ Failed to update source binder:', error);
      setError(error.message || 'Failed to update source binder');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Delete source binder
   */
  const deleteSourceBinder = useCallback(async (): Promise<boolean> => {
    if (!id) throw new Error('No source binder ID provided');

    try {
      setLoading(true);
      setError('');
      
      const result = await sourceBinderApi.deleteSourceBinder(id);
      setSourceBinder(null);
      
      return result;
    } catch (error: any) {
      console.error('❌ Failed to delete source binder:', error);
      setError(error.message || 'Failed to delete source binder');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSourceBinder();
    }
  }, [id, loadSourceBinder]);

  return {
    sourceBinder,
    loading,
    error,
    loadSourceBinder,
    updateSourceBinder,
    deleteSourceBinder,
    clearError: useCallback(() => setError(''), [])
  };
};

/**
 * Custom hook for creating source binders with TypeScript support
 * @returns Creation state and methods with proper typing
 */
export const useCreateSourceBinder = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Create a new source binder
   * @param binderData - Source binder data
   */
  const createSourceBinder = useCallback(async (binderData: CreateSourceBinderData): Promise<SourceBinder> => {
    try {
      setLoading(true);
      setError('');
      
      const newBinder = await sourceBinderApi.createSourceBinder(binderData);
      
      return newBinder;
    } catch (error: any) {
      console.error('❌ Failed to create source binder:', error);
      setError(error.message || 'Failed to create source binder');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createSourceBinder,
    clearError: useCallback(() => setError(''), [])
  };
};

/**
 * Custom hook for managing source pages for a specific binder with TypeScript support
 * @param binderId - Source binder ID
 * @returns Source pages state and methods with proper typing
 */
export const useSourcePages = (binderId: string | number | undefined) => {
  const [sourcePages, setSourcePages] = useState<SourcePage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Load source pages for the binder
   */
  const loadSourcePages = useCallback(async (): Promise<void> => {
    if (!binderId) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await (sourceBinderApi as any).getSourceBinderPages(binderId);
      setSourcePages(data);
      
    } catch (error: any) {
      console.error('❌ Failed to load source pages:', error);
      
      // Check if it's an authentication error
      if (isAuthError(error)) {
        console.log('🚨 Authentication error detected in useSourcePages');
        // The global auth error handler will handle logout/redirect
        setError('Authentication required');
      } else {
        setError(error.message || 'Failed to load source pages');
      }
    } finally {
      setLoading(false);
    }
  }, [binderId]);

  /**
   * Refresh source pages list
   */
  const refreshSourcePages = useCallback((): void => {
    loadSourcePages();
  }, [loadSourcePages]);

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    setError('');
  }, []);

  useEffect(() => {
    if (binderId) {
      loadSourcePages();
    }
  }, [binderId, loadSourcePages]);

  return {
    sourcePages,
    loading,
    error,
    loadSourcePages,
    refreshSourcePages,
    clearError,
    setError: useCallback((newError: string) => setError(newError), [])
  };
};
