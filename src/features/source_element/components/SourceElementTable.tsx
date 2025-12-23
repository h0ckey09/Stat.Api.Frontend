import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CloneIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  DragIndicator as DragIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { SourceElement, SourceElementFilters, SourceElementSort } from '../../../types/sourceElement';
import { 
  getElementStatus, 
  getStatusDisplay, 
  getStatusColor,
  getElementTypeDisplay,
  formatDate,
  filterSourceElements,
  sortSourceElements
} from '../../../utils/sourceElementUtils';

interface SourceElementTableProps {
  elements: SourceElement[];
  loading?: boolean;
  onEdit?: (element: SourceElement) => void;
  onDelete?: (element: SourceElement) => void;
  onClone?: (element: SourceElement) => void;
  onReview?: (element: SourceElement, approved: boolean) => void;
  onView?: (element: SourceElement) => void;
  showActions?: boolean;
  showFilters?: boolean;
  showReviewActions?: boolean;
  canReorder?: boolean;
}

const SourceElementTable: React.FC<SourceElementTableProps> = ({
  elements = [],
  loading = false,
  onEdit,
  onDelete,
  onClone,
  onReview,
  onView,
  showActions = true,
  showFilters = true,
  showReviewActions = false,
  canReorder = false
}) => {
  const [filters, setFilters] = useState<SourceElementFilters>({});
  const [sort, setSort] = useState<SourceElementSort>({
    field: 'order',
    direction: 'asc'
  });

  // Apply filters and sorting
  const processedElements = useMemo(() => {
    let filtered = filterSourceElements(elements, filters);
    return sortSourceElements(filtered, sort);
  }, [elements, filters, sort]);

  const handleFilterChange = (field: keyof SourceElementFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handleSortChange = (field: SourceElementSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getUniqueElementTypes = () => {
    const types = [...new Set(elements.map(el => el.elementTypeLabel))];
    return types.filter(Boolean).sort();
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading source elements...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Source Elements ({processedElements.length})
          </Typography>
        </Box>

        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Element Type</InputLabel>
              <Select
                value={filters.elementTypeId || ''}
                onChange={(e) => handleFilterChange('elementTypeId', e.target.value)}
                label="Element Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {getUniqueElementTypes().map(type => (
                  <MenuItem key={type} value={type}>
                    {getElementTypeDisplay(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending_review">Pending Review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
                <MenuItem value="superseded">Superseded</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.reviewerApproved === true}
                  onChange={(e) => handleFilterChange('reviewerApproved', e.target.checked ? true : undefined)}
                />
              }
              label="Approved Only"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.isDisabled === false}
                  onChange={(e) => handleFilterChange('isDisabled', e.target.checked ? false : undefined)}
                />
              }
              label="Enabled Only"
            />
          </Box>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {canReorder && <TableCell width={40}></TableCell>}
                <TableCell 
                  sortDirection={sort.field === 'label' ? sort.direction : false}
                  onClick={() => handleSortChange('label')}
                  sx={{ cursor: 'pointer', maxWidth: 150 }}
                >
                  Label
                </TableCell>
                <TableCell 
                  sortDirection={sort.field === 'elementTypeLabel' ? sort.direction : false}
                  onClick={() => handleSortChange('elementTypeLabel')}
                  sx={{ cursor: 'pointer' }}
                >
                  Type
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell 
                  sortDirection={sort.field === 'editedDateTime' ? sort.direction : false}
                  onClick={() => handleSortChange('editedDateTime')}
                  sx={{ cursor: 'pointer' }}
                >
                  Last Edited
                </TableCell>
                {showReviewActions && <TableCell>Review</TableCell>}
                {showActions && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {processedElements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 6 : 5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No source elements found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                processedElements.map((element) => {
                  const status = getElementStatus(element);
                  return (
                    <TableRow key={element.id} hover>
                      {canReorder && (
                        <TableCell>
                          <IconButton size="small" sx={{ cursor: 'grab' }}>
                            <DragIcon />
                          </IconButton>
                        </TableCell>
                      )}
                      <TableCell sx={{ maxWidth: 150 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: element.isSelected ? 'bold' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {element.label || 'Untitled'}
                        </Typography>
                        {element.editorNotes && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {element.editorNotes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getElementTypeDisplay(element.elementTypeLabel)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusDisplay(status)}
                          color={getStatusColor(status)}
                          size="small"
                          variant={element.isSuperseded ? 'outlined' : 'filled'}
                        />
                        {element.isDisabled && (
                          <Chip
                            label="Disabled"
                            color="secondary"
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(element.editedDateTime)}
                        </Typography>
                      </TableCell>
                      {showReviewActions && (
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => onReview?.(element, true)}
                                disabled={element.reviewerApproved}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onReview?.(element, false)}
                                disabled={element.reviewerApproved}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                      {showActions && (
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            {onView && (
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onView(element)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onEdit && (
                              <Tooltip title="Edit Element">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEdit(element)}
                                  disabled={element.isSuperseded}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onClone && (
                              <Tooltip title="Clone Element">
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() => onClone(element)}
                                >
                                  <CloneIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onDelete && (
                              <Tooltip title="Delete Element">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => onDelete(element)}
                                  disabled={element.isSuperseded || element.reviewerApproved}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SourceElementTable;
