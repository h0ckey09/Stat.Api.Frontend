import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Breadcrumbs,
  Link,
  Fab,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Reorder as ReorderIcon,
  ContentCopy as CopyIcon,
  Preview as PreviewIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ElementEditorDialog } from '../../source_element/components/ElementEditorDialog';
import PagePreview from '../../source_page/components/PagePreview';
import { formatDate, getStatusDisplay, getStatusColor } from '../../../utils/sourceBinderUtils';

const SourcePageDetailsPage = () => {
  const { id: binderId, pageId } = useParams();
  const navigate = useNavigate();
  
  console.log('🔴 SourcePageDetailsPage render - binderId:', binderId, 'pageId:', pageId);
  
  // Local state for element editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [binderName, setBinderName] = useState('');
  const [previewKey, setPreviewKey] = useState(0); // Force preview refresh
  
  // Lazy load elements only when needed (not on initial page load)
  const [elementsCache, setElementsCache] = useState([]);
  const [elementsLoading, setElementsLoading] = useState(false);
  
  // Use refs to prevent duplicate API calls (React 18 StrictMode runs effects twice)
  const loadingRef = useRef(false);
  const lastLoadedRef = useRef({ pageId: null, binderId: null });

  // Load page info and binder name together to avoid multiple re-renders
  useEffect(() => {
    // Skip if already loading or already loaded these IDs
    if (loadingRef.current || 
        (lastLoadedRef.current.pageId === pageId && lastLoadedRef.current.binderId === binderId)) {
      return;
    }
    
    const loadInitialData = async () => {
      if (!pageId || !binderId) return;
      
      loadingRef.current = true;
      
      try {
        // Load both in parallel
        const [pageResult, binderResult] = await Promise.all([
          import('../../source_page/services/sourcePageApi').then(({ sourcePageApi }) => 
            sourcePageApi.getSourcePageById(pageId)
          ),
          import('../../source_binder/services/sourceBinderApi').then(({ sourceBinderApi }) => 
            sourceBinderApi.getSourceBinderById(binderId)
          )
        ]);
        
        // Update both states at once (batched by React)
        setCurrentPage(pageResult);
        setBinderName(binderResult?.name || '');
        lastLoadedRef.current = { pageId, binderId };
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        loadingRef.current = false;
      }
    };

    loadInitialData();
  }, [pageId, binderId]);

  const handleBack = () => {
    navigate(`/source-binders/${binderId}`);
  };

  const handleEditPage = () => {
    navigate(`/source-binders/${binderId}/pages/${pageId}/edit`);
  };

  const handleDownloadPdf = async () => {
    try {
      console.log('📄 Starting PDF download for page:', pageId);
      const token = sessionStorage.getItem('statSessionToken') || localStorage.getItem('authToken');
      console.log('🔑 Using auth token:', token ? 'Token exists' : 'No token found');
      
      const url = `/api/v2/source/DownloadPagePdf/${pageId}`;
      console.log('🌐 Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📋 Response headers:', {
        contentType: response.headers.get('Content-Type'),
        contentDisposition: response.headers.get('Content-Disposition'),
        contentLength: response.headers.get('Content-Length')
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK. Error text:', errorText);
        throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
      }
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `page-${pageId}.pdf`;
      if (contentDisposition) {
        console.log('📎 Content-Disposition header:', contentDisposition);
        const matches = /filename[^;=\\n]*=((['\"]).*?\\2|[^;\\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['\\"]/g, '');
          console.log('📝 Extracted filename:', filename);
        }
      }
      
      // Create blob and download
      const blob = await response.blob();
      console.log('💾 Blob created - Size:', blob.size, 'bytes, Type:', blob.type);
      
      if (blob.size === 0) {
        console.error('⚠️ WARNING: Blob size is 0 bytes!');
        alert('Received empty PDF file. Please check server logs.');
        return;
      }
      
      const blobUrl = window.URL.createObjectURL(blob);
      console.log('🔗 Blob URL created:', blobUrl);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      console.log('🖱️ Triggering download for:', filename);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      console.log('✅ PDF download completed successfully');
    } catch (error) {
      console.error('❌ Failed to download PDF:', error);
      console.error('Error stack:', error.stack);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleAddElement = () => {
    setEditingElement(null);
    setIsCreatingNew(true);
    setEditorOpen(true);
  };

  const handleEditElement = (element) => {
    setEditingElement(element);
    setIsCreatingNew(false);
    setEditorOpen(true);
  };

  const handleDeleteElement = async (elementId) => {
    if (window.confirm('Are you sure you want to delete this element?')) {
      try {
        const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
        await sourceElementApi.deleteSourceElement(elementId);
        setPreviewKey(prev => prev + 1); // Force preview refresh
        setElementsCache([]); // Clear cache
      } catch (error) {
        console.error('Failed to delete element:', error);
      }
    }
  };

  const handleEditorSave = async (elementData) => {
    console.log('handleEditorSave called with:', elementData);
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      let elementId;
      
      // Check if we have an element ID to determine create vs update
      if (!editingElement || !editingElement.id) {
        console.log('Creating new element');
        // Create new element
        const newElementData = {
          ...elementData,
          sourcePageId: parseInt(pageId)
        };
        console.log('Calling createSourceElement with:', newElementData);
        const createdElement = await sourceElementApi.createSourceElement(newElementData);
        console.log('Element created:', createdElement);
        elementId = createdElement.id;
        
        // Close dialog immediately
        setEditorOpen(false);
        setEditingElement(null);
        setIsCreatingNew(false);
        
        // Insert new element into cache at the correct position based on order
        if (elementsCache.length > 0) {
          const updatedCache = [...elementsCache, createdElement].sort((a, b) => a.order - b.order);
          setElementsCache(updatedCache);
        } else {
          setElementsCache([createdElement]);
        }
        
        // Insert rendered element into preview in background (don't await)
        insertNewElementIntoPreview(createdElement);
      } else {
        // Update existing element
        elementId = editingElement.id;
        await sourceElementApi.updateSourceElement(elementId, elementData);
        
        // Close dialog immediately
        setEditorOpen(false);
        setEditingElement(null);
        setIsCreatingNew(false);
        setElementsCache([]); // Clear cache
        
        // Update preview in background (don't await)
        updateSingleElementInPreview(elementId);
      }
      
      return elementId; // Return element ID to indicate success
    } catch (error) {
      console.error('Failed to save element:', error);
      // Keep dialog open to show error
      throw error; // Re-throw so dialog can show error
    }
  };

  // Function to update a single element's HTML in the preview
  const updateSingleElementInPreview = async (elementId) => {
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      const newHtml = await sourceElementApi.renderElementHtml(elementId);
      
      // Call the preview component's update function
      if (window.updateElementInPreview) {
        window.updateElementInPreview(elementId, newHtml);
      }
    } catch (error) {
      console.error('Failed to update element HTML:', error);
      // Fall back to full page refresh on error
      setPreviewKey(prev => prev + 1);
    }
  };

  // Function to insert a new element into the preview at the correct position
  const insertNewElementIntoPreview = async (element) => {
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      const newHtml = await sourceElementApi.renderElementHtml(element.id);
      
      // Call the preview component's insert function
      if (window.insertElementIntoPreview) {
        window.insertElementIntoPreview(element.id, element.order, newHtml);
      }
    } catch (error) {
      console.error('Failed to insert new element HTML:', error);
      // Fall back to full page refresh on error
      setPreviewKey(prev => prev + 1);
    }
  };

  const handleEditorCancel = () => {
    setEditorOpen(false);
    setEditingElement(null);
    setIsCreatingNew(false);
  };

  // Lazy load elements only when needed
  const loadElementsIfNeeded = async () => {
    if (elementsCache.length > 0) return elementsCache;
    
    setElementsLoading(true);
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      const { elements } = await sourceElementApi.getSourceElementsByPage(pageId);
      setElementsCache(elements);
      setElementsLoading(false);
      return elements;
    } catch (error) {
      console.error('Failed to load elements:', error);
      setElementsLoading(false);
      return [];
    }
  };

  const handlePreviewElementClick = async (elementId) => {
    // Load just this element by ID (much faster than loading all elements)
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      const element = await sourceElementApi.getSourceElementById(elementId);
      
      if (element) {
        handleEditElement(element);
      }
    } catch (error) {
      console.error('Failed to load element:', error);
    }
  };

  const handlePreviewElementDelete = async (elementId) => {
    await handleDeleteElement(elementId);
  };

  const handlePreviewElementMoveUp = async (elementId) => {
    // Load elements to get order information
    const elements = await loadElementsIfNeeded();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex <= 0) return;

    // Get element above and swap their orders
    const elementAbove = elements[currentIndex - 1];
    const currentOrder = element.order;
    const aboveOrder = elementAbove.order;
    
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      
      // Swap orders: set current element to above element's order
      await sourceElementApi.setElementOrder(element.id, aboveOrder, false);
      // Set above element to current element's order
      await sourceElementApi.setElementOrder(elementAbove.id, currentOrder, false);
      
      // Update data-order attributes in the DOM manually
      if (window.updateElementOrderInPreview) {
        window.updateElementOrderInPreview(element.id, aboveOrder);
        window.updateElementOrderInPreview(elementAbove.id, currentOrder);
      }
      
      // Update local cache
      const updatedCache = elementsCache.map(el => {
        if (el.id === element.id) return { ...el, order: aboveOrder };
        if (el.id === elementAbove.id) return { ...el, order: currentOrder };
        return el;
      });
      setElementsCache(updatedCache);
      
      // Reorder DOM elements
      if (window.reorderElementInPreview) {
        window.reorderElementInPreview(elementId, 'up');
      }
    } catch (error) {
      console.error('Failed to move element up:', error);
      // On error, refresh preview to restore correct state
      setPreviewKey(prev => prev + 1);
    }
  };

  const handlePreviewElementMoveDown = async (elementId) => {
    // Load elements to get order information
    const elements = await loadElementsIfNeeded();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex < 0 || currentIndex >= elements.length - 1) return;

    // Get element below and swap their orders
    const elementBelow = elements[currentIndex + 1];
    const currentOrder = element.order;
    const belowOrder = elementBelow.order;
    
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      
      // Swap orders: set current element to below element's order
      await sourceElementApi.setElementOrder(element.id, belowOrder, false);
      // Set below element to current element's order
      await sourceElementApi.setElementOrder(elementBelow.id, currentOrder, false);
      
      // Update data-order attributes in the DOM manually
      if (window.updateElementOrderInPreview) {
        window.updateElementOrderInPreview(element.id, belowOrder);
        window.updateElementOrderInPreview(elementBelow.id, currentOrder);
      }
      
      // Update local cache
      const updatedCache = elementsCache.map(el => {
        if (el.id === element.id) return { ...el, order: belowOrder };
        if (el.id === elementBelow.id) return { ...el, order: currentOrder };
        return el;
      });
      setElementsCache(updatedCache);
      
      // Reorder DOM elements
      if (window.reorderElementInPreview) {
        window.reorderElementInPreview(elementId, 'down');
      }
    } catch (error) {
      console.error('Failed to move element down:', error);
      // On error, refresh preview to restore correct state
      setPreviewKey(prev => prev + 1);
    }
  };

  const handlePreviewElementOrderChange = async (elementId, newOrder) => {
    try {
      const { sourceElementApi } = await import('../../source_element/services/sourceElementApi');
      // Use returnOrderOnly for faster response
      const orderData = await sourceElementApi.setElementOrder(elementId, newOrder, true);
      
      // Update local cache with returned order data
      if (Array.isArray(orderData) && elementsCache.length > 0) {
        const updatedCache = elementsCache.map(el => {
          const orderInfo = orderData.find(o => o.id === el.id);
          return orderInfo ? { ...el, order: orderInfo.order } : el;
        });
        setElementsCache(updatedCache);
      } else {
        // Fallback: clear cache if no order data returned
        setElementsCache([]);
      }
      
      // Refresh preview to show new order
      setPreviewKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to change element order:', error);
      // On error, refresh preview to restore correct state
      setPreviewKey(prev => prev + 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusChip = (status) => {
    if (!status) return <Chip label="Unknown" color="default" size="small" />;
    
    return (
      <Chip 
        label={getStatusDisplay(status)} 
        color={getStatusColor(status)} 
        size="small" 
      />
    );
  };

  // Simplified loading - only page info matters now
  if (!currentPage) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading page details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: 10 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/source-binders" underline="hover">
          Source Binders
        </Link>
        <Link 
          component={RouterLink} 
          to={`/source-binders/${binderId}`} 
          underline="hover"
        >
          {binderName || `Binder ${binderId}`}
        </Link>
        <Typography color="text.primary">
          {currentPage?.Name || currentPage?.name || `Page ${pageId}`}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentPage?.name || 'Source Page Details'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Page ID: {pageId} | Binder: {binderName || binderId}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Binder
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditPage}
            color="secondary"
          >
            Edit Page
          </Button>
        </Box>
      </Box>

      {/* Page Preview - Full Width */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">
                Page Preview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hover over elements to see actions • Click edit to modify • Use arrows to reorder
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={handleDownloadPdf}
              >
                Download PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddElement}
              >
                Add Element
              </Button>
            </Box>
          </Box>
          
          <PagePreview 
            key={previewKey} // Force re-render when preview needs refresh
            pageId={pageId} 
            cssUrl={currentPage?.cssFilePath || currentPage?.CssFilePath}
            onElementClick={handlePreviewElementClick}
            onElementDelete={handlePreviewElementDelete}
            onElementMoveUp={handlePreviewElementMoveUp}
            onElementMoveDown={handlePreviewElementMoveDown}
            onElementOrderChange={handlePreviewElementOrderChange}
            elementIds={elementsCache.map(el => el.id)}
          />
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add element"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleAddElement}
      >
        <AddIcon />
      </Fab>

      {/* Element Editor Dialog */}
      <ElementEditorDialog
        open={editorOpen}
        element={editingElement}
        isCreating={isCreatingNew}
        activeElementCount={elementsCache.length}
        onSave={handleEditorSave}
        onCancel={handleEditorCancel}
      />
    </Box>
  );
};

export default SourcePageDetailsPage;
