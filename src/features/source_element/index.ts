// Export all source element feature components, hooks, and services
export { default as SourceElementTable } from './components/SourceElementTable';
export { ElementEditorDialog } from './components/ElementEditorDialog';
export { default as ElementRenderer } from './components/ElementRenderer';
export { default as ElementRendererDemo } from './components/ElementRendererDemo';
export { default as ServerRenderedElement, ServerRenderedElements } from './components/ServerRenderedElement';
export { 
  useSourceElements, 
  useSourceElement, 
  useCreateSourceElement,
  useReorderSourceElements,
  useRenderElementHtml
} from './hooks/useSourceElements';
export { sourceElementApi } from './services/sourceElementApi';

// Re-export types for convenience
export type {
  SourceElement,
  CreateSourceElementData,
  UpdateSourceElementData,
  SourceElementReviewData,
  SourceElementFilters,
  SourceElementSort
} from '../../types/sourceElement';

export type {
  SimpleUser
} from '../../types/sourceBinder';

// Re-export utility functions
export {
  normalizeSourceElement,
  normalizeSourceElements,
  getElementStatus,
  getStatusDisplay,
  getStatusColor,
  getElementTypeDisplay,
  formatDate,
  filterSourceElements,
  sortSourceElements,
  groupSourceElements,
  getElementStatistics
} from '../../utils/sourceElementUtils';
