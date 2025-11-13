import {
  RawSourceBinderData,
  SourceBinder,
  SourceBinderStatus,
  SourceBinderType,
  // Source Page types
  SourcePage,
  SourcePageStatus,
  RawSourcePageData,
  CssFileType,
  PageInfo
} from '../types/sourceBinder';

/**
 * Utility functions for working with source binder data
 * These functions handle the normalization of inconsistent backend data
 */

/**
 * Normalizes raw source binder data from the API into a consistent format
 * Handles both proper backend BinderInfo and legacy inconsistent data
 * @param raw - Raw data from the backend API
 * @returns Normalized SourceBinder object
 */
export const normalizeSourceBinder = (raw: RawSourceBinderData): SourceBinder => {
  // Check if this is a proper BinderInfo from backend
  const isBackendBinderInfo = raw.Id !== undefined && raw.Name !== undefined;
  
  if (isBackendBinderInfo) {
    // Handle proper backend BinderInfo structure
    return {
      id: raw.Id!,
      name: raw.Name!,
      description: raw.Description || '',
      version: raw.Version || 1,
      isActive: raw.IsActive || false,
      status: raw.IsActive ? 'active' : 'inactive',
      type: 'other', // Backend doesn't specify type, defaulting to 'other'
      
      // Page count details from backend
      pageCount: raw.PageCount || 0,
      finalPageCount: raw.FinalPageCount || 0,
      draftPageCount: raw.DraftPageCount || 0,
      rescindedPageCount: raw.RescindedPageCount || 0,
      needingReviewedPageCount: raw.NeedingReviewedPageCount || 0,
      
      // Ownership and metadata from backend
      owner: raw.Owner || { Id: 0, Name: 'Unknown' },
      protocolVersion: raw.ProtocolVersion || '',
      protocolVersionDate: raw.ProtocolVersionDate || null,
      sponsor: raw.Sponsor || null,
      study: raw.Study || null,
      
      // Additional properties
      createdDate: raw.ProtocolVersionDate ? normalizeDate(raw.ProtocolVersionDate) : '',
      url: raw.url,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      metadata: raw.metadata || {}
    };
  } else {
    // Handle legacy inconsistent data structure
    return {
      id: Number(raw.id || raw.binderId || 0),
      name: raw.name || raw.binderName || raw.title || 'Unnamed Binder',
      description: raw.description || raw.summary || '',
      version: 1,
      isActive: raw.isActive || raw.IsActive || false,
      status: normalizeStatus(raw.status || raw.state || (raw.isActive ? 'active' : 'inactive')),
      type: normalizeType(raw.type || raw.binderType || 'other'),
      
      // Page count (legacy structure)
      pageCount: raw.pageCount || raw.page_count || (raw.pages ? raw.pages.length : 0) || 0,
      finalPageCount: 0,
      draftPageCount: 0,
      rescindedPageCount: 0,
      needingReviewedPageCount: 0,
      
      // Default owner structure
      owner: { Id: 0, Name: raw.owner || 'Unknown' },
      protocolVersion: '',
      protocolVersionDate: null,
      sponsor: null,
      study: null,
      
      // Additional properties
      createdDate: normalizeDate(
        raw.createdDate || 
        raw.created_at || 
        raw.dateCreated || 
        raw.created
      ),
      updatedDate: normalizeDate(
        raw.updatedDate || 
        raw.updated_at || 
        raw.lastModified
      ),
      url: raw.url,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      metadata: raw.metadata || {}
    };
  }
};

/**
 * Normalizes an array of raw source binder data
 * @param rawBinders - Array of raw binder data from API
 * @returns Array of normalized SourceBinder objects
 */
export const normalizeSourceBinders = (rawBinders: RawSourceBinderData[]): SourceBinder[] => {
  if (!Array.isArray(rawBinders)) {
    console.warn('normalizeSourceBinders: Expected array, received:', typeof rawBinders);
    return [];
  }
  
  return rawBinders.map(normalizeSourceBinder);
};

/**
 * Normalizes status string to consistent SourceBinderStatus
 * @param status - Raw status string
 * @returns Normalized SourceBinderStatus
 */
