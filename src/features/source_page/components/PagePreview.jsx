import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Edit as EditIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext.jsx';

// Helper to get token from storage with expiry check
const getTokenFromStorage = () => {
  console.log('🔍 getTokenFromStorage called');
  
  // Try sessionStorage first
  const sessionItem = sessionStorage.getItem('statSessionToken');
  console.log('📦 sessionStorage.statSessionToken:', sessionItem ? `EXISTS (${sessionItem.substring(0, 20)}...)` : 'NULL');
  
  if (sessionItem) {
    try {
      const parsed = JSON.parse(sessionItem);
      const now = new Date().getTime();
      if (parsed.expiry && now <= parsed.expiry) {
        console.log('✅ Found valid JSON token in sessionStorage');
        return parsed.token;
      } else if (parsed.expiry) {
        console.log('⏰ Session token expired');
        sessionStorage.removeItem('statSessionToken');
      }
    } catch (e) {
      // Old format (plain string) or invalid JSON - try to use it directly
      console.log('📦 Using legacy session token format (plain string)');
      return sessionItem;
    }
  }
  
  // Try localStorage
  const localItem = localStorage.getItem('authToken');
  console.log('📦 localStorage.authToken:', localItem ? `EXISTS (${localItem.substring(0, 20)}...)` : 'NULL');
  
  if (localItem) {
    try {
      const parsed = JSON.parse(localItem);
      const now = new Date().getTime();
      if (parsed.expiry && now <= parsed.expiry) {
        console.log('✅ Found valid JSON token in localStorage');
        return parsed.token;
      } else if (parsed.expiry) {
        console.log('⏰ Local token expired');
        localStorage.removeItem('authToken');
      }
    } catch (e) {
      // Old format (plain string) or invalid JSON - try to use it directly
      console.log('📦 Using legacy local token format (plain string)');
      return localItem;
    }
  }
  
  console.log('❌ No valid token found in storage');
  return null;
};

/**
 * PagePreview component that renders a source page using Shadow DOM
 * to isolate CSS styles from the main application
 */
