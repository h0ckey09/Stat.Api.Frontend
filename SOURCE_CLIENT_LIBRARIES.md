# Source Client Libraries Documentation

This document provides comprehensive information about the JavaScript client libraries for Source Binder, Source Pages, and Source Element operations.

## Overview

Three client-side JavaScript libraries have been created to interact with the Stat API Server's source-related endpoints:

1. **BinderApisV2Client** - Source Binder operations (enhanced)
2. **SourceElementClient** - Source Element operations (new)
3. **SourcePagesClient** - Source Page operations (new)

All libraries follow the same design pattern:
- jQuery-based AJAX calls
- Return jQuery Promise objects
- Consistent error handling
- Proper URL encoding
- JSDoc documentation

## Prerequisites

- jQuery 3.x or higher
- Valid authentication token (handled by Auth module)

## Installation

Include the libraries in your HTML file:

```html
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Source Client Libraries -->
<script src="/src/assets/js/binderApisV2Client.js"></script>
<script src="/src/assets/js/sourceElementClient.js"></script>
<script src="/src/assets/js/sourcePagesClient.js"></script>
```

## BinderApisV2Client

Enhanced client for source binder operations.

### Methods

#### Binder Creation

**createNewSourceBinderFreeStanding(payload, ajaxOptions)**
- Creates a new source binder without study association
- Payload: `{ name: string, description: string }`
- Returns: Promise with created binder object

**createNewSourceBinderWithStudy(payload, ajaxOptions)**
- Creates a new source binder associated with a study
- Payload: `{ studyId: number, protocolVersion: number, protocolReleaseDate: string, description: string }`
- Returns: Promise with created binder object

#### Binder Information

**getBinder(binderId, ajaxOptions)**
- Gets binder information
- Returns: Promise with binder object

**listBinders(ajaxOptions)**
- Lists all binders for current user
- Returns: Promise with array of binder objects

**getBinderPages(binderId, options, ajaxOptions)**
- Gets pages in a binder
- Options: `{ simple: boolean, onlyActive: boolean }`
- Returns: Promise with array of page objects

**getBinderPagesIdList(binderId, ajaxOptions)**
- Gets a list of page IDs in a binder
- Returns: Promise with array of page IDs

#### Binder Permissions

**getBinderPermissions(binderId, ajaxOptions)**
- Gets all permissions for a binder
- Returns: Promise with array of permission objects

**getBinderOwner(binderId, ajaxOptions)**
- Gets the owner of a binder
- Returns: Promise with user object

**getCurrentUserBinderPermission(binderId, ajaxOptions)**
- Gets current user's permission for a binder
- Returns: Promise with permission object

**getUserBinderPermission(binderId, userId, ajaxOptions)**
- Gets specific user's permission for a binder
- Returns: Promise with permission object

**addUserToBinder(binderId, userId, ajaxOptions)**
- Adds a user to a binder
- Returns: Promise with result

**removeUserFromBinder(binderId, userId, ajaxOptions)**
- Removes a user from a binder
- Returns: Promise with result

**setBinderOwner(binderId, userId, ajaxOptions)**
- Sets the owner of a binder
- Returns: Promise with result

#### Binder Updates

**updateBinderProtocolInfo(payload, ajaxOptions)**
- Updates binder protocol information
- Payload: `{ binderId: number, protocolVersion: string, protocolDate: Date }`
- Returns: Promise with result

**updateBinderDescription(payload, ajaxOptions)**
- Updates binder description
- Payload: `{ binderId: number, description: string }`
- Returns: Promise with result

**updateBinderName(payload, ajaxOptions)**
- Updates binder name
- Payload: `{ binderId: number, name: string }`
- Returns: Promise with result

#### Binder Archive

**archiveBinder(binderId, payload, ajaxOptions)**
- Archives a binder
- Returns: Promise with result

**unarchiveBinder(binderId, payload, ajaxOptions)**
- Unarchives a binder
- Returns: Promise with result

### Example Usage

```javascript
// List all binders
BinderApisV2Client.listBinders()
  .done(function(binders) {
    console.log('Binders:', binders);
  })
  .fail(function(error) {
    console.error('Error:', error);
  });

// Get binder details
BinderApisV2Client.getBinder(123)
  .done(function(binder) {
    console.log('Binder:', binder);
  });

// Create new binder
BinderApisV2Client.createNewSourceBinderFreeStanding({
  name: 'My Binder',
  description: 'Test binder'
})
  .done(function(result) {
    console.log('Created binder:', result);
  });
```

---

## SourceElementClient

Client for source element operations.

### Methods

#### Element Rendering

