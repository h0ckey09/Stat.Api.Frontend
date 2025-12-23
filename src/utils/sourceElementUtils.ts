import {
  RawSourceElementData,
  SourceElement,
  SourceElementStatus,
  SourceElementType,
  SourceElementFilters,
  SourceElementSort
} from '../types/sourceElement';

/**
 * Utility functions for working with source element data
 * These functions handle the normalization of backend data
 */

/**
 * Normalizes raw source element data from the API into a consistent format
 * @param raw - Raw data from the backend API
 * @returns Normalized SourceElement object
 */
export const normalizeSourceElement = (raw: RawSourceElementData): SourceElement => {
  return {
    id: raw.Id,
    sourcePageId: raw.SourcePage,
    order: raw.Order,
    label: raw.Label || '',
    elementTypeId: raw.ElementTypeId,
    elementTypeLabel: raw.ElementTypeLabel || '',
    elementData: raw.ElementData || '',
    editorNotes: raw.EditorNotes || '',
    editedDateTime: raw.EditedDateTime ? new Date(raw.EditedDateTime) : null,
    reviewerApproved: raw.ReviewerApproved || false,
    reviewerNotes: raw.ReviewerNotes,
    isDisabled: raw.IsDisabled || false,
    isSuperseded: raw.IsSuperseded || false,
    isActiveClone: raw.IsActiveClone || false,
    cloneOfElementId: raw.CloneOfElementId,
    reviewStatusId: raw.ReviewStatusId,
    reviewStatusLabel: raw.ReviewStatusLabel,
    reviewStatusForecolor: raw.ReviewStatusForecolor,
    reviewStatusBackColor: raw.ReviewStatusBackColor,
    isSelected: raw.IsSelected_FOR_UI_ONLY || false,
    page: raw.Page || null,
    lastEditedBy: raw.LastEditedBy,
    reviewedBy: raw.ReviewedBy
  };
};

/**
 * Normalizes array of raw source element data
 * @param rawElements - Array of raw source element data
 * @returns Array of normalized SourceElement objects
 */
export const normalizeSourceElements = (rawElements: RawSourceElementData[]): SourceElement[] => {
  if (!Array.isArray(rawElements)) {
    console.warn('normalizeSourceElements: Expected array, received:', typeof rawElements);
    return [];
  }
  
  return rawElements.map(normalizeSourceElement);
};

/**
 * Gets the computed status of a source element based on its properties
 * @param element - Source element to get status for
 * @returns Computed status
 */
export const getElementStatus = (element: SourceElement): SourceElementStatus => {
  if (element.isDisabled) {
    return SourceElementStatus.DISABLED;
  }
  
  if (element.isSuperseded) {
    return SourceElementStatus.SUPERSEDED;
  }
  
  if (element.reviewerApproved) {
    return SourceElementStatus.APPROVED;
  }
  
  if (element.reviewStatusLabel) {
    const status = element.reviewStatusLabel.toLowerCase();
    if (status.includes('reject')) {
      return SourceElementStatus.REJECTED;
    }
    if (status.includes('pending') || status.includes('review')) {
      return SourceElementStatus.PENDING_REVIEW;
    }
  }
  
  return SourceElementStatus.DRAFT;
};

/**
 * Gets the display text for a source element status
 * @param status - The element status
 * @returns Human-readable status text
 */
export const getStatusDisplay = (status: SourceElementStatus): string => {
  switch (status) {
    case SourceElementStatus.DRAFT:
      return 'Draft';
    case SourceElementStatus.PENDING_REVIEW:
      return 'Pending Review';
    case SourceElementStatus.APPROVED:
      return 'Approved';
    case SourceElementStatus.REJECTED:
      return 'Rejected';
    case SourceElementStatus.DISABLED:
      return 'Disabled';
    case SourceElementStatus.SUPERSEDED:
      return 'Superseded';
    default:
      return 'Unknown';
  }
};

/**
 * Gets the color for a source element status
 * @param status - The element status
 * @returns Material-UI color for chips/badges
 */
