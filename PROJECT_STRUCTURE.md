# React Frontend Project Structure Guide

This document explains the folder structure and organization of the React frontend application, following modern React development best practices.

## 📁 Root Directory Structure

```
src/
├── components/          # Shared/Global components
├── contexts/           # React Context providers
├── features/           # Feature-based modules
├── services/           # API services and utilities
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles and themes
├── assets/             # Static assets
├── types/              # TypeScript type definitions
└── App.js              # Main application component
```

---

## � Feature Relationships

### Source Binders ↔ Source Pages
Since Source Binders are collections of Source Pages, these features will interact:

**How they work together:**
- **Source Binder** can import and use Source Page components
- **Source Page** hooks can accept a `binderId` parameter
- Both features remain independent but composable

**Example integrations:**
```javascript
// In SourceBinderDetail.js
import { SourcePageTable, useSourcePagesBinder } from '../source_page';

// In useSourcePagesBinder.js
const useSourcePagesBinder = (binderId) => {
  // Fetch pages specific to a binder
};

// In SourceBinderForm.js
import { SourcePageSelector } from '../source_page';
```

**API Endpoint Examples:**
- Source Binders: `/api/v1/source/ListBinders`, `/api/v1/source/GetBinder/{id}`
- Source Pages: `/api/v1/source/ListPages`, `/api/v1/source/GetBinderPages/{binderId}`

---

## �📂 Detailed Folder Explanations

### `/src/components/`
**Purpose:** Shared, reusable components used across multiple features or pages.

**What goes here:**
- Navigation components (Navbar, Sidebar)
- Layout components (Header, Footer)
- Common UI elements (Modal, Loading, ErrorBoundary)
- Form components (Button, Input, Select)
- Generic display components

**Example structure:**
```
components/
├── layout/
│   ├── Navbar.js
│   ├── Header.js
│   └── Footer.js
├── ui/
│   ├── Button.js
│   ├── Modal.js
│   └── LoadingSpinner.js
└── forms/
    ├── Input.js
    └── Select.js
```

---

### `/src/contexts/`
**Purpose:** React Context providers for global state management.

**What goes here:**
- Authentication context
- Theme context
- User settings context
- Global application state

**Example structure:**
```
contexts/
├── AuthContext.js      # User authentication state
├── ThemeContext.js     # UI theme management
└── AppContext.js       # Global app state
```

---

### `/src/features/`
**Purpose:** Feature-based organization following domain-driven design principles.

**What goes here:**
- Self-contained feature modules
- Each feature has its own components, hooks, services
- Business logic specific to that feature

**Feature Structure Pattern:**
```
features/
├── feature_name/
│   ├── components/     # Feature-specific components
│   ├── hooks/          # Feature-specific custom hooks
│   ├── services/       # Feature API calls and business logic
│   ├── pages/          # Full page components
│   ├── types/          # Feature-specific TypeScript types
│   └── index.js        # Feature exports
```

**Current Features:**

#### `/src/features/source_binder/`
**Purpose:** Everything related to Source Binder functionality.

```
source_binder/
├── components/
│   └── SourceBinderTable.js       # Reusable table component
├── hooks/
│   └── useSourceBinders.js        # State management hooks
├── services/
│   └── sourceBinderApi.js         # API service layer
├── pages/
│   └── SourceBinderList.js        # Full page components
└── index.js                       # Feature exports
```

#### `/src/features/source_page/`
**Purpose:** Everything related to Source Page functionality within binders.

```
source_page/
├── components/
│   ├── SourcePageTable.js         # Page listing component
│   ├── SourcePageCard.js          # Individual page display
│   └── SourcePageForm.js          # Create/edit page form
├── hooks/
│   ├── useSourcePages.js          # Page state management
│   └── useSourcePagesBinder.js    # Pages within a binder
├── services/
│   └── sourcePageApi.js           # Page API calls
├── pages/
│   ├── SourcePageList.js          # Standalone page listing
│   └── SourcePageDetail.js        # Individual page view
└── index.js                       # Feature exports
```

**What each subfolder contains:**

**Source Binder Feature:**
- **`components/`** - UI components specific to source binders
  - Tables, forms, cards, modals for binder management
  - Should be reusable within the binder feature
  
- **`hooks/`** - Custom hooks for source binder state management
  - Data fetching hooks (`useSourceBinders`)
  - Form hooks (`useCreateSourceBinder`)
  - State management logic
  
- **`services/`** - API calls and business logic for binders
  - HTTP requests to backend for binder operations
  - Data transformation
  - Error handling
  
- **`pages/`** - Full page components for binders
  - Complete views that combine multiple components
  - Route components for binder management
  - Page-level state management

**Source Page Feature:**
- **`components/`** - UI components specific to source pages
  - Page tables, cards, forms for individual pages
  - Components for displaying page content
  
