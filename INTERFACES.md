# Source Binder & Source Page TypeScript Interfaces

This document outlines the complete TypeScript interface structure for Source Binders and Source Pages, designed to match your backend C# interfaces while providing frontend normalization.

## 🏗️ Architecture Overview

```
Backend C# Interface → Raw Data Interface → Normalized Frontend Interface → UI Components
     BinderInfo      →  RawSourceBinderData →      SourceBinder       →   React Components
     PageInfo        →  RawSourcePageData   →      SourcePage         →   React Components
```

## 📋 Backend Interfaces (C# → TypeScript)

### BinderInfo Interface
```typescript
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
```

### PageInfo Interface
```typescript
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
```

## 🔧 Frontend Interfaces

### Normalized Source Binder
```typescript
export interface SourceBinder {
  id: number;                    // from BinderInfo.Id
  name: string;                  // from BinderInfo.Name
  description: string;           // from BinderInfo.Description
  version: number;               // from BinderInfo.Version
  isActive: boolean;             // from BinderInfo.IsActive
  status: SourceBinderStatus;    // derived from IsActive
  type: SourceBinderType;        // frontend classification
  
  // Rich page count details from backend
  pageCount: number;             // from BinderInfo.PageCount
  finalPageCount: number;        // from BinderInfo.FinalPageCount
  draftPageCount: number;        // from BinderInfo.DraftPageCount
  rescindedPageCount: number;    // from BinderInfo.RescindedPageCount
  needingReviewedPageCount: number; // from BinderInfo.NeedingReviewedPageCount
  
  // Ownership and metadata from backend
  owner: SimpleUser;             // from BinderInfo.Owner
  protocolVersion: string;       // from BinderInfo.ProtocolVersion
  protocolVersionDate: Date | null; // from BinderInfo.ProtocolVersionDate
  sponsor?: Sponsors | null;     // from BinderInfo.Sponsor
  study?: SimpleStudyStruct | null; // from BinderInfo.Study
  
  // Additional frontend properties
  createdDate?: string;
  updatedDate?: string;
  url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

### Normalized Source Page
```typescript
export interface SourcePage {
  id: number;                    // from PageInfo.Id
  name: string;                  // from PageInfo.Name
  isFinal: boolean;              // from PageInfo.IsFinal
  releaseDate: Date;             // from PageInfo.ReleaseDate
  statusId: number;              // from PageInfo.StatusId
  statusLabel: string;           // from PageInfo.StatusLabel
  status: SourcePageStatus;      // derived from StatusLabel
  showVisitWindowText: boolean;  // from PageInfo.ShowVisitWindowText
  visitWindowText: string;       // from PageInfo.VisitWindowText
  version: number;               // from PageInfo.Version
  createdOn: Date;               // from PageInfo.CreatedOn
  cssFileEnumId: number;         // from PageInfo.CssFileEnumId
  cssFilePath: string;           // from PageInfo.CssFilePath
  cssFileLabel: string;          // from PageInfo.CssFileLabel
  cssFileType: CssFileType;      // derived from CssFileLabel
  previousPageId: number;        // from PageInfo.PreviousPageId
  
  // Users and ownership from backend
  createdBy: SimpleUser;         // from PageInfo.CreatedBy
  reviewedBy: SimpleUser;        // from PageInfo.ReviewedBy
  authors: SimpleUser[] | null;  // from PageInfo.Authors
  reviewers: SimpleUser[] | null; // from PageInfo.Reviewers
  
  // Relationships from backend
  binder: SourceBinder | null;   // from PageInfo.Binder (normalized)
  studyVisit?: VisitInfo;        // from PageInfo.StudyVisit
  studyArm?: ArmInfo;            // from PageInfo.StudyArm
  reviewState?: SourcePageReviewInfo; // from PageInfo.ReviewState
  
