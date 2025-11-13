/**
 * Source Binder Types and Interfaces
 * 
 * These interfaces define the structure of source binder objects
 * and provide type safety throughout the application.
 */

/**
 * Status options for source pages
 */
export type SourcePageStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'final' 
  | 'published' 
  | 'archived' 
  | 'rescinded';

/**
 * CSS file types for source pages
 */
export type CssFileType = 
  | 'default' 
  | 'custom' 
  | 'template' 
  | 'study-specific';

/**
 * Status options for source binders
 */
export type SourceBinderStatus = 
  | 'active' 
  | 'inactive' 
  | 'draft' 
  | 'pending' 
  | 'archived' 
  | 'error';

/**
 * Type options for source binders
 */
export type SourceBinderType = 
  | 'document' 
  | 'database' 
  | 'api' 
  | 'file' 
  | 'web' 
  | 'other';

/**
 * Simple user interface as used in backend BinderInfo
 */
export interface SimpleUser {
  Id: number;
  Name: string;
  Email?: string;
}

/**
 * Sponsors interface as referenced in backend BinderInfo
 */
export interface Sponsors {
  Id: number;
  Name: string;
  Description?: string;
}

/**
 * Simple study structure as referenced in backend BinderInfo
 */
export interface SimpleStudyStruct {
  Id: number;
  Name: string;
  Description?: string;
}

/**
 * Visit Info interface as referenced in backend PageInfo
 */
export interface VisitInfo {
  Id: number;
  Name: string;
  Description?: string;
  VisitNumber?: number;
  SequenceNumber?: number;
}

/**
 * Arm Info interface as referenced in backend PageInfo
 */
export interface ArmInfo {
  Id: number;
  Name: string;
  Description?: string;
  ArmNumber?: number;
}

/**
 * Source Page Review Info interface as referenced in backend PageInfo
 */
export interface SourcePageReviewInfo {
  Id: number;
  Status: string;
  ReviewDate?: Date;
  ReviewNotes?: string;
  ReviewerId?: number;
}

/**
 * Backend PageInfo interface (matches your actual backend structure)
 */
export interface PageInfo {
  Id: number;
  Name: string;
  IsFinal: boolean;
  ReleaseDate: Date;
  StatusId: number;
  StatusLabel: string;
  ShowVisitWindowText: boolean;
  VisitWindowText: string;
  Version: number;
  CreatedOn: Date;
  CssFileEnumId: number;
  CssFilePath: string;
  CssFileLabel: string;
  PreviousPageId: number;
  CreatedBy: SimpleUser;
  ReviewedBy: SimpleUser;
  Authors: SimpleUser[] | null;
  Reviewers: SimpleUser[] | null;
  Binder: BinderInfo | null;
  StudyVisit?: VisitInfo;
  StudyArm?: ArmInfo;
  ReviewState?: SourcePageReviewInfo;
}

/**
 * Backend BinderInfo interface (matches your actual backend structure)
 */
export interface BinderInfo {
  Id: number;
  Name: string;
  Description: string;
  Version: number;
  IsActive: boolean;
  PageCount: number;
  FinalPageCount: number;
  DraftPageCount: number;
  RescindedPageCount: number;
  NeedingReviewedPageCount: number;
  Owner: SimpleUser;
  ProtocolVersion: string;
  ProtocolVersionDate: Date | null;
  Sponsor?: Sponsors | null;
  Study?: SimpleStudyStruct | null;
}

/**
 * Normalized source page interface with consistent property names
 * Maps from backend PageInfo to frontend-friendly format
 */
export interface SourcePage {
  id: number;
  name: string;
  isFinal: boolean;
  releaseDate: Date;
  statusId: number;
  statusLabel: string;
  status: SourcePageStatus;
  showVisitWindowText: boolean;
  visitWindowText: string;
  version: number;
  createdOn: Date;
  cssFileEnumId: number;
  cssFilePath: string;
  cssFileLabel: string;
  cssFileType: CssFileType;
  previousPageId: number;
  
  // Users and ownership
  createdBy: SimpleUser;
  reviewedBy: SimpleUser;
  authors: SimpleUser[] | null;
  reviewers: SimpleUser[] | null;
  
  // Relationships
  binder: SourceBinder | null;
  studyVisit?: VisitInfo;
  studyArm?: ArmInfo;
  reviewState?: SourcePageReviewInfo;
  
  // Additional frontend properties
  url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Raw source page data as received from API
 * This can handle both the proper backend PageInfo and any legacy inconsistent data
 */
export interface RawSourcePageData extends Partial<PageInfo> {
  // Legacy/alternative property names (for backwards compatibility)
  id?: string | number;
  pageId?: string | number;
  name?: string;
  pageName?: string;
  title?: string;
  isFinal?: boolean;
  is_final?: boolean;
  final?: boolean;
  status?: string;
  state?: string;
  statusLabel?: string;
  status_label?: string;
  createdDate?: string;
  created_at?: string;
  dateCreated?: string;
  created?: string;
  releaseDate?: string;
  release_date?: string;
  version?: number;
  pageVersion?: number;
  page_version?: number;
  
