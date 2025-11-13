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
  Chip,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';

/**
 * Table component for displaying source pages
 * @param {Object} props - Component props
 * @param {Array} props.sourcePages - Array of source page objects
 * @param {Function} props.onViewDetails - Callback for view details action
 * @param {Function} props.onEdit - Callback for edit action
 * @param {Function} props.onDelete - Callback for delete action
 * @param {Function} props.onRemoveFromBinder - Callback for removing from binder (if in binder context)
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.showBinderActions - Whether to show binder-specific actions
 * @param {string} props.emptyMessage - Custom message when no pages found
 */
const SourcePageTable = ({ 
  sourcePages = [], 
  onViewDetails, 
  onEdit, 
  onDelete,
  onRemoveFromBinder,
  loading = false,
  showBinderActions = false,
  emptyMessage = 'No source pages found'
}) => {
  const getStatusColor = (page) => {
    const status = page.status || (page.isActive ? 'active' : 'inactive');
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'error':
        return 'error';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (page) => {
    return page.status || (page.isActive ? 'Active' : 'Inactive');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading source pages...
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table stickyHeader aria-label="source pages table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Content Preview</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Last Modified</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sourcePages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            sourcePages.map((page, index) => (
              <TableRow
                key={page.id || page.pageId || index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {page.id || page.pageId || index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {page.title || page.pageName || page.name || 'Untitled Page'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {truncateText(page.content || page.description || page.preview)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={getStatusText(page)}
                    color={getStatusColor(page)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(
                      page.created || 
                      page.createdAt || 
                      page.dateCreated
                    )}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(
                      page.modified || 
                      page.updatedAt || 
                      page.lastModified ||
                      page.dateModified
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    {onViewDetails && (
                      <IconButton 
                        size="small"
                        onClick={() => onViewDetails(page)}
                        title="View Details"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onEdit && (
                      <IconButton 
                        size="small"
                        color="primary"
                        onClick={() => onEdit(page)}
                        title="Edit Page"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {showBinderActions && onRemoveFromBinder && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => onRemoveFromBinder(page)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Remove
                      </Button>
                    )}
                    {onDelete && (
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => onDelete(page)}
                        title="Delete Page"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

export default SourcePageTable;
