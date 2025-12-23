import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useSourceBinder, useSourcePages } from '../hooks/useSourceBinders.ts';
import AddPageDialog from '../components/AddPageDialog.jsx';
import { 
  formatDate, 
  getStatusDisplay, 
  getStatusColor, 
  getTypeDisplay 
} from '../../../utils/sourceBinderUtils';

const SourceBinderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addPageDialogOpen, setAddPageDialogOpen] = useState(false);
  
  const {
    sourceBinder,
    loading: binderLoading,
    error: binderError,
    loadSourceBinder,
    clearError: clearBinderError
  } = useSourceBinder(id);

  // Hook for source pages
  const {
    sourcePages,
    loading: pagesLoading,
    error: pagesError,
    loadSourcePages,
    clearError: clearPagesError
  } = useSourcePages(id);

  // Track if initial data has been loaded to prevent multiple calls
  const loadingRef = useRef(false);
  const lastLoadedId = useRef(null);

  // Load data on component mount or when ID changes
  useEffect(() => {
    // Skip if already loading or already loaded this ID
    if (loadingRef.current || lastLoadedId.current === id) {
      console.log('⏩ Skipping duplicate load for binder ID:', id);
      return;
    }
    
    if (!id) return;
    
    const loadData = async () => {
      loadingRef.current = true;
      lastLoadedId.current = id;
      
      try {
        await Promise.all([
          loadSourceBinder(),
          loadSourcePages()
        ]);
      } finally {
        loadingRef.current = false;
      }
    };
    
    loadData();
  }, [id]);

  const handleBack = () => {
    navigate('/source-binders');
  };

  const handleEdit = () => {
    navigate(`/source-binders/${id}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete binder:', id);
  };

  const handleAddPage = () => {
    setAddPageDialogOpen(true);
  };

  const handleAddPageSubmit = async (pageData) => {
    try {
      const { sourcePageApi } = await import('../../source_page/services/sourcePageApi');
      await sourcePageApi.createSourcePage(pageData);
      setAddPageDialogOpen(false);
      loadSourcePages(); // Refresh the page list
    } catch (error) {
      console.error('Failed to create page:', error);
      // Error will be shown in the dialog
    }
  };

  const handleViewPage = (page) => {
    const pageId = page.id || page.pageId;
    navigate(`/source-binders/${id}/pages/${pageId}`);
  };

  const handleEditPage = (page) => {
    const pageId = page.id || page.pageId;
    navigate(`/source-binders/${id}/pages/${pageId}/edit`);
  };

  const handleRefreshPages = () => {
    loadSourcePages();
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

  const loading = binderLoading;
  const error = binderError || pagesError;

  if (loading && !sourceBinder) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading source binder details...</Typography>
      </Box>
    );
  }

  if (error && !sourceBinder) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load source binder: {error}
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Back to Source Binders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/source-binders" underline="hover">
          Source Binders
        </Link>
        <Typography color="text.primary">
          {sourceBinder?.name || `Binder ${id}`}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {sourceBinder?.name || 'Source Binder Details'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ID: {sourceBinder?.id || id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            color="secondary"
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Error Alerts */}
      {binderError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearBinderError}>
          Binder Error: {binderError}
        </Alert>
      )}
      {pagesError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearPagesError}>
          Pages Error: {pagesError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Binder Properties */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Binder Properties
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {sourceBinder?.name || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {sourceBinder?.description || 'No description available'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  {getStatusChip(sourceBinder?.status)}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body1">
                    v{sourceBinder?.version || 1}
                    {sourceBinder?.protocolVersion && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        (Protocol: {sourceBinder.protocolVersion})
                      </Typography>
                    )}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Owner
                  </Typography>
                  <Typography variant="body1">
                    {sourceBinder?.owner?.Name || 'Unknown'}
                  </Typography>
                </Box>
                
                {sourceBinder?.sponsor && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sponsor
                    </Typography>
                    <Typography variant="body1">
                      {sourceBinder.sponsor.Name}
                    </Typography>
                  </Box>
                )}
                
                {sourceBinder?.study && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Study
                    </Typography>
                    <Typography variant="body1">
                      {sourceBinder.study.Name}
                    </Typography>
                  </Box>
                )}
                
                {sourceBinder?.protocolVersionDate && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Protocol Version Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(sourceBinder.protocolVersionDate)}
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(sourceBinder?.lastModifiedDate)}
                  </Typography>
                </Box>
                
                {sourceBinder?.tags && sourceBinder.tags.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {sourceBinder.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Pages
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {sourceBinder?.pageCount || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Active Pages
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {sourceBinder?.activePageCount || 0}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Inactive Pages
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {sourceBinder?.inactivePageCount || 0}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Draft Pages
                    </Typography>
                    <Typography variant="h6" color="info.main">
                      {sourceBinder?.draftPageCount || 0}
                    </Typography>
                  </Box>
                </Box>
                
                {sourceBinder?.createdDate && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(sourceBinder.createdDate)}
                    </Typography>
                  </Box>
                )}
                
                {sourceBinder?.lastModifiedDate && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Modified
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(sourceBinder.lastModifiedDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Associated Pages */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Associated Pages ({sourceBinder?.pageCount || 0})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefreshPages}
                    disabled={pagesLoading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddPage}
                  >
                    Add Page
                  </Button>
                </Box>
              </Box>

              {pagesLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Loading pages...</Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Version</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(!sourcePages || sourcePages.length === 0) ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                              No pages found for this binder
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sourcePages.map((page, index) => (
                          <TableRow key={page.id || index} hover>
                            <TableCell>
                              <Typography variant="body1">
                                {page.name || 'Unnamed Page'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {getStatusChip(page.status)}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                v. {page.version || -1}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="View Page">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleViewPage(page)}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Page Dialog */}
      <AddPageDialog
        open={addPageDialogOpen}
        onClose={() => setAddPageDialogOpen(false)}
        onAdd={handleAddPageSubmit}
        binderId={id}
        studyId={sourceBinder?.study?.Id || sourceBinder?.study?.id}
      />
    </Box>
  );
};

export default SourceBinderDetailsPage;
