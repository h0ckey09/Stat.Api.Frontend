import { useState, useEffect, useCallback } from 'react';
import { sourcePageApi } from '../services/sourcePageApi';

/**
 * Custom hook for managing source pages
 * @returns {Object} Source page state and methods
 */
export const useSourcePages = () => {
  const [sourcePages, setSourcePages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Load all source pages
   */
  const loadSourcePages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await sourcePageApi.getSourcePages();
      setSourcePages(data);
      
    } catch (error) {
      console.error('❌ Failed to load source pages:', error);
      setError(error.message || 'Failed to load source pages');
      
      // If authentication error, the error will be thrown to parent
      if (error.message && error.message.includes('Not authenticated')) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh source pages list
   */
  const refreshSourcePages = useCallback(() => {
    loadSourcePages();
  }, [loadSourcePages]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    sourcePages,
    loading,
    error,
    loadSourcePages,
    refreshSourcePages,
    clearError,
    setError
  };
};

/**
 * Custom hook for managing source pages within a specific binder
 * @param {string|number} binderId - Source binder ID
 * @returns {Object} Source page state and methods for the binder
 */
export const useSourcePagesByBinder = (binderId) => {
  const [sourcePages, setSourcePages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Load source pages for the binder
   */
  const loadSourcePagesByBinder = useCallback(async () => {
    if (!binderId) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await sourcePageApi.getSourcePagesByBinder(binderId);
      setSourcePages(data);
      
    } catch (error) {
      console.error('❌ Failed to load source pages for binder:', error);
      setError(error.message || 'Failed to load source pages for binder');
      
      if (error.message && error.message.includes('Not authenticated')) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, [binderId]);

  /**
   * Add a page to this binder
   * @param {string|number} pageId - Source page ID to add
   */
  const addPageToBinder = async (pageId) => {
    if (!binderId) throw new Error('No binder ID provided');

    try {
      setError('');
      
      await sourcePageApi.addPageToBinder(binderId, pageId);
      await loadSourcePagesByBinder(); // Refresh the list
      
    } catch (error) {
      console.error('❌ Failed to add page to binder:', error);
      setError(error.message || 'Failed to add page to binder');
      throw error;
    }
  };

  /**
   * Remove a page from this binder
   * @param {string|number} pageId - Source page ID to remove
   */
  const removePageFromBinder = async (pageId) => {
    if (!binderId) throw new Error('No binder ID provided');

    try {
      setError('');
      
      await sourcePageApi.removePageFromBinder(binderId, pageId);
      await loadSourcePagesByBinder(); // Refresh the list
      
    } catch (error) {
      console.error('❌ Failed to remove page from binder:', error);
      setError(error.message || 'Failed to remove page from binder');
      throw error;
    }
  };

  useEffect(() => {
    if (binderId) {
      loadSourcePagesByBinder();
    }
  }, [binderId]);

  return {
    sourcePages,
    loading,
    error,
    loadSourcePagesByBinder,
    addPageToBinder,
    removePageFromBinder,
    refreshSourcePages: loadSourcePagesByBinder,
    clearError: () => setError('')
  };
};

/**
 * Custom hook for managing a single source page
 * @param {string|number} pageId - Source page ID
 * @returns {Object} Source page state and methods
 */
export const useSourcePage = (pageId) => {
  const [sourcePage, setSourcePage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Load source page details
   */
  const loadSourcePage = async () => {
    if (!pageId) return;

    try {
      setLoading(true);
      setError('');
      
      const data = await sourcePageApi.getSourcePageById(pageId);
      setSourcePage(data);
      
    } catch (error) {
      console.error('❌ Failed to load source page:', error);
      setError(error.message || 'Failed to load source page');
      
      if (error.message && error.message.includes('Not authenticated')) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update source page
   * @param {Object} pageData - Updated source page data
   */
  const updateSourcePage = async (pageData) => {
    if (!pageId) throw new Error('No source page ID provided');

    try {
      setLoading(true);
      setError('');
      
      const updatedPage = await sourcePageApi.updateSourcePage(pageId, pageData);
      setSourcePage(updatedPage);
      
      return updatedPage;
    } catch (error) {
      console.error('❌ Failed to update source page:', error);
      setError(error.message || 'Failed to update source page');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete source page
   */
  const deleteSourcePage = async () => {
    if (!pageId) throw new Error('No source page ID provided');

    try {
      setLoading(true);
      setError('');
      
      await sourcePageApi.deleteSourcePage(pageId);
      setSourcePage(null);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete source page:', error);
      setError(error.message || 'Failed to delete source page');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) {
      loadSourcePage();
    }
  }, [pageId]);

  return {
    sourcePage,
    loading,
    error,
    loadSourcePage,
    updateSourcePage,
    deleteSourcePage,
    clearError: () => setError('')
  };
};

/**
 * Custom hook for creating source pages
 * @returns {Object} Creation state and methods
 */
export const useCreateSourcePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Create a new source page
   * @param {Object} pageData - Source page data
   */
  const createSourcePage = async (pageData) => {
    try {
      setLoading(true);
      setError('');
      
      const newPage = await sourcePageApi.createSourcePage(pageData);
      
      return newPage;
    } catch (error) {
      console.error('❌ Failed to create source page:', error);
      setError(error.message || 'Failed to create source page');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createSourcePage,
    clearError: () => setError('')
  };
};