- **`hooks/`** - Custom hooks for source page state management
  - Page fetching hooks (`useSourcePages`, `useSourcePagesBinder`)
  - CRUD operations for pages
  - Relationship management between pages and binders
  
- **`services/`** - API calls and business logic for pages
  - HTTP requests for page operations
  - Page content management
  - Integration with binder relationships
  
- **`pages/`** - Full page components for pages
  - Standalone page management views
  - Detail views for individual pages
  - Integration views showing pages within binders

---

### `/src/services/`
**Purpose:** Global API services and utilities shared across features.

**What goes here:**
- Base API configuration
- Authentication services
- Global error handling
- Shared HTTP utilities

**Example structure:**
```
services/
├── apiService.js       # Base API configuration
├── authService.js      # Authentication utilities
└── httpClient.js       # Axios configuration
```

---

### `/src/hooks/`
**Purpose:** Custom React hooks used across multiple features.

**What goes here:**
- Generic data fetching hooks
- Form management hooks
- Local storage hooks
- Window/browser API hooks

**Example structure:**
```
hooks/
├── useApi.js           # Generic API call hook
├── useLocalStorage.js  # Local storage management
└── useDebounce.js      # Debouncing utility hook
```

---

### `/src/utils/`
**Purpose:** Pure utility functions and helpers.

**What goes here:**
- Date formatting functions
- String manipulation
- Data validation
- Constants and enums

**Example structure:**
```
utils/
├── dateUtils.js        # Date formatting helpers
├── stringUtils.js      # String manipulation
├── validation.js       # Form validation rules
└── constants.js        # App-wide constants
```

---

### `/src/styles/`
**Purpose:** Global styles, themes, and CSS-in-JS configurations.

**What goes here:**
- Material-UI theme configuration
- Global CSS files
- Style constants and variables
- Responsive breakpoint definitions

**Example structure:**
```
styles/
├── theme.js            # Material-UI theme
├── globalStyles.css    # Global CSS rules
└── breakpoints.js      # Responsive breakpoints
```

---

### `/src/assets/`
**Purpose:** Static assets like images, icons, and fonts.

**What goes here:**
- Images (logos, illustrations)
- Icons (SVG files)
- Fonts
- Static JSON data

**Example structure:**
```
assets/
├── images/
│   ├── logo.svg
│   └── hero-image.png
├── icons/
│   └── icon-set.svg
└── fonts/
    └── custom-font.woff2
```

---

### `/src/types/` (if using TypeScript)
**Purpose:** Global TypeScript type definitions.

**What goes here:**
- API response types
- Global interface definitions
- Shared type utilities
- Third-party library type extensions

**Example structure:**
```
types/
├── api.ts              # API response types
├── user.ts             # User-related types
└── common.ts           # Common utility types
```

---

## 🎯 Best Practices

### Feature Organization
- **Keep features self-contained**: Each feature should have minimal dependencies on others
- **Use index.js files**: Export main components/functions from index files
- **Follow naming conventions**: Use PascalCase for components, camelCase for functions

### Component Organization
- **Small, focused components**: Each component should have a single responsibility
- **Prop interfaces**: Document component props clearly
- **Default props**: Provide sensible defaults for optional props

### File Naming Conventions
- **Components**: `PascalCase.js` (e.g., `SourceBinderTable.js`)
- **Hooks**: `camelCase.js` starting with "use" (e.g., `useSourceBinders.js`)
- **Services**: `camelCase.js` ending with purpose (e.g., `sourceBinderApi.js`)
- **Pages**: `PascalCase.js` ending with "Page" (e.g., `SourceBinderListPage.js`)

### Import/Export Guidelines
- **Named exports** for utilities and hooks
- **Default exports** for React components
- **Barrel exports** using index.js files for cleaner imports

---

## 📋 Adding New Features

When adding a new feature, follow this structure:

1. **Create feature folder**: `/src/features/my_new_feature/`
2. **Add subfolders**: `components/`, `hooks/`, `services/`, `pages/`
3. **Create API service**: Define all API calls in `services/`
4. **Create custom hooks**: Handle state management in `hooks/`
5. **Build components**: Create reusable UI components
6. **Create pages**: Combine components into full pages
7. **Export from index.js**: Make feature easily importable

---

## 🔗 Import Examples

```javascript
// Good: Import from feature index
import { SourceBinderTable, useSourceBinders } from '../features/source_binder';

// Good: Import shared components
import { LoadingSpinner, ErrorBoundary } from '../components/ui';

// Good: Import global services
import { apiService } from '../services/apiService';
```

---

This structure promotes:
- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns  
- **Reusability**: Components and hooks can be shared
- **Testability**: Each part can be tested independently
- **Team Collaboration**: Clear ownership and organization