**renderElementHtmlFromData(elementData, ajaxOptions)**
- Renders element HTML from element data string
- Returns: Promise with HTML string

**renderElementHtmlById(elementId, ajaxOptions)**
- Renders element HTML by element ID
- Returns: Promise with HTML string

#### Element Retrieval

**getElement(elementId, options, ajaxOptions)**
- Gets an element by ID
- Options: `{ includePageInfo: boolean }`
- Returns: Promise with element object

**getCloneParentElement(elementId, options, ajaxOptions)**
- Gets the clone parent of an element
- Options: `{ includePageInfo: boolean }`
- Returns: Promise with parent element object

**getAllClonesOfElement(elementId, options, ajaxOptions)**
- Gets all clones of an element
- Options: `{ includeParent: boolean }`
- Returns: Promise with array of clone elements

#### Element Creation and Cloning

**createElement(payload, ajaxOptions)**
- Creates a new element
- Payload: `{ pageId: number, elementType: string, ... }`
- Returns: Promise with created element

**cloneElement(elementId, options, ajaxOptions)**
- Clones an element to a new page
- Options: `{ newPageId: number, order: number, disassociate: boolean }`
- Returns: Promise with cloned element

**disassociateClone(elementId, ajaxOptions)**
- Disassociates a clone from its parent
- Returns: Promise with result

#### Element Updates

**updateElement(elementId, payload, options, ajaxOptions)**
- Updates an element
- Options: `{ updateMethod: 'me' | 'clones' }`
- Returns: Promise with result

**updateElementOrder(elementId, options, ajaxOptions)**
- Updates element order on a page
- Options: `{ order: number, returnOrderOnly: boolean }`
- Returns: Promise with result

#### Element Lifecycle

**deleteElement(elementId, ajaxOptions)**
- Soft deletes an element
- Returns: Promise with result

**recoverElement(elementId, ajaxOptions)**
- Recovers a deleted element
- Returns: Promise with result

#### Element Review

**reviewApproveElement(elementId, ajaxOptions)**
- Approves an element in review
- Returns: Promise with result

**reviewQueryElement(elementId, payload, ajaxOptions)**
- Queries an element in review
- Payload: `{ notes: string }`
- Returns: Promise with result

#### Element Metadata

**getDefaultLabel(elementId, ajaxOptions)**
- Gets the default label for an element
- Returns: Promise with label object

**getCloneUpgradeReport(elementId, ajaxOptions)**
- Gets a clone upgrade report for an element
- Returns: Promise with upgrade report

### Example Usage

```javascript
// Get element
SourceElementClient.getElement(456, { includePageInfo: true })
  .done(function(element) {
    console.log('Element:', element);
  });

// Create element
SourceElementClient.createElement({
  pageId: 123,
  elementType: 'text',
  content: 'Hello World'
})
  .done(function(element) {
    console.log('Created element:', element);
  });

// Update element
SourceElementClient.updateElement(456, {
  content: 'Updated content'
}, { updateMethod: 'me' })
  .done(function(result) {
    console.log('Updated:', result);
  });
```

---

## SourcePagesClient

Client for source page operations.

### Methods

#### Page Rendering

**renderPage(pageId, options, ajaxOptions)**
- Renders a source page as HTML
- Options: `{ autorefresh: boolean, showborders: boolean, bodyonly: boolean }`
- Returns: Promise with HTML string

#### Page Information

**getPage(pageId, options, ajaxOptions)**
- Gets page information
- Options: `{ includeBinderInfo: boolean, includePermissions: boolean }`
- Returns: Promise with page object

#### Page Creation and Cloning

**createNewPage(payload, ajaxOptions)**
- Creates a new source page
- Payload: `{ binderId: number, sourcePageName?: string, studyArmId?: number }`
- Returns: Promise with created page

**clonePage(payload, ajaxOptions)**
- Clones a source page to another binder
- Payload: `{ sourcePageId: number, destBinderId: number, replacementStudyArmId?: number, replacementName?: string }`
- Returns: Promise with cloned page

#### Page Elements

**getPageElements(pageId, ajaxOptions)**
- Gets elements for a page
- Returns: Promise with array of elements

**getElementsForPage(pageId, ajaxOptions)**
- Alias for getPageElements
- Returns: Promise with array of elements

**getElementsOrderForPage(pageId, ajaxOptions)**
- Gets element order for a page
- Returns: Promise with array of element IDs in order

**reorderElements(pageId, options, ajaxOptions)**
- Reorders elements on a page
- Options: `{ returnOrderOnly: boolean }`
- Returns: Promise with result

#### Page Export

**downloadPagePdf(pageId, ajaxOptions)**
- Downloads a page as PDF (v1 endpoint)
- Automatically triggers browser download
- Returns: Promise