export const normalizeStatus = (status: string | boolean | undefined): SourceBinderStatus => {
  if (typeof status === 'boolean') {
    return status ? 'active' : 'inactive';
  }
  
  if (typeof status !== 'string') {
    return 'inactive';
  }
  
  const normalized = status.toLowerCase().trim();
  
  switch (normalized) {
    case 'active':
    case 'enabled':
    case 'live':
    case 'running':
      return 'active';
    case 'inactive':
    case 'disabled':
    case 'stopped':
      return 'inactive';
    case 'draft':
    case 'unpublished':
      return 'draft';
    case 'pending':
    case 'processing':
    case 'waiting':
      return 'pending';
    case 'archived':
    case 'deleted':
      return 'archived';
    case 'error':
    case 'failed':
    case 'broken':
      return 'error';
    default:
      return 'inactive';
  }
};

/**
 * Normalizes type string to consistent SourceBinderType
 * @param type - Raw type string
 * @returns Normalized SourceBinderType
 */
export const normalizeType = (type: string | undefined): SourceBinderType => {
  if (typeof type !== 'string') {
    return 'other';
  }
  
  const normalized = type.toLowerCase().trim();
  
  switch (normalized) {
    case 'document':
    case 'doc':
    case 'pdf':
    case 'text':
      return 'document';
    case 'database':
    case 'db':
    case 'sql':
    case 'nosql':
      return 'database';
    case 'api':
    case 'rest':
    case 'graphql':
    case 'service':
      return 'api';
    case 'file':
    case 'files':
    case 'filesystem':
      return 'file';
    case 'web':
    case 'website':
    case 'url':
    case 'link':
      return 'web';
    default:
      return 'other';
  }
};

/**
 * Normalizes date string to consistent ISO format
 * @param date - Raw date string or timestamp
 * @returns ISO date string or empty string if invalid
 */
export const normalizeDate = (date: string | number | Date | undefined): string => {
  if (!date) return '';
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return '';
    }
    return parsedDate.toISOString();
  } catch (error) {
    console.warn('normalizeDate: Invalid date format:', date);
    return '';
  }
};

/**
 * Formats a date for display in the UI
 * @param date - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (date: string | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }
    
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Gets a human-readable status display string
 * @param status - SourceBinderStatus
 * @returns Display string with appropriate capitalization
 */
export const getStatusDisplay = (status: SourceBinderStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'draft':
      return 'Draft';
    case 'pending':
      return 'Pending';
    case 'archived':
      return 'Archived';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

/**
 * Gets a human-readable type display string
 * @param type - SourceBinderType
 * @returns Display string with appropriate capitalization
 */
export const getTypeDisplay = (type: SourceBinderType): string => {
  switch (type) {
    case 'document':
      return 'Document';
    case 'database':
      return 'Database';
    case 'api':
      return 'API';
    case 'file':
      return 'File';
    case 'web':
      return 'Web';
    case 'other':
      return 'Other';
    default:
      return 'Unknown';
  }
};

/**
 * Gets a color for status display (for chips, badges, etc.)
 * @param status - SourceBinderStatus
 * @returns Color name compatible with Material-UI
 */
export const getStatusColor = (status: SourceBinderStatus): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'error':
      return 'error';
    case 'pending':
    case 'draft':
      return 'warning';
    case 'inactive':
    case 'archived':
      return 'default';
    default:
      return 'info';
  }
};

/**
 * Validates source binder data for creation/update
 * @param data - Source binder data to validate
 * @returns Validation result with any errors
 */