  // Additional frontend properties
  url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

## 🎯 Type Definitions

### Source Binder Types
```typescript
export type SourceBinderStatus = 
  | 'active' 
  | 'inactive' 
  | 'draft' 
  | 'pending' 
  | 'archived' 
  | 'error';

export type SourceBinderType = 
  | 'document' 
  | 'database' 
  | 'api' 
  | 'file' 
  | 'web' 
  | 'other';
```

### Source Page Types
```typescript
export type SourcePageStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'final' 
  | 'published' 
  | 'archived' 
  | 'rescinded';

export type CssFileType = 
  | 'default' 
  | 'custom' 
  | 'template' 
  | 'study-specific';
```

## 🔄 Data Flow

### 1. API Service Layer
```typescript
// sourceBinderApi.js
export const sourceBinderApi = {
  getSourceBinders: async (): Promise<SourceBinder[]> => {
    const rawData: BinderInfo[] = await Auth.authGet('/api/v1/source/ListBinders');
    return normalizeSourceBinders(rawData);
  },
  
  getSourceBinderById: async (id: number): Promise<SourceBinder> => {
    const rawData: BinderInfo = await Auth.authGet(`/api/v1/source/GetBinder/${id}`);
    return normalizeSourceBinder(rawData);
  }
  // ... other methods
};
```

### 2. Normalization Layer
```typescript
// sourceBinderUtils.ts
export const normalizeSourceBinder = (raw: RawSourceBinderData): SourceBinder => {
  const isBackendBinderInfo = raw.Id !== undefined && raw.Name !== undefined;
  
  if (isBackendBinderInfo) {
    // Handle proper backend BinderInfo structure
    return {
      id: raw.Id!,
      name: raw.Name!,
      description: raw.Description || '',
      version: raw.Version || 1,
      isActive: raw.IsActive || false,
      // ... map all backend properties to frontend structure
    };
  } else {
    // Handle legacy data with fallbacks
    return {
      id: Number(raw.id || raw.binderId || 0),
      name: raw.name || raw.binderName || 'Unnamed Binder',
      // ... handle legacy property names
    };
  }
};
```

### 3. React Hooks
```typescript
// useSourceBinders.ts
export const useSourceBinders = () => {
  const [sourceBinders, setSourceBinders] = useState<SourceBinder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadSourceBinders = useCallback(async (): Promise<void> => {
    const data = await sourceBinderApi.getSourceBinders();
    setSourceBinders(data); // Already normalized!
  }, []);

  return { sourceBinders, loading, error, loadSourceBinders };
};
```

### 4. UI Components
```jsx
// SourceBinderListPage.jsx
const { sourceBinders } = useSourceBinders();

return (
  <Table>
    {sourceBinders.map(binder => (
      <TableRow key={binder.id}>
        <TableCell>{binder.name}</TableCell>
        <TableCell>v{binder.version}</TableCell>
        <TableCell>{binder.pageCount} total</TableCell>
        <TableCell>{binder.owner.Name}</TableCell>
      </TableRow>
    ))}
  </Table>
);
```

## 🛠️ Key Utility Functions

### For Source Binders
- `normalizeSourceBinder()` - Convert backend BinderInfo to frontend SourceBinder
- `normalizeSourceBinders()` - Convert array of BinderInfo to SourceBinder[]
- `getStatusDisplay()` - Human-readable status text
- `getStatusColor()` - Material-UI color for status chips
- `validateSourceBinderData()` - Validation for create/update operations
- `filterSourceBinders()` - Filter by search term and criteria
- `sortSourceBinders()` - Sort by any property with type safety

### For Source Pages
- `normalizeSourcePage()` - Convert backend PageInfo to frontend SourcePage
- `normalizeSourcePages()` - Convert array of PageInfo to SourcePage[]
- `getPageStatusDisplay()` - Human-readable page status text
- `getPageStatusColor()` - Material-UI color for page status chips
- `getCssFileTypeDisplay()` - Human-readable CSS file type
- `validateSourcePageData()` - Validation for create/update operations
- `filterSourcePages()` - Filter by search term and criteria
- `sortSourcePages()` - Sort by any property with type safety

## 📁 File Structure

```
src/
├── types/
│   └── sourceBinder.ts          # All TypeScript interfaces
├── utils/
│   └── sourceBinderUtils.ts     # Normalization and utility functions
├── features/
│   └── source_binder/
│       ├── services/
│       │   └── sourceBinderApi.js     # API service layer
│       ├── hooks/
│       │   └── useSourceBinders.ts    # React hooks with types
│       ├── pages/
│       │   ├── SourceBinderListPage.jsx
│       │   └── SourceBinderDetailsPage.jsx
│       └── components/
│           └── SourceBinderTable.jsx
```

## ✅ Benefits Achieved

1. **Type Safety**: Full IntelliSense and compile-time error checking
2. **Backend Compatibility**: Perfect mapping from C# BinderInfo/PageInfo to TypeScript
3. **Legacy Support**: Handles both new backend structure and any legacy data
4. **Rich Data Display**: Shows all the detailed page counts, owner info, sponsor details
5. **Consistent Naming**: camelCase frontend properties mapped from PascalCase backend
6. **Validation**: Built-in data validation for create/update operations
7. **Developer Experience**: Clear interfaces, utility functions, and documentation

## 🚀 Usage Examples

```typescript
// Type-safe usage in components
const binder: SourceBinder = await sourceBinderApi.getSourceBinderById(123);

console.log(binder.name);                    // ✅ TypeScript knows this exists
console.log(binder.finalPageCount);          // ✅ Knows this is a number  
console.log(binder.owner.Name);              // ✅ Knows nested structure
console.log(binder.sponsor?.Name);           // ✅ Handles optional properties

// Type-safe filtering and sorting
const activeBinders = filterSourceBinders(sourceBinders, '', { 
  status: ['active'] 
});

const sortedBinders = sortSourceBinders(activeBinders, 'name', 'asc');

// Type-safe validation
const { isValid, errors } = validateSourceBinderData(newBinderData);
```

This comprehensive interface system provides type safety while perfectly matching your backend C# structure! 🎉
