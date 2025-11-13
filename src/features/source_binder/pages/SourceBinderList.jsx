import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSourceBinders } from '../hooks/useSourceBinders';
import SourceBinderTable from '../components/SourceBinderTable.jsx';

/**
 * Source Binder List Page Component
 */
const SourceBinderList = () => {
  const navigate = useNavigate();
  const {
    sourceBinders,
    loading,
    error,
    loadSourceBinders,
    refreshSourceBinders,
    clearError
  } = useSourceBinders();

  useEffect(() => {
    loadSourceBinders().catch((error) => {
      // Handle authentication errors
      if (error.message && error.message.includes('Not authenticated')) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleViewDetails = (binder) => {
    const binderId = binder.id || binder.binderId;
    if (binderId) {
      navigate(`/source-binders/${binderId}`);
    }
  };

  const handleEdit = (binder) => {
    const binderId = binder.id || binder.binderId;
    if (binderId) {
      navigate(`/source-binders/${binderId}/edit`);
    }
  };

  const handleDelete = async (binder) => {
    const binderId = binder.id || binder.binderId;
    const binderName = binder.name || binder.binderName || 'this binder';
    
    if (binderId && window.confirm(`Are you sure you want to delete ${binderName}?`)) {
      try {
        // You would implement delete functionality here
        // await deleteSourceBinder(binderId);
        console.log('Delete functionality not implemented yet');
        // refreshSourceBinders();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleCreateNew = () => {
    navigate('/source-binders/new');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Source Binders
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={refreshSourceBinders}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateNew}
          >
            Create New Binder
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={clearError}
          action={
            <Button color="inherit" size="small" onClick={refreshSourceBinders}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <SourceBinderTable
            sourceBinders={sourceBinders}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Summary info */}
      {sourceBinders.length > 0 && !loading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {sourceBinders.length} source binder(s)
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SourceBinderList;