export const validateSourceBinderData = (data: Partial<SourceBinder>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (data.name && data.name.length > 255) {
    errors.push('Name must be less than 255 characters');
  }
  
  if (data.description && data.description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }
  
  if (data.url && !isValidUrl(data.url)) {
    errors.push('URL must be a valid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a string is a valid URL
 * @param url - URL string to validate
 * @returns true if valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates a default SourceBinder object with minimal required properties
 * @param overrides - Optional property overrides
 * @returns Default SourceBinder object
 */
export const createDefaultSourceBinder = (overrides: Partial<SourceBinder> = {}): SourceBinder => {
  return {
    id: 0,
    name: '',
    description: '',
    version: 1,
    isActive: false,
    status: 'draft',
    type: 'other',
    pageCount: 0,
    finalPageCount: 0,
    draftPageCount: 0,
    rescindedPageCount: 0,
    needingReviewedPageCount: 0,
    owner: { Id: 0, Name: '' },
    protocolVersion: '',
    protocolVersionDate: null,
    sponsor: null,
    study: null,
    createdDate: new Date().toISOString(),
    tags: [],
    metadata: {},
    ...overrides
  };
};

/**
 * Filters source binders based on search criteria
 * @param binders - Array of source binders to filter
 * @param searchTerm - Search term to match against name and description
 * @param filters - Additional filter criteria
 * @returns Filtered array of source binders
 */
export const filterSourceBinders = (
  binders: SourceBinder[],
  searchTerm: string = '',
  filters: {
    status?: SourceBinderStatus[];
    type?: SourceBinderType[];
    tags?: string[];
  } = {}
): SourceBinder[] => {
  return binders.filter(binder => {
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        binder.name.toLowerCase().includes(term) ||
        binder.description.toLowerCase().includes(term) ||
        (binder.tags || []).some(tag => tag.toLowerCase().includes(term));
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(binder.status)) {
        return false;
      }
    }
    
    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(binder.type)) {
        return false;
      }
    }
    
    // Tags filter (binder must have at least one of the specified tags)
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(filterTag => 
        (binder.tags || []).some(binderTag => 
          binderTag.toLowerCase().includes(filterTag.toLowerCase())
        )
      );
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });
};

/**
 * Sorts source binders by specified criteria
 * @param binders - Array of source binders to sort
 * @param sortBy - Property to sort by
 * @param sortOrder - Sort direction
 * @returns Sorted array of source binders
 */
export const sortSourceBinders = (
  binders: SourceBinder[],
  sortBy: keyof SourceBinder,
  sortOrder: 'asc' | 'desc' = 'asc'
): SourceBinder[] => {
  return [...binders].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1;
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const result = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? result : -result;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const result = aValue - bValue;
      return sortOrder === 'asc' ? result : -result;
    }
    
    // Handle dates
    if (sortBy.includes('Date') || sortBy.includes('date')) {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      const result = aDate.getTime() - bDate.getTime();
      return sortOrder === 'asc' ? result : -result;
    }
    
    // Fallback to string comparison
    const result = String(aValue).localeCompare(String(bValue));
    return sortOrder === 'asc' ? result : -result;
  });
};

/**
 * Source Page Utility Functions
 * These functions handle the normalization of PageInfo from backend
 */

/**
 * Normalizes raw source page data from the API into a consistent format
 * Handles both proper backend PageInfo and legacy inconsistent data
 * @param raw - Raw data from the backend API
 * @returns Normalized SourcePage object
 */
export const normalizeSourcePage = (raw: RawSourcePageData): SourcePage => {
  // Check if this is a proper PageInfo from backend
  const isBackendPageInfo = raw.Id !== undefined && raw.Name !== undefined;
  
  if (isBackendPageInfo) {
    // Handle proper backend PageInfo structure
    return {
      id: raw.Id!,
      name: raw.Name!,
      isFinal: raw.IsFinal || false,
      releaseDate: raw.ReleaseDate || new Date(),
      statusId: raw.StatusId || 0,
      statusLabel: raw.StatusLabel || '',
      status: normalizePageStatus(raw.StatusLabel || ''),
      showVisitWindowText: raw.ShowVisitWindowText || false,
      visitWindowText: raw.VisitWindowText || '',
      version: raw.Version || 1,
      createdOn: raw.CreatedOn || new Date(),
      cssFileEnumId: raw.CssFileEnumId || 0,
      cssFilePath: raw.CssFilePath || '',
      cssFileLabel: raw.CssFileLabel || '',
      cssFileType: normalizeCssFileType(raw.CssFileLabel || ''),
      previousPageId: raw.PreviousPageId || 0,
      
      // Users and ownership from backend
      createdBy: raw.CreatedBy || { Id: 0, Name: 'Unknown' },
      reviewedBy: raw.ReviewedBy || { Id: 0, Name: 'Unknown' },
      authors: raw.Authors || null,
      reviewers: raw.Reviewers || null,
      
      // Relationships from backend
      binder: raw.Binder ? normalizeSourceBinder(raw.Binder) : null,
      studyVisit: raw.StudyVisit,
      studyArm: raw.StudyArm,
      reviewState: raw.ReviewState,
      
      // Additional properties
      url: raw.url,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      metadata: raw.metadata || {}
    };
  } else {
    // Handle legacy inconsistent data structure
    return {
      id: Number(raw.id || raw.pageId || 0),
      name: raw.name || raw.pageName || raw.title || 'Unnamed Page',
      isFinal: raw.isFinal || raw.is_final || raw.final || false,
      releaseDate: raw.releaseDate ? new Date(raw.releaseDate) : new Date(),
      statusId: 0,
      statusLabel: raw.statusLabel || raw.status_label || raw.status || '',
      status: normalizePageStatus(raw.status || raw.state || ''),
      showVisitWindowText: false,
      visitWindowText: '',
      version: raw.version || raw.pageVersion || raw.page_version || 1,
      createdOn: raw.createdDate ? new Date(raw.createdDate) : new Date(),
      cssFileEnumId: 0,
      cssFilePath: '',
      cssFileLabel: '',
      cssFileType: 'default',
      previousPageId: 0,
      
      // Default user structure
      createdBy: { Id: 0, Name: 'Unknown' },
      reviewedBy: { Id: 0, Name: 'Unknown' },
      authors: null,
      reviewers: null,
      
      // Default relationships
      binder: null,
      studyVisit: undefined,
      studyArm: undefined,
      reviewState: undefined,
      
      // Additional properties
      url: raw.url,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      metadata: raw.metadata || {}
    };
  }
};

