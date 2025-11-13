import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSourceBinders } from '../hooks/useSourceBinders.ts';
import { 
  formatDate, 
  getStatusDisplay, 
  getStatusColor, 
  getTypeDisplay 
} from '../../../utils/sourceBinderUtils';

const SourceBinderListPage = () => {
  const navigate = useNavigate();
  const {
    sourceBinders,
    loading,
    error,
    loadSourceBinders,
    refreshSourceBinders,
    clearError
  } = useSourceBinders();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load data on component mount
  useEffect(() => {
    loadSourceBinders().catch((error) => {
      console.error('Failed to load source binders:', error);
    });
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  const handleViewBinder = (binder) => {
    const binderId = binder.id;
    if (binderId) {
      navigate(`/source-binders/${binderId}`);
    }
  };

  const handleAddBinder = () => {
    navigate('/source-binders/new');
  };

  const handleEditBinder = (binder) => {
    const binderId = binder.id;
    if (binderId) {
      navigate(`/source-binders/${binderId}/edit`);
    }
  };

  const handleRefresh = () => {
    refreshSourceBinders();
  };

  // Calculate pagination
  const paginatedBinders = sourceBinders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  if (loading && sourceBinders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading source binders...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Source Binders
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBinder}
          >
            Add New Binder
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Page Size Selector */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Source Binders ({sourceBinders.length})
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Items per page</InputLabel>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                label="Items per page"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Version</strong></TableCell>
                  <TableCell><strong>Pages</strong></TableCell>
                  <TableCell><strong>Owner</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBinders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                        {loading ? 'Loading...' : 'No source binders found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBinders.map((binder, index) => (
                    <TableRow key={binder.id || index} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {binder.id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {binder.name || 'Unnamed Binder'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {binder.description || 'No description available'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(binder.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          v{binder.version || 1}
                          {binder.protocolVersion && (
                            <Typography component="div" variant="caption" color="text.secondary">
                              Protocol: {binder.protocolVersion}
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          <strong>{binder.pageCount || 0}</strong> total
                          {(binder.finalPageCount > 0 || binder.draftPageCount > 0) && (
                            <Typography component="div" variant="caption" color="text.secondary">
                              {binder.finalPageCount || 0} final, {binder.draftPageCount || 0} draft
                              {binder.needingReviewedPageCount > 0 && (
                                <div>{binder.needingReviewedPageCount} need review</div>
                              )}
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {binder.owner?.Name || 'Unknown'}
                          {binder.sponsor && (
                            <Typography component="div" variant="caption" color="text.secondary">
                              Sponsor: {binder.sponsor.Name}
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewBinder(binder)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Binder">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleEditBinder(binder)}
                            >
                              <EditIcon />
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

          {/* Pagination */}
          {sourceBinders.length > 0 && (
            <TablePagination
              component="div"
              count={sourceBinders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SourceBinderListPage;
