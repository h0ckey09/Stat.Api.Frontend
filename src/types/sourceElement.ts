import { PageInfo, SimpleUser } from './sourceBinder';

/**
 * Raw source element data from the backend (exactly matching server definition)
 */
export interface RawSourceElementData {
  Id: number;
  SourcePage: number;
  Order: number;
  Label: string;
  ElementTypeId: number;
  ElementTypeLabel: string;
  ElementData: string;
  EditorNotes: string;
  EditedDateTime?: Date | string | null;
  ReviewerApproved: boolean;
  ReviewerNotes: string | null;
  IsDisabled: boolean;
  IsSuperseded: boolean;
  IsActiveClone: boolean;
  CloneOfElementId: number | null;
  ReviewStatusId: number | null;
  ReviewStatusLabel: string | null;
  ReviewStatusForecolor: string | null;
  ReviewStatusBackColor: string | null;
  IsSelected_FOR_UI_ONLY: boolean;
  Page?: PageInfo | null;
  LastEditedBy: SimpleUser | null;
  ReviewedBy: SimpleUser | null;
}

/**
 * Normalized source element interface for frontend use
 */
export interface SourceElement {
  id: number;
  sourcePageId: number;
  order: number;
  label: string;
  elementTypeId: number;
  elementTypeLabel: string;
  elementData: string;
  editorNotes: string;
  editedDateTime: Date | null;
  reviewerApproved: boolean;
  reviewerNotes: string | null;
  isDisabled: boolean;
  isSuperseded: boolean;
  isActiveClone: boolean;
  cloneOfElementId: number | null;
  reviewStatusId: number | null;
  reviewStatusLabel: string | null;
  reviewStatusForecolor: string | null;
  reviewStatusBackColor: string | null;
  isSelected: boolean; // Renamed from IsSelected_FOR_UI_ONLY
  page?: PageInfo | null;
  lastEditedBy: SimpleUser | null;
  reviewedBy: SimpleUser | null;
}

/**
 * Source element status enum
 */
export enum SourceElementStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISABLED = 'disabled',
  SUPERSEDED = 'superseded'
}

/**
 * Source element type enum (common element types)
 */
export enum SourceElementType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  FILE = 'file',
  IMAGE = 'image',
  LINK = 'link',
  OTHER = 'other'
}

/**
 * Data for creating a new source element
 */
export interface CreateSourceElementData {
  sourcePageId: number;
  order?: number;
  label: string;
  elementTypeId: number;
  elementData: string;
  editorNotes?: string;
}

/**
 * Data for updating an existing source element
 */
export interface UpdateSourceElementData {
  label?: string;
  elementTypeId?: number;
  elementData?: string;
  editorNotes?: string;
  order?: number;
  reviewerApproved?: boolean;
  reviewerNotes?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
}

/**
 * Review data for source elements
 */
export interface SourceElementReviewData {
  approved: boolean;
  notes?: string;
  reviewStatusId?: number;
}

/**
 * Filter options for source elements
 */
export interface SourceElementFilters {
  sourcePageId?: number;
  elementTypeId?: number;
  status?: SourceElementStatus;
  reviewerApproved?: boolean;
  isDisabled?: boolean;
  isSuperseded?: boolean;
  lastEditedBy?: number;
  reviewedBy?: number;
}

/**
 * Sorting options for source elements
 */
export interface SourceElementSort {
  field: 'order' | 'label' | 'editedDateTime' | 'elementTypeLabel' | 'reviewStatusLabel';
  direction: 'asc' | 'desc';
}

/**
 * Pagination params for source elements
 */
export interface SourceElementPaginationParams {
  page?: number;
  limit?: number;
  sort?: SourceElementSort;
  filters?: SourceElementFilters;
}

/**
 * API response for source elements list
 */
export interface SourceElementListResponse {
  elements: RawSourceElementData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API response for source element details
 */
export interface SourceElementDetailsResponse {
  element: RawSourceElementData;
}
