import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip
} from '@mui/material';

/**
 * Table component for displaying source binders
 * @param {Object} props - Component props
 * @param {Array} props.sourceBinders - Array of source binder objects
 * @param {Function} props.onViewDetails - Callback for view details action
 * @param {Function} props.onEdit - Callback for edit action
 * @param {Function} props.onDelete - Callback for delete action
 * @param {boolean} props.loading - Loading state
 */
const SourceBinderTable = ({ 
  sourceBinders = [], 
  onViewDetails, 
  onEdit, 
  onDelete,
  loading = false 
}) => {
  const getStatusColor = (binder) => {
    const status = binder.status || (binder.isActive ? 'active' : 'inactive');
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (binder) => {
    return binder.status || (binder.isActive ? 'Active' : 'Inactive');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading source binders...
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table stickyHeader aria-label="source binders table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sourceBinders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No source binders found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            sourceBinders.map((binder, index) => (
              <TableRow
                key={binder.id || binder.binderId || index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {binder.id || binder.binderId || index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {binder.name || binder.binderName || 'Unnamed Binder'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {binder.type || binder.binderType || 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={getStatusText(binder)}
                    color={getStatusColor(binder)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(
                      binder.created || 
                      binder.createdAt || 
                      binder.dateCreated
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {onViewDetails && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => onViewDetails(binder)}
                      >
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="primary"
                        onClick={() => onEdit(binder)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="error"
                        onClick={() => onDelete(binder)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SourceBinderTable;