  // Any other properties from backend
  [key: string]: any;
}

/**
 * Raw source binder data as received from API
 * This can handle both the proper backend BinderInfo and any legacy inconsistent data
 */
export interface RawSourceBinderData extends Partial<BinderInfo> {
  // Legacy/alternative property names (for backwards compatibility)
  id?: string | number;
  binderId?: string | number;
  name?: string;
  binderName?: string;
  title?: string;
  description?: string;
  summary?: string;
  status?: string;
  state?: string;
  isActive?: boolean;
  createdDate?: string;
  created_at?: string;
  dateCreated?: string;
  created?: string;
  updatedDate?: string;
  updated_at?: string;
  lastModified?: string;
  pageCount?: number;
  page_count?: number;
  pages?: any[];
  type?: string;
  binderType?: string;
  url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  
  // Any other properties from backend
  [key: string]: any;
}

/**
 * Normalized source binder interface with consistent property names
 * This is the standardized structure used throughout the frontend
 * Maps from backend BinderInfo to frontend-friendly format
 */
export interface SourceBinder {
  id: number;
  name: string;
  description: string;
  version: number;
  isActive: boolean;
  status: SourceBinderStatus;
  type: SourceBinderType;
  
  // Page count details
  pageCount: number;
  finalPageCount: number;
  draftPageCount: number;
  rescindedPageCount: number;
  needingReviewedPageCount: number;
  
  // Ownership and metadata
  owner: SimpleUser;
  protocolVersion: string;
  protocolVersionDate: Date | null;
  sponsor?: Sponsors | null;
  study?: SimpleStudyStruct | null;
  
  // Additional frontend properties
  createdDate?: string;
  updatedDate?: string;
  url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Source binder creation payload (when creating new binders)
 * Maps to backend BinderInfo creation requirements
 */
export interface CreateSourceBinderData {
  Name: string;
  Description: string;
  IsActive?: boolean;
  ProtocolVersion?: string;
  SponsorId?: number;
  StudyId?: number;
  
  // Legacy/alternative properties for compatibility
  name?: string;
  description?: string;
  type?: SourceBinderType;
  url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
}

/**
 * Source binder update payload (when updating existing binders)
 * Maps to backend BinderInfo update requirements
 */
export interface UpdateSourceBinderData {
  Name?: string;
  Description?: string;
  IsActive?: boolean;
  ProtocolVersion?: string;
  SponsorId?: number;
  StudyId?: number;
  
  // Legacy/alternative properties for compatibility
  name?: string;
  description?: string;
  type?: SourceBinderType;
  status?: SourceBinderStatus;
  url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
}

/**
 * Source page creation payload (when creating new pages)
 * Maps to backend PageInfo creation requirements
 */
export interface CreateSourcePageData {
  Name: string;
  IsFinal?: boolean;
  ShowVisitWindowText?: boolean;
  VisitWindowText?: string;
  CssFileEnumId?: number;
  PreviousPageId?: number;
  BinderId?: number;
  StudyVisitId?: number;
  StudyArmId?: number;
  
  // Legacy/alternative properties for compatibility
  name?: string;
  isFinal?: boolean;
  showVisitWindowText?: boolean;
  visitWindowText?: string;
  cssFileEnumId?: number;
  previousPageId?: number;
  binderId?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Source page update payload (when updating existing pages)
 * Maps to backend PageInfo update requirements
 */
export interface UpdateSourcePageData {
  Name?: string;
  IsFinal?: boolean;
  ShowVisitWindowText?: boolean;
  VisitWindowText?: string;
  CssFileEnumId?: number;
  PreviousPageId?: number;
  StudyVisitId?: number;
  StudyArmId?: number;
  
  // Legacy/alternative properties for compatibility
  name?: string;
  isFinal?: boolean;
  showVisitWindowText?: boolean;
  visitWindowText?: string;
  cssFileEnumId?: number;
  previousPageId?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Source binder list response from API
 */
export interface SourceBinderListResponse {
  binders: RawSourceBinderData[];
  total?: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Source binder details response from API
 */
export interface SourceBinderDetailsResponse extends RawSourceBinderData {
  pages?: SourceBinderPage[];
  associations?: SourceBinderAssociation[];
}

/**
 * Source binder page interface
 */
export interface SourceBinderPage {
  id: string | number;
  title: string;
  content?: string;
  url?: string;
  pageNumber?: number;
  createdDate: string;
  updatedDate?: string;
  metadata?: Record<string, any>;
}

/**
 * Source binder association interface
 */
export interface SourceBinderAssociation {
  id: string | number;
  type: string;
  name: string;
  relationship: string;
  createdDate: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * Source binder filter options
 */
export interface SourceBinderFilters {
  status?: SourceBinderStatus[];
  type?: SourceBinderType[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  owner?: string;
}