/**
 * Normalizes an array of raw source page data
 * @param rawPages - Array of raw page data from API
 * @returns Array of normalized SourcePage objects
 */
export const normalizeSourcePages = (rawPages: RawSourcePageData[]): SourcePage[] => {
  if (!Array.isArray(rawPages)) {
    console.warn('normalizeSourcePages: Expected array, received:', typeof rawPages);
    return [];
  }
  
  return rawPages.map(normalizeSourcePage);
};

/**
 * Normalizes page status string to consistent SourcePageStatus
 * @param status - Raw status string
 * @returns Normalized SourcePageStatus
 */
export const normalizePageStatus = (status: string | undefined): SourcePageStatus => {
  if (typeof status !== 'string') {
    return 'draft';
  }
  
  const normalized = status.toLowerCase().trim();
  
  switch (normalized) {
    case 'draft':
    case 'draft version':
      return 'draft';
    case 'review':
    case 'in review':
    case 'under review':
      return 'review';
    case 'approved':
    case 'approved for publication':
      return 'approved';
    case 'final':
    case 'final version':
    case 'finalized':
      return 'final';
    case 'published':
    case 'published version':
    case 'active':
      return 'published';
    case 'archived':
    case 'inactive':
      return 'archived';
    case 'rescinded':
    case 'withdrawn':
      return 'rescinded';
    default:
      return 'draft';
  }
};

/**
 * Normalizes CSS file type string to consistent CssFileType
 * @param cssFileLabel - Raw CSS file label string
 * @returns Normalized CssFileType
 */
export const normalizeCssFileType = (cssFileLabel: string | undefined): CssFileType => {
  if (typeof cssFileLabel !== 'string') {
    return 'default';
  }
  
  const normalized = cssFileLabel.toLowerCase().trim();
  
  if (normalized.includes('custom')) return 'custom';
  if (normalized.includes('template')) return 'template';
  if (normalized.includes('study')) return 'study-specific';
  
  return 'default';
};

/**
 * Gets a human-readable page status display string
 * @param status - SourcePageStatus
 * @returns Display string with appropriate capitalization
 */
export const getPageStatusDisplay = (status: SourcePageStatus): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'final':
      return 'Final';
    case 'published':
      return 'Published';
    case 'archived':
      return 'Archived';
    case 'rescinded':
      return 'Rescinded';
    default:
      return 'Unknown';
  }
};

/**
 * Gets a color for page status display (for chips, badges, etc.)
 * @param status - SourcePageStatus
 * @returns Color name compatible with Material-UI
 */
export const getPageStatusColor = (status: SourcePageStatus): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  switch (status) {
    case 'published':
    case 'final':
      return 'success';
    case 'approved':
      return 'info';
    case 'review':
      return 'warning';
    case 'rescinded':
    case 'archived':
      return 'error';
    case 'draft':
    default:
      return 'default';
  }
};