export const getStatusColor = (status: SourceElementStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case SourceElementStatus.DRAFT:
      return 'default';
    case SourceElementStatus.PENDING_REVIEW:
      return 'warning';
    case SourceElementStatus.APPROVED:
      return 'success';
    case SourceElementStatus.REJECTED:
      return 'error';
    case SourceElementStatus.DISABLED:
      return 'secondary';
    case SourceElementStatus.SUPERSEDED:
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Gets the display text for an element type
 * @param elementTypeLabel - The element type label
 * @returns Human-readable type text
 */
export const getElementTypeDisplay = (elementTypeLabel: string): string => {
  if (!elementTypeLabel) return 'Unknown';
  
  // Convert from backend format to user-friendly format
  return elementTypeLabel
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formats a date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString();
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Filters source elements based on provided criteria
 * @param elements - Array of source elements to filter
 * @param filters - Filter criteria
 * @returns Filtered array of source elements
 */
export const filterSourceElements = (
  elements: SourceElement[],
  filters: SourceElementFilters
): SourceElement[] => {
  return elements.filter(element => {
    if (filters.sourcePageId && element.sourcePageId !== filters.sourcePageId) {
      return false;
    }
    
    if (filters.elementTypeId && element.elementTypeId !== filters.elementTypeId) {
      return false;
    }
    
    if (filters.status && getElementStatus(element) !== filters.status) {
      return false;
    }
    
    if (filters.reviewerApproved !== undefined && element.reviewerApproved !== filters.reviewerApproved) {
      return false;
    }
    
    if (filters.isDisabled !== undefined && element.isDisabled !== filters.isDisabled) {
      return false;
    }
    
    if (filters.isSuperseded !== undefined && element.isSuperseded !== filters.isSuperseded) {
      return false;
    }
    
    if (filters.lastEditedBy && element.lastEditedBy?.Id !== filters.lastEditedBy) {
      return false;
    }
    
    if (filters.reviewedBy && element.reviewedBy?.Id !== filters.reviewedBy) {
      return false;
    }
    
    return true;
  });
};

/**
 * Sorts source elements based on provided criteria
 * @param elements - Array of source elements to sort
 * @param sort - Sort criteria
 * @returns Sorted array of source elements
 */
export const sortSourceElements = (
  elements: SourceElement[],
  sort: SourceElementSort
): SourceElement[] => {
  return [...elements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sort.field) {
      case 'order':
        aValue = a.order;
        bValue = b.order;
        break;
      case 'label':
        aValue = a.label.toLowerCase();
        bValue = b.label.toLowerCase();
        break;
      case 'editedDateTime':
        aValue = a.editedDateTime?.getTime() || 0;
        bValue = b.editedDateTime?.getTime() || 0;
        break;
      case 'elementTypeLabel':
        aValue = a.elementTypeLabel.toLowerCase();
        bValue = b.elementTypeLabel.toLowerCase();
        break;
      case 'reviewStatusLabel':
        aValue = (a.reviewStatusLabel || '').toLowerCase();
        bValue = (b.reviewStatusLabel || '').toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return sort.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sort.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Groups source elements by a specified field
 * @param elements - Array of source elements to group
 * @param groupBy - Field to group by
 * @returns Object with grouped elements
 */
export const groupSourceElements = (
  elements: SourceElement[],
  groupBy: 'elementTypeLabel' | 'status' | 'reviewerApproved' | 'lastEditedBy'
): Record<string, SourceElement[]> => {
  return elements.reduce((groups, element) => {
    let key: string;
    
    switch (groupBy) {
      case 'elementTypeLabel':
        key = element.elementTypeLabel || 'Unknown';
        break;
      case 'status':
        key = getStatusDisplay(getElementStatus(element));
        break;
      case 'reviewerApproved':
        key = element.reviewerApproved ? 'Approved' : 'Not Approved';
        break;
      case 'lastEditedBy':
        key = element.lastEditedBy?.Name || 'Unknown';
        break;
      default:
        key = 'Other';
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(element);
    
    return groups;
  }, {} as Record<string, SourceElement[]>);
};

/**
 * Gets statistics for source elements
 * @param elements - Array of source elements
 * @returns Statistics object
 */
export const getElementStatistics = (elements: SourceElement[]) => {
  const stats = {
    total: elements.length,
    draft: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    disabled: 0,
    superseded: 0,
    byType: {} as Record<string, number>,
    avgOrder: 0
  };
  
  let totalOrder = 0;
  
  elements.forEach(element => {
    const status = getElementStatus(element);
    switch (status) {
      case SourceElementStatus.DRAFT:
        stats.draft++;
        break;
      case SourceElementStatus.PENDING_REVIEW:
        stats.pendingReview++;
        break;
      case SourceElementStatus.APPROVED:
        stats.approved++;
        break;
      case SourceElementStatus.REJECTED:
        stats.rejected++;
        break;
      case SourceElementStatus.DISABLED:
        stats.disabled++;
        break;
      case SourceElementStatus.SUPERSEDED:
        stats.superseded++;
        break;
    }
    
    // Count by type
    const type = element.elementTypeLabel || 'Unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    totalOrder += element.order;
  });
  
  stats.avgOrder = elements.length > 0 ? totalOrder / elements.length : 0;
  
  return stats;
};