const PagePreview = ({ pageId, cssUrl, onElementClick, onElementDelete, onElementMoveUp, onElementMoveDown, onElementOrderChange, elementIds = [] }) => {
  const { loading: authLoading, user } = useAuth();
  const shadowHostRef = useRef(null);
  const shadowRootRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [html, setHtml] = useState('');
  const [hoveredElementId, setHoveredElementId] = useState(null);
  
  // Prevent duplicate fetches (React 18 StrictMode runs effects twice)
  const fetchingRef = useRef(false);
  const lastFetchedPageId = useRef(null);

  // Function to update button states after DOM changes
  const updateButtonStates = () => {
    if (!shadowRootRef.current) return;
    
    const elements = shadowRootRef.current.querySelectorAll('[data-element-id]');
    elements.forEach((element, index) => {
      const menu = element.querySelector('.element-menu');
      if (!menu) return;
      
      const buttons = menu.querySelectorAll('button');
      const upBtn = buttons[1]; // Second button is up
      const downBtn = buttons[2]; // Third button is down
      
      const isFirst = index === 0;
      const isLast = index === elements.length - 1;
      
      // Update up button
      if (upBtn) {
        upBtn.disabled = isFirst;
        upBtn.style.opacity = isFirst ? '0.3' : '1';
        upBtn.style.cursor = isFirst ? 'not-allowed' : 'pointer';
        upBtn.title = isFirst ? 'Already at top' : 'Move Up';
      }
      
      // Update down button
      if (downBtn) {
        downBtn.disabled = isLast;
        downBtn.style.opacity = isLast ? '0.3' : '1';
        downBtn.style.cursor = isLast ? 'not-allowed' : 'pointer';
        downBtn.title = isLast ? 'Already at bottom' : 'Move Down';
      }
    });
  };

  // Function to reorder element in the DOM
  const reorderElementInDOM = (elementId, direction) => {
    if (!shadowRootRef.current) return;
    
    const element = shadowRootRef.current.querySelector(`[data-element-id="${elementId}"]`);
    if (!element) return;

    if (direction === 'up') {
      const previousElement = element.previousElementSibling;
      if (previousElement && previousElement.hasAttribute('data-element-id')) {
        element.parentNode.insertBefore(element, previousElement);
        updateButtonStates(); // Update button states after reorder
      }
    } else if (direction === 'down') {
      const nextElement = element.nextElementSibling;
      if (nextElement && nextElement.hasAttribute('data-element-id')) {
        element.parentNode.insertBefore(nextElement, element);
        updateButtonStates(); // Update button states after reorder
      }
    }
  };

  // Function to remove element from DOM
  const removeElementFromDOM = (elementId) => {
    if (!shadowRootRef.current) return;
    
    const element = shadowRootRef.current.querySelector(`[data-element-id="${elementId}"]`);
    if (element) {
      element.remove();
    }
  };

  // Function to attach event listeners to a single element
  const attachEventListenersToElement = (element) => {
    if (!element) return;
    
    const elementId = element.getAttribute('data-element-id');
    if (!elementId) return;

    const elements = shadowRootRef.current.querySelectorAll('[data-element-id]');
    const elementArray = Array.from(elements);
    const index = elementArray.indexOf(element);
    const isFirst = index === 0;
    const isLast = index === elementArray.length - 1;

    // Create menu container
    const existingMenu = element.querySelector('.element-menu');
    if (existingMenu) {
      existingMenu.remove(); // Remove old menu if exists
    }

    const menu = document.createElement('div');
    menu.className = 'element-menu';
    
    // Get the current order from the element
    const currentOrder = element.getAttribute('data-order') || '0';
    
    // Order input field
    const orderInput = document.createElement('input');
    orderInput.type = 'number';
    orderInput.className = 'order-input';
    orderInput.value = currentOrder;
    orderInput.title = 'Element Order';
    orderInput.placeholder = 'Order';
    orderInput.addEventListener('change', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newOrder = parseInt(e.target.value, 10);
      if (!isNaN(newOrder) && onElementOrderChange) {
        onElementOrderChange(parseInt(elementId, 10), newOrder);
      }
    });
    orderInput.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent menu from closing
    });
    menu.appendChild(orderInput);
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onElementClick) {
        onElementClick(parseInt(elementId, 10));
      }
    });
    menu.appendChild(editBtn);
    
    // Move up button
    const upBtn = document.createElement('button');
    upBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';
    upBtn.title = isFirst ? 'Already at top' : 'Move Up';
    upBtn.disabled = isFirst;
    if (isFirst) {
      upBtn.style.opacity = '0.3';
      upBtn.style.cursor = 'not-allowed';
    }
    upBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isFirst && onElementMoveUp) {
        reorderElementInDOM(elementId, 'up');
        onElementMoveUp(parseInt(elementId, 10));
      }
    });
    menu.appendChild(upBtn);
    
    // Move down button
    const downBtn = document.createElement('button');
    downBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';
    downBtn.title = isLast ? 'Already at bottom' : 'Move Down';
    downBtn.disabled = isLast;
    if (isLast) {
      downBtn.style.opacity = '0.3';
      downBtn.style.cursor = 'not-allowed';
    }
    downBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isLast && onElementMoveDown) {
        reorderElementInDOM(elementId, 'down');
        onElementMoveDown(parseInt(elementId, 10));
      }
    });
    menu.appendChild(downBtn);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeElementFromDOM(elementId);
      if (onElementDelete) {
        onElementDelete(parseInt(elementId, 10));
      }
    });
    menu.appendChild(deleteBtn);
    
    // Add menu to element
    element.style.position = element.style.position || 'relative';
    element.appendChild(menu);
    
    // Hover effect
    element.addEventListener('mouseenter', () => {
      setHoveredElementId(elementId);
    });
    
    element.addEventListener('mouseleave', () => {
      setHoveredElementId(null);
    });
  };

  // Function to update a single element's HTML
  const updateElementHTML = (elementId, newHtml) => {
    if (!shadowRootRef.current) return;
    
    const element = shadowRootRef.current.querySelector(`[data-element-id="${elementId}"]`);
    if (element) {
      // Create a temporary container to parse the new HTML
      const temp = document.createElement('div');
      temp.innerHTML = newHtml;
      
      // Get the new element (should have data-element-id attribute)
      const newElement = temp.querySelector(`[data-element-id="${elementId}"]`) || temp.firstElementChild;
      
      if (newElement) {
        // Replace the old element with the new one
        element.parentNode.replaceChild(newElement, element);
        
        // Re-attach event listeners to the new element
        attachEventListenersToElement(newElement);
        
        // Update button states
        updateButtonStates();
      }
    }
  };

  // Function to insert a new element at the correct position based on order
  const insertElementIntoPreview = (elementId, order, newHtml) => {
    if (!shadowRootRef.current) return;
    
    // Create a temporary container to parse the new HTML
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    
    // Get the new element (should have data-element-id attribute)
    const newElement = temp.querySelector(`[data-element-id="${elementId}"]`) || temp.firstElementChild;
    
    if (newElement && shadowRootRef.current) {
      // Find the container where elements are rendered
      const container = shadowRootRef.current.querySelector('div');
      if (!container) return;
      
      // Get all existing elements
      const existingElements = container.querySelectorAll('[data-element-id]');
      
      // Find the correct position to insert based on order
      let insertBeforeElement = null;
      for (let i = 0; i < existingElements.length; i++) {
        const existingOrder = parseInt(existingElements[i].getAttribute('data-order') || '999999', 10);
        if (existingOrder > order) {
          insertBeforeElement = existingElements[i];
          break;
        }
      }
      
      // Set order attribute on new element for future reference
      newElement.setAttribute('data-order', order.toString());
      
      // Insert the element
      if (insertBeforeElement) {
        container.insertBefore(newElement, insertBeforeElement);
      } else {
        container.appendChild(newElement);
      }
      
      // Attach event listeners to the new element
      attachEventListenersToElement(newElement);
      
      // Update button states for all elements
      updateButtonStates();
    }
  };

  // Function to update an element's order in the DOM (data-order attribute and menu)
  const updateElementOrderInPreview = (elementId, newOrder) => {
    if (!shadowRootRef.current) return;
    
    const element = shadowRootRef.current.querySelector(`[data-element-id="${elementId}"]`);
    if (element) {
      // Update data-order attribute
      element.setAttribute('data-order', newOrder.toString());
      
      // Update the order input field in the menu if it exists
      const menu = element.querySelector('.element-menu');
      if (menu) {
        const orderInput = menu.querySelector('.order-input');
        if (orderInput) {
          orderInput.value = newOrder.toString();
        }
      }
    }
  };

  // Expose functions to parent via window (for cross-component communication)
  useEffect(() => {
    window.updateElementInPreview = updateElementHTML;
    window.insertElementIntoPreview = insertElementIntoPreview;
    window.updateElementOrderInPreview = updateElementOrderInPreview;
    window.reorderElementInPreview = reorderElementInDOM;
    return () => {
      delete window.updateElementInPreview;
      delete window.insertElementIntoPreview;
      delete window.updateElementOrderInPreview;
      delete window.reorderElementInPreview;
    };
  }, []);

  const fetchPageHtml = async () => {
    if (!pageId) return;
    
    // Prevent duplicate fetches
    if (fetchingRef.current && lastFetchedPageId.current === pageId) {
      console.log('⏭️ Skipping duplicate fetch for pageId:', pageId);
      return;
    }

    console.log('🔵 fetchPageHtml called for pageId:', pageId);
    console.trace('Call stack:');
    
    fetchingRef.current = true;
    lastFetchedPageId.current = pageId;

    try {
      setLoading(true);
      setError('');

      console.log('🎨 Fetching page preview for pageId:', pageId);
      
      // Get authentication token using helper that checks expiry
      const token = getTokenFromStorage();
      
      console.log('🔑 Token retrieved:', token ? 'TOKEN EXISTS' : 'NO TOKEN');
      
      if (!token) {
        console.error('❌ No authentication token available for preview');
        setError('No authentication token available');
        setLoading(false);
        return;
      }

      // Determine API base URL
      const apiBase = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : '';

      const url = `${apiBase}/api/v1/source/RenderPage/${pageId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html,application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setHtml(data.html || data.content || '');
      } else {
        const htmlContent = await response.text();
        setHtml(htmlContent);
      }
    } catch (err) {
      console.error('❌ Failed to load page preview:', err);
      setError(err.message || 'Failed to load page preview');
      lastFetchedPageId.current = null; // Allow retry on error
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  // Render HTML in Shadow DOM with interactive elements
  useEffect(() => {
    if (!shadowHostRef.current || !html) return;

    // Create shadow root if it doesn't exist
    let shadowRoot = shadowHostRef.current.shadowRoot;
    if (!shadowRoot) {
      shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });
    }
    
    // Store reference for later manipulation
    shadowRootRef.current = shadowRoot;

    // Clear existing content
    shadowRoot.innerHTML = '';

    // Create style element for hover effects and menu
    const style = document.createElement('style');
    style.textContent = `
      [data-element-id] {
        transition: all 0.2s ease;
        cursor: pointer;
        position: relative;
      }
      [data-element-id]:hover {
        background-color: rgba(25, 118, 210, 0.1);
        outline: 2px solid #1976d2;
        outline-offset: 2px;
      }
      .element-menu {
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border: 1px solid #1976d2;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        display: none;
        z-index: 1000;
        padding: 4px;
        gap: 4px;
        flex-direction: row;
      }
      [data-element-id]:first-child .element-menu {
        top: auto;
        bottom: -40px;
      }
      [data-element-id]:hover .element-menu {
        display: flex;
      }
      .element-menu button {
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-width: 32px;
        height: 32px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0 8px;
        flex-shrink: 0;
      }
      .element-menu button:hover {
        background: #f5f5f5;
        border-color: #1976d2;
      }
      .element-menu button svg {
        width: 18px;
        height: 18px;
        fill: #666;
      }
      .element-menu button:hover svg {
        fill: #1976d2;
      }
      .element-menu button.delete:hover {
        background: #ffebee;
        border-color: #d32f2f;
      }
      .element-menu button.delete:hover svg {
        fill: #d32f2f;
      }
      .element-menu .order-input {
        width: 60px;
        height: 32px;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0 8px;
        font-size: 13px;
        text-align: center;
        outline: none;
        flex-shrink: 0;
      }
      .element-menu .order-input:focus {
        border-color: #1976d2;
      }
    `;
    shadowRoot.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.style.padding = '16px';
    container.style.fontFamily = 'Arial, sans-serif';

    // Add CSS if provided
    if (cssUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      shadowRoot.appendChild(link);
    }

    // Parse HTML and add data attributes to elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Find all elements that have an ID attribute (server should add data-element-id)
    // Or wrap each distinct element section with data-element-id
    const elementsWithId = tempDiv.querySelectorAll('[data-element-id]');

    // Add HTML content
    container.innerHTML = tempDiv.innerHTML;
    shadowRoot.appendChild(container);

    // Add event listeners for hover and click
    const interactiveElements = shadowRoot.querySelectorAll('[data-element-id]');
    
    interactiveElements.forEach(element => {
      attachEventListenersToElement(element);
    });

  }, [html, cssUrl]); // Only re-render when HTML or CSS changes

  // Fetch on mount and when pageId changes, but only after auth is ready
  // Preview refresh is controlled by parent component via key prop
  useEffect(() => {
    console.log('🔍 PagePreview useEffect - authLoading:', authLoading, 'user:', user, 'pageId:', pageId);
    
    // Don't fetch if auth is still loading
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    // Don't fetch if no user/token available
    if (!user) {
      console.log('⚠️ No user authenticated');
      setError('Authentication required to view preview');
      return;
    }
    
    // Verify token is actually available before fetching
    const checkTokenAndFetch = async () => {
      let token = getTokenFromStorage();
      
      // If token not immediately available, wait a bit for storage sync
      if (!token) {
        console.log('⚠️ User object exists but no token in storage yet, retrying...');
        await new Promise(resolve => setTimeout(resolve, 100));
        token = getTokenFromStorage();
      }
      
      if (!token) {
        console.log('❌ Token still not available after retry');
        setError('Authentication token not available');
        return;
      }
      
      console.log('🟢 PagePreview useEffect triggered - pageId:', pageId, 'authReady: true, token available');
      fetchPageHtml();
    };
    
    checkTokenAndFetch();
  }, [pageId, authLoading, user]);

  const handleRefresh = () => {
    fetchPageHtml();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    const isAuthError = error.includes('Authentication') || 
                       error.includes('authentication') || 
                       error.includes('No authentication token');
    
    return (
      <Alert 
        severity={isAuthError ? 'info' : 'error'}
        action={
          <IconButton size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }
      >
        {isAuthError 
          ? 'Page preview requires authentication. Please log in to view the preview.'
          : `Failed to load preview: ${error}`
        }
      </Alert>
    );
  }

  if (!html) {
    return (
      <Alert severity="info">
        No preview available for this page.
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip title="Refresh preview">
        <IconButton 
          size="small" 
          onClick={handleRefresh}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          minHeight: '400px',
          backgroundColor: 'background.paper',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 200px)',
          position: 'relative'
        }}
      >
        <Box
          ref={shadowHostRef}
          sx={{
            width: '8.5in',
            height: '11in',
            margin: '0 auto',
            overflow: 'visible',
            position: 'relative',
            backgroundColor: 'white'
          }}
        />
      </Box>
    </Box>
  );
};

export default PagePreview;
