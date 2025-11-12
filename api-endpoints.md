# API Endpoints Documentation

This document describes the server-side API endpoints available for the Stat API Frontend application.

## Base URL
- Development: `http://localhost:3001`
- Production: `https://www.statresearch.com:3001`

## Authentication

All API requests require authentication via Bearer token in the Authorization header.

### Endpoints

#### POST /api/v1/users/Authenticate
Exchange Google ID token for local session token.

**Request Body:**
```json
{
  "idToken": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "email": "string",
    "name": "string",
    "id": "string"
  }
}
```

#### GET /api/v1/users/ValidateSession
Validate current session token.

**Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

#### GET /api/v1/users/GetCurrentUser
Get current authenticated user information.

---

## DOA (Delegation of Authority) Endpoints

Base path: `/api/v1/doa`

### Study DOA Management

#### POST /api/v1/doa/CreateInitialDoa/:studyId
Create initial DOA for a study.

**Parameters:**
- `studyId` (string) - The study identifier

**Request Body:**
```json
{
  "userId": "string",
  "permissions": ["string"]
}
```

#### GET /api/v1/doa/GetCurrentFinalizedDoaForStudy/:studyId
Get current finalized DOA for a study.

**Parameters:**
- `studyId` (string) - The study identifier

#### GET /api/v1/doa/GetCurrentFinalizeDOAVersion/:studyId
Get current finalized DOA version number.

**Parameters:**
- `studyId` (string) - The study identifier

#### GET /api/v1/doa/GetCurrentAndPendingDoaForStudy/:studyId
Get both current and pending DOA changes for a study.

**Parameters:**
- `studyId` (string) - The study identifier

#### GET /api/v1/doa/GetCompiledDoaVersionForStudy/:studyId
Get compiled DOA version including all historical changes.

**Parameters:**
- `studyId` (string) - The study identifier

#### GET /api/v1/doa/GetDoaSnapshotVersion/:versionId
Get a specific DOA snapshot by version ID.

**Parameters:**
- `versionId` (string) - The version identifier

#### GET /api/v1/doa/GetDoaChangesOnlyForStudy/:studyId
Get only the changes/deltas for a study's DOA.

**Parameters:**
- `studyId` (string) - The study identifier

#### GET /api/v1/doa/GetDoaAuditLogForStudy/:studyId
Get complete audit log of all DOA changes for a study.

**Parameters:**
- `studyId` (string) - The study identifier

### DOA User Management

#### POST /api/v1/doa/AddUserToDoa
Add a user to a DOA.

**Request Body:**
```json
{
  "userId": "string",
  "doaId": "string",
  "permissions": ["string"]
}
```

#### POST /api/v1/doa/RemoveUserFromDoa
Remove a user from a DOA.

**Request Body:**
```json
{
  "userId": "string",
  "doaId": "string"
}
```

#### POST /api/v1/doa/FinalizeDoa
Finalize a DOA, making it the current active version.

**Request Body:**
```json
{
  "doaId": "string",
  "comment": "string"
}
```

### DOA Reports

#### POST /api/v1/doa/DownloadCompliledDoaLogPdf/:studyId
Download compiled DOA log as PDF.

**Parameters:**
- `studyId` (string) - The study identifier

**Request Body:**
```json
{
  "includeArchived": false,
  "format": "pdf"
}
```

**Response:** Binary PDF file

#### POST /api/v1/doa/DownloadChangeOnlyDoaLogPdf/:studyId
Download change-only DOA log as PDF.

**Parameters:**
- `studyId` (string) - The study identifier

**Request Body:**
```json
{
  "includeArchived": false,
  "format": "pdf"
}
```

**Response:** Binary PDF file

---

## Studies Endpoints

Base path: `/api/v1/studies`

### Study Management

#### GET /api/v1/studies/ListStudies
Get list of all studies accessible to the current user.