/**
 * Gets a human-readable CSS file type display string
 * @param type - CssFileType
 * @returns Display string with appropriate capitalization
 */
export const getCssFileTypeDisplay = (type: CssFileType): string => {
  switch (type) {
    case 'default':
      return 'Default';
    case 'custom':
      return 'Custom';
    case 'template':
      return 'Template';
    case 'study-specific':
      return 'Study Specific';
    default:
      return 'Unknown';
  }
};

/**
 * Validates source page data for creation/update
 * @param data - Source page data to validate
 * @returns Validation result with any errors
 */
export const validateSourcePageData = (data: Partial<SourcePage>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Page name is required');
  }
  
  if (data.name && data.name.length > 255) {
    errors.push('Page name must be less than 255 characters');
  }
  
  if (data.visitWindowText && data.visitWindowText.length > 1000) {
    errors.push('Visit window text must be less than 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates a default SourcePage object with minimal required properties
 * @param overrides - Optional property overrides
 * @returns Default SourcePage object
 */
export const createDefaultSourcePage = (overrides: Partial<SourcePage> = {}): SourcePage => {
  return {
    id: 0,
    name: '',
    isFinal: false,
    releaseDate: new Date(),
    statusId: 0,
    statusLabel: 'Draft',
    status: 'draft',
    showVisitWindowText: false,
    visitWindowText: '',
    version: 1,
    createdOn: new Date(),
    cssFileEnumId: 0,
    cssFilePath: '',
    cssFileLabel: 'Default',
    cssFileType: 'default',
    previousPageId: 0,
    createdBy: { Id: 0, Name: '' },
    reviewedBy: { Id: 0, Name: '' },
    authors: null,
    reviewers: null,
    binder: null,
    tags: [],
    metadata: {},
    ...overrides
  };
};

/**
 * Filters source pages based on search criteria
 * @param pages - Array of source pages to filter
 * @param searchTerm - Search term to match against name and other fields
 * @param filters - Additional filter criteria
 * @returns Filtered array of source pages
 */
export const filterSourcePages = (
  pages: SourcePage[],
  searchTerm: string = '',
  filters: {
    status?: SourcePageStatus[];
    isFinal?: boolean;
    cssFileType?: CssFileType[];
    binderId?: number;
    authorId?: number;
  } = {}
): SourcePage[] => {
  return pages.filter(page => {
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        page.name.toLowerCase().includes(term) ||
        page.statusLabel.toLowerCase().includes(term) ||
        page.visitWindowText.toLowerCase().includes(term) ||
        (page.tags || []).some(tag => tag.toLowerCase().includes(term));
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(page.status)) {
        return false;
      }
    }
    
    // Final status filter
    if (filters.isFinal !== undefined) {
      if (page.isFinal !== filters.isFinal) {
        return false;
      }
    }
    
    // CSS file type filter
    if (filters.cssFileType && filters.cssFileType.length > 0) {
      if (!filters.cssFileType.includes(page.cssFileType)) {
        return false;
      }
    }
    
    // Binder filter
    if (filters.binderId !== undefined) {
      if (!page.binder || page.binder.id !== filters.binderId) {
        return false;
      }
    }
    
    // Author filter
    if (filters.authorId !== undefined) {
      if (!page.authors || !page.authors.some(author => author.Id === filters.authorId)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Sorts source pages by specified criteria
 * @param pages - Array of source pages to sort
 * @param sortBy - Property to sort by
 * @param sortOrder - Sort direction
 * @returns Sorted array of source pages
 */
export const sortSourcePages = (
  pages: SourcePage[],
  sortBy: keyof SourcePage,
  sortOrder: 'asc' | 'desc' = 'asc'
): SourcePage[] => {
  return [...pages].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1;
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const result = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? result : -result;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const result = aValue - bValue;
      return sortOrder === 'asc' ? result : -result;
    }
    
    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      const result = aValue.getTime() - bValue.getTime();
      return sortOrder === 'asc' ? result : -result;
    }
    
    // Fallback to string comparison
    const result = String(aValue).localeCompare(String(bValue));
    return sortOrder === 'asc' ? result : -result;
  });
};