**downloadPagePdfV2(pageId, ajaxOptions)**
- Downloads a page as PDF (v2 endpoint)
- Automatically triggers browser download
- Returns: Promise

#### Page Permissions

**getPagePermissions(pageId, ajaxOptions)**
- Gets all permissions for a page
- Returns: Promise with array of permissions

**getUserPagePermissions(pageId, userId, ajaxOptions)**
- Gets specific user's permissions for a page
- Returns: Promise with permission object

**addReviewerPermissions(pageId, payload, ajaxOptions)**
- Adds reviewer permissions to a page
- Payload: `{ userId: number }`
- Returns: Promise with result

**removeReviewerPermissions(pageId, payload, ajaxOptions)**
- Removes reviewer permissions from a page
- Payload: `{ userId: number }`
- Returns: Promise with result

**addEditorPermissions(pageId, payload, ajaxOptions)**
- Adds editor permissions to a page
- Payload: `{ userId: number }`
- Returns: Promise with result

**removeEditorPermissions(pageId, payload, ajaxOptions)**
- Removes editor permissions from a page
- Payload: `{ userId: number }`
- Returns: Promise with result

#### Page Versioning

**getNextPageRevision(pageId, ajaxOptions)**
- Gets the next page revision
- Returns: Promise with revision info

**getMostCurrentPageVersion(pageId, ajaxOptions)**
- Gets the most current page version
- Returns: Promise with version info

**upgradePage(pageId, ajaxOptions)**
- Upgrades a page to a new version
- Returns: Promise with result

**rescindSourcePage(pageId, payload, ajaxOptions)**
- Rescinds a source page
- Payload: `{ previousTxnId?: number }`
- Returns: Promise with result

### Example Usage

```javascript
// Get page
SourcePagesClient.getPage(789, { includeBinderInfo: true })
  .done(function(page) {
    console.log('Page:', page);
  });

// Create page
SourcePagesClient.createNewPage({
  binderId: 123,
  sourcePageName: 'New Page'
})
  .done(function(page) {
    console.log('Created page:', page);
  });

// Get page elements
SourcePagesClient.getPageElements(789)
  .done(function(elements) {
    console.log('Elements:', elements);
  });

// Download PDF
SourcePagesClient.downloadPagePdf(789)
  .done(function() {
    console.log('PDF download started');
  });

// Add editor permission
SourcePagesClient.addEditorPermissions(789, { userId: 42 })
  .done(function(result) {
    console.log('Permission added:', result);
  });
```

---

## Error Handling

All methods return jQuery Promise objects, so you can use `.done()`, `.fail()`, and `.always()`:

```javascript
BinderApisV2Client.getBinder(123)
  .done(function(binder) {
    // Success
    console.log('Binder:', binder);
  })
  .fail(function(xhr, status, error) {
    // Error
    console.error('Failed to get binder:', error);
    console.error('Status:', xhr.status);
    console.error('Response:', xhr.responseText);
  })
  .always(function() {
    // Always executed
    console.log('Request completed');
  });
```

## Advanced AJAX Options

All methods accept an optional `ajaxOptions` parameter to override default jQuery AJAX settings:

```javascript
SourcePagesClient.getPage(789, null, {
  timeout: 30000,  // Custom timeout
  headers: {
    'X-Custom-Header': 'value'
  },
  beforeSend: function(xhr) {
    console.log('Sending request...');
  }
});
```

## Authentication

All requests automatically include the authentication header via jQuery's AJAX setup. Ensure the Auth module is initialized before making API calls:

```javascript
Auth.init().then(function() {
  // Now safe to use client libraries
  BinderApisV2Client.listBinders()
    .done(function(binders) {
      console.log('Binders:', binders);
    });
});
```

## API Endpoints Reference

For complete API endpoint documentation, see [API_ENDPOINTS.md](../../../API_ENDPOINTS.md).

## Browser Compatibility

These libraries require:
- ES5 JavaScript support
- jQuery 3.x
- Modern browser with Promise support
- XMLHttpRequest Level 2 (for blob responses in PDF downloads)

## Troubleshooting

### "$ is not defined"
- Ensure jQuery is loaded before the client libraries

### "BinderApisV2Client is not defined"
- Ensure the script is included in your HTML
- Check for JavaScript errors in console

### CORS Errors
- Configure backend CORS to allow your frontend domain

### 401 Unauthorized
- Ensure Auth.init() has been called
- Check that you're logged in with valid credentials

### Timeout Errors
- Increase timeout in ajaxOptions for slow operations
- Default timeouts: 15-60 seconds depending on operation

---

## License

See repository license.