**Query Parameters:**
- `status` (string, optional) - Filter by status: 'active', 'archived', 'all'
- `page` (number, optional) - Page number for pagination
- `pageSize` (number, optional) - Number of results per page

**Response:**
```json
{
  "studies": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "active|archived",
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date",
      "owner": {
        "id": "string",
        "name": "string",
        "email": "string"
      }
    }
  ],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

#### GET /api/v1/studies/GetStudy/:studyId
Get detailed information about a specific study.

**Parameters:**
- `studyId` (string) - The study identifier

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "active|archived",
  "protocolNumber": "string",
  "sponsor": "string",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date",
  "owner": { ... },
  "permissions": ["string"]
}
```

#### POST /api/v1/studies/CreateStudy
Create a new study.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "protocolNumber": "string",
  "sponsor": "string"
}
```

#### PUT /api/v1/studies/UpdateStudy/:studyId
Update study information.

**Parameters:**
- `studyId` (string) - The study identifier

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "protocolNumber": "string",
  "sponsor": "string"
}
```

#### POST /api/v1/studies/ArchiveStudy/:studyId
Archive a study.

**Parameters:**
- `studyId` (string) - The study identifier

#### GET /api/v1/studies/GetActiveStudies
Get list of active studies only (convenience endpoint).

**Response:**
```json
{
  "studies": [ ... ]
}
```

---

## Source Binder Endpoints

Base path: `/api/v1/source`

### Binder Management

#### GET /api/v1/source/ListBinders
Get list of all binders accessible to the current user.

#### GET /api/v1/source/GetBinder/:binderId
Get detailed information about a specific binder.

**Parameters:**
- `binderId` (string) - The binder identifier

#### POST /api/v1/source/CreateNewSourceBinderFreeStanding
Create a new standalone source binder.

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

#### POST /api/v1/source/CreateNewSourceBinderWithStudy
Create a new source binder associated with a study.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "studyId": "string"
}
```

#### GET /api/v1/source/GetBinderPages/:binderId
Get pages within a binder.

**Parameters:**
- `binderId` (string) - The binder identifier

**Query Parameters:**
- `includeContent` (boolean, optional) - Include page content
- `page` (number, optional) - Page number for pagination

#### GET /api/v1/source/GetBinderPermissions/:binderId
Get permissions for a binder.

**Parameters:**
- `binderId` (string) - The binder identifier

#### GET /api/v1/source/GetBinderOwner/:binderId
Get owner information for a binder.

**Parameters:**
- `binderId` (string) - The binder identifier

### Binder User Management

#### POST /api/v1/source/AddUserToBinder/:binderId
Add a user to a binder.

**Parameters:**
- `binderId` (string) - The binder identifier

**Query Parameters:**
- `userId` (string) - User ID to add

#### POST /api/v1/source/RemoveUserFromBinder/:binderId
Remove a user from a binder.

**Parameters:**
- `binderId` (string) - The binder identifier

**Query Parameters:**
- `userId` (string) - User ID to remove

#### POST /api/v1/source/SetBinderOwner/:binderId
Set the owner of a binder.

**Parameters:**
- `binderId` (string) - The binder identifier

**Query Parameters:**
- `userId` (string) - New owner user ID

### Binder Updates

#### POST /api/v1/source/UpdateBinderName
Update binder name.

**Request Body:**
```json
{
  "binderId": "string",
  "name": "string"
}
```

#### POST /api/v1/source/UpdateBinderDescription
Update binder description.

**Request Body:**
```json
{
  "binderId": "string",
  "description": "string"
}
```

#### POST /api/v1/source/UpdateBinderProtocolInfo
Update binder protocol information.

**Request Body:**
```json
{
  "binderId": "string",
  "protocolNumber": "string",
  "protocolVersion": "string"
}
```

#### POST /api/v1/source/ArchiveBinder/:binderId
Archive a binder.

**Parameters:**
- `binderId` (string) - The binder identifier

**Request Body:**
```json
{
  "reason": "string"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```
