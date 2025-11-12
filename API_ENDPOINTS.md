# API Endpoint Documentation

This document provides comprehensive information about all API endpoints in the StatApiServer. It is structured to be consumed by AI agents for generating client libraries.

## Table of Contents

- [Authentication APIs](#authentication-apis)
- [User APIs](#user-apis)
- [Study APIs](#study-apis)
- [Site APIs](#site-apis)
- [PI (Principal Investigator) APIs](#pi-principal-investigator-apis)
- [DOA (Delegation of Authority) APIs](#doa-delegation-of-authority-apis)
- [Regulatory APIs](#regulatory-apis)
- [Source Binder APIs](#source-binder-apis)
- [Source Element APIs](#source-element-apis)
- [Source Page APIs](#source-page-apis)
- [Fax APIs](#fax-apis)
- [Lab APIs](#lab-apis)
- [Marchele APIs](#marchele-apis)
- [QA APIs](#qa-apis)
- [SOP APIs](#sop-apis)
- [Testing APIs](#testing-apis)
- [Utility APIs](#utility-apis)

---

## Authentication APIs

### POST /api/v1/users/Authenticate
Exchanges a Google ID token for a local session GUID.

**Request Body:**
```typescript
{
  idToken: string  // Google ID token
}
```

**Response:**
```typescript
{
  guid: string,           // Session GUID
  user: {
    id: number,
    email: string,
    name: string
  },
  expires: string         // ISO 8601 timestamp
}
```

**Error Responses:**
- 400: Missing idToken
- 401: Invalid Google token or user not recognized
- 403: Domain not allowed
- 500: Server error

---

### GET /api/v1/users/ValidateSession
Validates an existing session token.

**Headers:**
```
Authorization: Bearer <guid>
```

**Response:**
```typescript
{
  valid: boolean,
  expires?: string,       // ISO 8601 timestamp
  guid?: string,
  user?: object,
  error?: string
}
```

**Error Responses:**
- 401: Missing bearer, missing token, session not found, or expired
- 500: Server error

---

### GET /api/v1/users/GetCurrentUser
Gets the current authenticated user information.

**Headers:**
```
Authorization: Bearer <guid>
```

**Response:**
```typescript
{
  user: {
    id: number,
    email: string,
    name: string,
    // ... additional user properties
  }
}
```

**Error Responses:**
- 403: Not logged in
- 500: Server error

---

## User APIs

### GET /api/v1/users/ListUsers
Returns a list of users based on filter criteria.

**Query Parameters:**
- `onlyActives` (optional): boolean - Filter for active users only
- `onlyEmployees` (optional): boolean - Filter for employees only
- `onlyDelegatables` (optional): boolean - Filter for delegatable users only

**Response:**
```typescript
Array<{
  id: number,
  email: string,
  name: string,
  // ... additional user properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/users/GetUser/:id
Gets a specific user by ID.

**Path Parameters:**
- `id`: number - User ID

**Response:**
```typescript
{
  id: number,
  email: string,
  name: string,
  // ... additional user properties
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/users/GetUserSupervisor/:id
Gets the supervisor for a specific user.

**Path Parameters:**
- `id`: number - User ID

**Response:**
```typescript
{
  id: number,
  email: string,
  name: string,
  // ... additional user properties
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/roles/ListRoles
Returns a list of all available roles.

**Response:**
```typescript
Array<{
  id: number,
  name: string,
  // ... additional role properties
}>
```

**Error Responses:**
- 500: Server error

---

## Study APIs

### POST /api/v1/studies/SetStudyGoogleFolderId
Updates the Google folder ID associated with a study.

**Query Parameters:**
- `studyId`: number - Study ID (required)
- `folderId`: string - Google folder ID (required)
- `override`: boolean - Whether to override existing value

**Response:**
```typescript
{
  // Study update result
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

### POST /api/v1/studies/SetStudyComplionBinderEmail
Updates the Complion binder email for a study.

**Query Parameters:**
- `studyId`: number - Study ID (required)
- `email`: string - Email address (required)
- `override`: boolean - Whether to override existing value

**Response:**
```typescript
{
  // Study update result
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

### GET /api/v1/studies/study/:id
Retrieves a study by ID with optional custom properties.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `customProperties`: boolean - Include custom properties in response

**Response:**
```typescript
{
  id: number,
  // ... study properties
  customProperties?: object
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

### GET /api/v1/studies/
Returns all study records.

**Response:**
```typescript
Array<{
  id: number,
  // ... study properties
}>
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/studies/SetCustomProperty/:id
Sets a custom property for a study.

**Path Parameters:**
- `id`: number - Study ID

**Request Body:**
```typescript
{
  // Custom property update payload
  propertyName: string,
  propertyValue: any
}
```

**Response:**
```typescript
{
  // Updated study object
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

### GET /api/v1/studies/GetCustomProperty/:id
Retrieves a single custom property value for a study.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `name`: string - Property name (required)
- `defaultValue`: string - Default value if property not found

**Response:**
```typescript
{
  // Property value
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

### GET /api/v1/studies/GetCustomProperties/:id
Retrieves multiple custom properties for a study.

**Path Parameters:**
- `id`: number - Study ID

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 501: Not implemented

---

### POST /api/v1/studies/Update/:id
Updates study properties.

**Path Parameters:**
- `id`: number - Study ID

**Request Body:**
```typescript
{
  // Properties to update (key-value pairs)
  [key: string]: any
}
```

**Response:**
```typescript
{
  // Updated study result
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

### POST /api/v1/studies/ChangeStudyStatus/:id
Logs a status change event for a study.

**Path Parameters:**
- `id`: number - Study ID

**Request Body:**
```typescript
{
  newStatus: number,      // Status ID (required)
  reason?: string,        // Optional reason for change
  date: string           // ISO 8601 date (required)
}
```

**Response:**
```typescript
{
  // Status change result
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

### GET /api/v1/studies/GetStudyStatuses/
Returns the study status enum values.

**Response:**
```typescript
Array<{
  id: number,
  name: string,
  // ... status properties
}>
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/studies/CreateNewStudy/
Creates a new study.

**Request Body:**
```typescript
{
  // Study creation payload
  name: string,
  // ... other study properties
}
```

**Response:**
```typescript
{
  id: number,
  // ... created study properties
}
```

**Error Responses:**
- 400: Invalid parameters
- 500: Server error

---

## Site APIs

### GET /api/v1/Sites/
Returns all currently active sites.

**Response:**
```typescript
Array<{
  id: number,
  Is_Active: boolean,
  // ... site properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/Sites/GetSiteById/:id
Returns a site by ID.

**Path Parameters:**
- `id`: number - Site ID

**Response:**
```typescript
{
  id: number,
  // ... site properties
}
```

**Error Responses:**
- 400: Invalid Site ID
- 500: Server error

---

## PI (Principal Investigator) APIs

### GET /api/v1/PIs/GetAllInvestigators
Returns the full list of investigator records.

**Response:**
```typescript
Array<{
  id: number,
  // ... investigator properties
}>
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/PIs/GetInvestigatorIById
Loads an investigator by ID.

**Request Body:**
```typescript
{
  id: number
}
```

**Response:**
```typescript
{
  id: number,
  // ... investigator properties
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/PIs/CreateInvestigator
Creates a new investigator.

**Request Body:**
```typescript
{
  // Investigator creation payload
  name: string,
  // ... other investigator properties
}
```

**Response:**
```typescript
{
  id: number,
  // ... created investigator properties
}
```

**Error Responses:**
- 500: Server error

---

## DOA (Delegation of Authority) APIs

### POST /api/v1/doa/CreateInitialDoa/:id
Creates initial DOA for a study.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `copyDefaultTasks`: boolean - Whether to copy default tasks

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 500: Not implemented

---

### GET /api/v1/doa/GetCurrentFinalizedDoaForStudy/:id
Gets the current finalized DOA for a study.

**Path Parameters:**
- `id`: number - Study ID

**Response:**
```typescript
{
  // DOA object
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/doa/GetCurrentFinalizeDOAVersion/:id
Gets the current finalized DOA version for a study.

**Path Parameters:**
- `id`: number - Study ID

**Response:**
```typescript
{
  // DOA version object
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/doa/GetCurrentAndPendingDoaForStudy/:id
Gets both current and pending DOA for a study.

**Path Parameters:**
- `id`: number - Study ID

**Response:**
```typescript
{
  // Combined DOA object
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/doa/GetCompiledDoaVersionForStudy/:id
Gets a compiled DOA version for a study.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `version`: number - Version ID (default: 1)

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 500: Not implemented

---

### GET /api/v1/doa/GetDoaSnapshotVersion/:id
Gets a DOA snapshot version.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `version`: number - Version ID (default: 0)

**Response:**
```typescript
{
  // DOA snapshot object
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/doa/GetDoaChangesOnlyForStudy/:id
Gets DOA changes only for a study.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `version`: number - Version ID (default: 1)

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 500: Not implemented

---

### GET /api/v1/doa/GetDoaAuditLogForStudy/:id
Gets the DOA audit log for a study.

**Path Parameters:**
- `id`: number - Study ID

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 500: Not implemented

---

### POST /api/v1/doa/RemoveUserFromDoa/
Removes a user from a DOA.

**Query Parameters:**
- `studyId`: number - Study ID (required)
- `userId`: number - User ID (required)
- `warningConfirmed`: boolean - Confirmation flag

**Response:**
```typescript
{
  // Removal result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/doa/AddUserToDoa/
Adds a user to a DOA.

**Query Parameters:**
- `studyId`: number - Study ID (optional if in body)

**Request Body:**
```typescript
{
  studyId?: number,
  userId: number,
  title: string,
  displayName: string
}
```

**Response:**
```typescript
{
  // Addition result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/doa/FinalizeDoa/
Finalizes a DOA.

**Query Parameters:**
- `studyId`: number - Study ID (required)
- `version`: number - Version ID (default: 1)

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 500: Not implemented

---

### POST /api/v1/doa/DownloadCompliledDoaLogPdf/:id
Downloads compiled DOA log as PDF.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `version`: number - Version ID (default: 1)

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 500: Not implemented

---

### POST /api/v1/doa/DownloadChangeOnlyDoaLogPdf/:id
Downloads change-only DOA log as PDF.

**Path Parameters:**
- `id`: number - Study ID

**Query Parameters:**
- `version`: number - Version ID (default: 1)

**Response:**
```typescript
{
  error: "Not Implemented"
}
```

**Error Responses:**
- 500: Not implemented

---

## Regulatory APIs

### POST /api/v1/regulatory/CreateNoteToFile
Creates a new Note To File.

**Request Body:**
```typescript
{
  // CreateNTFModel properties
  // ... NTF creation properties
}
```

**Response:**
```typescript
{
  message: "NTF Created"
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/regulatory/ScanStudyFolderGenerateFileList/:id
Initiates a scan of a study folder.

**Path Parameters:**
- `id`: string - Google folder ID (min 10 characters)

**Query Parameters:**
- `rescan`: boolean - Perform rescan
- `upload`: boolean - Upload files
- `email`: string - Upload notification email
- `deep`: boolean - Perform deep scan

**Response:**
```typescript
{
  message: "Scan Started"
}
```

**Error Responses:**
- 500: Invalid Folder ID or server error

---

### POST /api/v1/regulatory/RenameFilesInRegFolder/:id
Renames all files in a folder to match compliance format.

**Path Parameters:**
- `id`: string - Google folder ID (min 10 characters)

**Response:**
```typescript
{
  message: "Scan Started"
}
```

**Error Responses:**
- 500: Invalid Folder ID or server error

---

### POST /api/v1/regulatory/RenameFile/:id
Renames a specific file (placeholder).

**Path Parameters:**
- `id`: string - Google file ID (min 10 characters)

**Query Parameters:**
- `newName`: string - New file name (required)

**Response:**
```typescript
{
  message: "RenameFile endpoint not implemented yet"
}
```

**Error Responses:**
- 500: Invalid parameters or server error

---

### POST /api/v1/regulatory/DownloadAndProcessEmails
Starts downloading and processing regulatory emails.

**Response:**
```typescript
{
  message: "Download Started"
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/regulatory/RequeueEmail
Requeues a completed email for processing.

**Request Body:**
```typescript
{
  emailId: string  // Google email ID (min 5 characters)
}
```

**Response:**
```typescript
{
  message: "Requeue Email"
}
```

**Error Responses:**
- 500: Invalid Email ID or server error

---

### POST /api/v1/regulatory/ProcessNextRegBinderUpload
Processes the next due regulatory binder upload.

**Response:**
```typescript
{
  message: "Processing Next Reg Binder Upload Started Successfully"
}
```

**Error Responses:**
- 500: Server error

---

## Source Binder APIs

### POST /api/v1/source/CreateNewSourceBinderFreeStanding
Creates a new source binder without study association.

**Request Body:**
```typescript
{
  name: string,
  description: string
}
```

**Response:**
```typescript
{
  id: number,
  // ... binder properties
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/CreateNewSourceBinderWithStudy
Creates a new source binder associated with a study.

**Request Body:**
```typescript
{
  studyId: number,
  protocolVersion: number,
  protocolReleaseDate: string,  // Date string
  description: string
}
```

**Response:**
```typescript
{
  id: number,
  // ... binder properties
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetBinderPermissions/:id
Gets permissions for a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Response:**
```typescript
Array<{
  userId: number,
  // ... permission properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetBinderOwner/:id
Gets the owner of a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Response:**
```typescript
{
  id: number,
  name: string,
  // ... owner properties
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetBinder/:id
Gets binder information.

**Path Parameters:**
- `id`: number - Binder ID

**Response:**
```typescript
{
  id: number,
  // ... binder properties
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetBinderPages/:id
Gets pages in a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Query Parameters:**
- `simple`: boolean - Return simplified page info
- `onlyActive`: boolean - Return only active pages

**Response:**
```typescript
Array<{
  id: number,
  // ... page properties
}>
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/ArchiveBinder/:id
Archives a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Response:**
```typescript
{
  // Archive result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/UnarchiveBinder/:id
Unarchives a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Response:**
```typescript
{
  // Unarchive result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/RemoveUserFromBinder/:id
Removes a user from a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Query Parameters:**
- `userId`: number - User ID to remove

**Response:**
```typescript
{
  // Removal result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/AddUserToBinder/:id
Adds a user to a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Query Parameters:**
- `userId`: number - User ID to add

**Response:**
```typescript
{
  // Addition result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/SetBinderOwner/:id
Sets the owner of a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Query Parameters:**
- `userId`: number - User ID to set as owner

**Response:**
```typescript
{
  // Update result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/UpdateBinderProtocolInfo
Updates binder protocol information.

**Request Body:**
```typescript
{
  binderId: number,
  protocolVersion: string,
  protocolDate: Date
}
```

**Response:**
```typescript
{
  // Update result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/UpdateBinderDescription
Updates binder description.

**Request Body:**
```typescript
{
  binderId: number,
  description: string
}
```

**Response:**
```typescript
{
  // Update result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/UpdateBinderName
Updates binder name.

**Request Body:**
```typescript
{
  binderId: number,
  name: string
}
```

**Response:**
```typescript
{
  // Update result
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/ListBinders
Lists binders for the current user.

**Response:**
```typescript
Array<{
  id: number,
  // ... binder properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetBinderPagesIdList/:id
Gets a list of page IDs in a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Response:**
```typescript
Array<number>  // Array of page IDs
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetCurrentUserBinderPermission/:id
Gets current user's permission for a binder.

**Path Parameters:**
- `id`: number - Binder ID

**Response:**
```typescript
{
  hasPermission: boolean,
  // ... permission details
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetUserBinderPermission/:binderId/user/:userId
Gets a specific user's permission for a binder.

**Path Parameters:**
- `binderId`: number - Binder ID
- `userId`: number - User ID

**Response:**
```typescript
{
  hasPermission: boolean,
  // ... permission details
}
```

**Error Responses:**
- 500: Server error

---

## Source Element APIs

### POST /api/v1/source/RenderElementHtml/
Renders element HTML from element data.

**Request Body:**
```typescript
string  // Element data as string
```

**Response:**
```
HTML string
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/RenderElementHtml/:id
Renders element HTML by element ID.

**Path Parameters:**
- `id`: number - Element ID

**Response:**
```
HTML string
```

**Error Responses:**
- 400: Element not found
- 500: Server error

---

### GET /api/v1/source/GetCloneParentElement/:id
Gets the clone parent of an element.

**Path Parameters:**
- `id`: number - Element ID

**Query Parameters:**
- `includePageInfo`: boolean - Include page information

**Response:**
```typescript
{
  id: number,
  // ... parent element properties
  pageInfo?: object
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetElement/:id
Gets an element by ID.

**Path Parameters:**
- `id`: number - Element ID

**Query Parameters:**
- `includePageInfo`: boolean - Include page information

**Response:**
```typescript
{
  id: number,
  // ... element properties
  pageInfo?: object
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/CloneElement/:id
Clones an element to a new page.

**Path Parameters:**
- `id`: number - Element ID

**Query Parameters:**
- `newPageId`: number - Target page ID
- `order`: number - Element order on new page
- `disassociate`: boolean - Disassociate from parent

**Response:**
```typescript
{
  id: number,
  // ... cloned element properties
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/CreateElement
Creates a new element.

**Request Body:**
```typescript
{
  // Element creation properties
  pageId: number,
  elementType: string,
  // ... other element properties
}
```

**Response:**
```typescript
{
  id: number,
  // ... created element properties
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/UpdateElement/:id
Updates an element.

**Path Parameters:**
- `id`: number - Element ID

**Query Parameters:**
- `updateMethod`: string - Update method ('me' or 'clones')

**Request Body:**
```typescript
{
  ElementId?: number,
  // ... element properties to update
}
```

**Response:**
```typescript
{
  // Update result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/UpdateElementOrder/:id
Updates element order on a page.

**Path Parameters:**
- `id`: number - Element ID

**Query Parameters:**
- `order`: number - New order position
- `returnOrderOnly`: boolean - Return only order info

**Response:**
```typescript
{
  // Order update result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/DeleteElement/:id
Deletes an element (soft delete).

**Path Parameters:**
- `id`: number - Element ID

**Response:**
```typescript
{
  // Deletion result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/RecoverElement/:id
Recovers a deleted element.

**Path Parameters:**
- `id`: number - Element ID

**Response:**
```typescript
{
  // Recovery result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/DisassociateClone/:id
Disassociates a clone from its parent.

**Path Parameters:**
- `id`: number - Element ID

**Response:**
```typescript
{
  // Disassociation result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/ReviewApproveElement/:id
Approves an element in review.

**Path Parameters:**
- `id`: number - Element ID

**Response:**
```typescript
{
  // Approval result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/ReviewQueryElement/:id
Queries an element in review.

**Path Parameters:**
- `id`: number - Element ID

**Request Body:**
```typescript
{
  notes: string
}
```

**Response:**
```typescript
{
  // Query result
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetDefaultLabel/:id
Gets the default label for an element.

**Path Parameters:**
- `id`: number - Element ID

**Response:**
```typescript
{
  label: string
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetAllClonesOfElement/:id
Gets all clones of an element.

**Path Parameters:**
- `id`: number - Element ID

**Query Parameters:**
- `includeParent`: boolean - Include parent element (default: true)

**Response:**
```typescript
Array<{
  id: number,
  // ... clone element properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetCloneUpgradeReport/:id
Gets a clone upgrade report for an element.

**Path Parameters:**
- `id`: number - Element ID

**Response:**
```typescript
{
  // Upgrade report
}
```

**Error Responses:**
- 500: Server error

---

## Source Page APIs

### GET /api/v1/source/RenderPage/:id
Renders a source page as HTML.

**Path Parameters:**
- `id`: number - Page ID

**Query Parameters:**
- `autorefresh`: boolean - Enable auto-refresh
- `showborders`: boolean - Show element borders
- `bodyonly`: boolean - Return body only

**Response:**
```
HTML string
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetPage/:id
Gets page information.

**Path Parameters:**
- `id`: number - Page ID

**Query Parameters:**
- `includeBinderInfo`: boolean - Include binder information
- `includePermissions`: boolean - Include permissions

**Response:**
```typescript
{
  id: number,
  // ... page properties
  binderInfo?: object,
  permissions?: object
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/CreateNewPage/
Creates a new source page.

**Request Body:**
```typescript
{
  binderId: number,
  sourcePageName?: string,
  studyArmId?: number
}
```

**Response:**
```typescript
{
  id: number,
  // ... created page properties
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/ClonePage
Clones a source page to another binder.

**Request Body:**
```typescript
{
  sourcePageId: number,
  destBinderId: number,
  replacementStudyArmId?: number,
  replacementName?: string
}
```

**Response:**
```typescript
{
  id: number,
  // ... cloned page properties
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetPageElements/:id
Gets elements for a page.

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```typescript
Array<{
  id: number,
  // ... element properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetElementsForPage/:id
Gets elements for a page (duplicate of GetPageElements).

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```typescript
Array<{
  id: number,
  // ... element properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetElementsOrderForPage/:id
Gets element order for a page.

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```typescript
Array<number>  // Array of element IDs in order
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/ReorderElements/:id
Reorders elements on a page.

**Path Parameters:**
- `id`: number - Page ID

**Query Parameters:**
- `returnOrderOnly`: boolean - Return only order info

**Response:**
```typescript
{
  // Reorder result
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/DownloadPagePdf/:id
Downloads a page as PDF (v1).

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```
PDF file stream
```

**Error Responses:**
- 500: Server error

---

### GET /api/v2/source/DownloadPagePdf/:id
Downloads a page as PDF (v2 - new method).

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```
PDF file stream
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetPagePermissions/:id
Gets permissions for a page.

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```typescript
Array<{
  userId: number,
  // ... permission properties
}>
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetUserPagePermissions/:id/user/:userId
Gets a specific user's permissions for a page.

**Path Parameters:**
- `id`: number - Page ID
- `userId`: number - User ID

**Response:**
```typescript
{
  // Permission details
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/AddReviewerPermissions/:id
Adds reviewer permissions to a page.

**Path Parameters:**
- `id`: number - Page ID

**Request Body:**
```typescript
{
  userId: number
}
```

**Response:**
```typescript
{
  // Addition result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/RemoveReviewerPermissions/:id
Removes reviewer permissions from a page.

**Path Parameters:**
- `id`: number - Page ID

**Request Body:**
```typescript
{
  userId: number
}
```

**Response:**
```typescript
{
  // Removal result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/AddEditorPermissions/:id
Adds editor permissions to a page.

**Path Parameters:**
- `id`: number - Page ID

**Request Body:**
```typescript
{
  userId: number
}
```

**Response:**
```typescript
{
  // Addition result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/RemoveEditorPermissions/:id
Removes editor permissions from a page.

**Path Parameters:**
- `id`: number - Page ID

**Request Body:**
```typescript
{
  userId: number
}
```

**Response:**
```typescript
{
  // Removal result
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetNextPageRevision/:id
Gets the next page revision.

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```typescript
{
  // Next revision info
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/source/GetMostCurrentPageVersion/:id
Gets the most current page version.

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```typescript
{
  // Current version info
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/UpgradePage/:id
Upgrades a page to a new version.

**Path Parameters:**
- `id`: number - Page ID

**Response:**
```typescript
{
  // Upgrade result
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/source/RescindSourcePage/:id
Rescinds a source page.

**Path Parameters:**
- `id`: number - Page ID

**Request Body:**
```typescript
{
  previousTxnId?: number
}
```

**Response:**
```typescript
{
  // Rescind result
}
```

**Error Responses:**
- 500: Server error

---

## Fax APIs

### GET /api/v1/fax/KnownFax/:id
Checks if a fax is known in the system.

**Path Parameters:**
- `id`: string - Fax ID

**Response:**
```typescript
{
  result: boolean
}
```

**Error Responses:**
- 500: Server error

---

### POST /api/v1/fax/KnownFax
Records a known fax in the system.

**Request Body:**
```typescript
{
  FileName: string,
  ReceiveStatus: string,
  Date: string,
  EpochTime: number,
  CallerID: string,
  RemoteID: string,
  Pages: string,
  Size: string,
  ViewedStatus: string
}
```

**Response:**
```typescript
{
  result: any  // Result from recording operation
}
```

**Error Responses:**
- 500: Server error

---

## Lab APIs

### GET /api/v1/lab/GetLabReport/:id
Generates a PDF lab report from URL.

**Path Parameters:**
- `id`: string - Lab report ID

**Response:**
```
PDF file download
```

**Error Responses:**
- 500: Server error or PDF generation error

---

## Marchele APIs

### GET /api/v1/marchele/GetTvDisplay
Gets upcoming and overdue orders for TV display.

**Response:**
```typescript
{
  // TV display data
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/marchele/TodaysOpenOrdersHtml
Gets today's open orders as HTML.

**Response:**
```typescript
{
  // HTML string
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/marchele/TodaysCompletedHtml
Gets today's completed orders as HTML.

**Response:**
```typescript
{
  // HTML string
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/marchele/FutureOrdersHtml
Gets future orders as HTML.

**Response:**
```typescript
{
  // HTML string
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/marchele/GetNotesHtml
Gets notes as HTML.

**Response:**
```typescript
{
  // HTML string
}
```

**Error Responses:**
- 500: Server error

---

### GET /api/v1/marchele/ClearCache
Clears the Marchele cache.

**Response:**
```typescript
{
  message: "Cache cleared"
}
```

**Error Responses:**
- 500: Server error

---

## QA APIs

### GET /api/v1/QA/GetQAReport/:Id
Generates a QA report PDF.

**Path Parameters:**
- `Id`: number - Report ID

**Query Parameters:**
- `isCapaReport`: boolean - Is CAPA report
- `isNoteToFile`: boolean - Is Note To File

**Response:**
```
PDF file
```

**Error Responses:**
- 500: Server error

---

## SOP APIs

### POST /api/v1/sops/scanForChanges
Scans for changes in SOPs spreadsheet and updates database.

**Response:**
```typescript
{
  // Scan result
}
```

**Error Responses:**
- 500: Server error

---

## Testing APIs

### POST /api/v1/testing/pullRepository
Pulls the latest repository code and restarts the server (dev environment).

**Response:**
```typescript
{
  message: string  // Output from git pull and restart
}
```

**Error Responses:**
- 400: Execution error or stderr
- 500: Server error

---

### POST /api/v1/administrative/importProdceduresDatabase
Imports procedures from Google Sheets into database.

**Response:**
```typescript
{
  message: string  // Import count and error count
}
```

**Error Responses:**
- 500: Server error

---

## Utility APIs

### POST /api/v1/administrative/ping
Simple ping endpoint to check server status.

**Response:**
```typescript
{
  message: "Ok"
}
```

**Error Responses:**
- None (always returns Ok or error)

---

## Type Definitions

### Common Types

```typescript
// User object
interface SimpleUser {
  id: number;
  email: string;
  name: string;
  // ... additional properties
}

// Error response
interface ErrorResponse {
  error: string;
}

// Success message response
interface MessageResponse {
  message: string;
}
```

---

## Authentication

Most endpoints require authentication via session token. Include the session GUID in the Authorization header:

```
Authorization: Bearer <session-guid>
```

Obtain a session GUID using the `POST /api/v1/users/Authenticate` endpoint.

---

## Error Handling

All endpoints return standard HTTP status codes:

- **200**: Success
- **400**: Bad Request (invalid parameters)
- **401**: Unauthorized (authentication required or session expired)
- **403**: Forbidden (insufficient permissions)
- **500**: Internal Server Error
- **501**: Not Implemented

Error responses follow this format:
```typescript
{
  error: string  // Error message
}
```

---

## Notes for Client Library Generation

1. **Base URL**: Configure base URL as a client library parameter
2. **Authentication**: Implement automatic session token management
3. **Error Handling**: Wrap all API calls with appropriate error handling
4. **TypeScript Types**: Use the provided TypeScript interfaces for type safety
5. **Request/Response**: All JSON bodies should be properly serialized/deserialized
6. **Query Parameters**: URL-encode all query parameters
7. **Path Parameters**: Validate and properly format path parameters
8. **Headers**: Include appropriate Content-Type headers for POST/PUT requests
9. **File Downloads**: Handle binary responses for PDF endpoints
10. **Async Operations**: Several endpoints start background jobs and return immediately

---

## Versioning

Current API version: v1
Some endpoints have v2 versions (noted in their paths)

---

*Generated on: 2025-11-11*
*Repository: h0ckey09/StatApiServer*
