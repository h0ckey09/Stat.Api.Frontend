# Element Renderer Usage Guide

The Element Renderer service converts source element JSON data into HTML for display. This is useful for rendering forms, previews, and data displays.

## Quick Start

### 1. Import the Renderer

```typescript
import { renderElementToHTML, renderElementsAsForm } from '../services/elementRenderer';
import { ElementRenderer } from '../features/source_element';
```

### 2. Basic Usage - Single Element

```typescript
// Render a single element
const htmlString = renderElementToHTML(element, value, options);

// Or use the React component
<ElementRenderer 
  element={element} 
  value={value}
  mode="default"
/>
```

### 3. Render Multiple Elements as a Form

```typescript
const elements = [...]; // Array of SourceElement objects
const values = {
  1: 'John Doe',        // Element ID 1 has value 'John Doe'
  2: 'john@example.com', // Element ID 2 has value 'john@example.com'
  3: 42                  // Element ID 3 has value 42
};

const formHTML = renderElementsAsForm(elements, values);
```

## Supported Element Types

All 12 element types are supported:

1. **Text Input** - Single-line text field
2. **Text Area** - Multi-line text field
3. **Number Input** - Numeric input with validation
4. **Select Dropdown** - Single or multiple selection
5. **Date Picker** - Date/datetime selection
6. **Checkbox** - Boolean checkbox
7. **File Upload** - File upload with validation
8. **URL Input** - URL field with preview
9. **Email Input** - Email validation
10. **Color Picker** - Color selection with preview
11. **Radio Group** - Single selection from radio buttons
12. **Rich Text Editor** - WYSIWYG text editor

## Rendering Modes

### Default Mode (Interactive)
```typescript
<ElementRenderer 
  element={element} 
  value={value}
  mode="default"
  onChange={(newValue) => console.log(newValue)}
/>
```

### Preview Mode (Read-Only)
```typescript
<ElementRenderer 
  element={element} 
  value={value}
  mode="preview"
/>
```

### Compact Mode (For tables/lists)
```typescript
<ElementRenderer 
  element={element} 
  value={value}
  mode="compact"
/>
```

## Customization

### Custom CSS Classes

```typescript
const options = {
  cssClasses: {
    container: 'my-element-container',
    label: 'my-element-label',
    input: 'my-element-input',
    error: 'my-element-error',
    helpText: 'my-element-help'
  }
};

<ElementRenderer element={element} value={value} options={options} />
```

### Options

```typescript
interface RenderOptions {
  cssClasses?: {
    container?: string;
    label?: string;
    input?: string;
    error?: string;
    helpText?: string;
  };
  showLabels?: boolean;    // Show/hide labels
  readOnly?: boolean;      // Make fields read-only
  compact?: boolean;       // Use compact display
}
```

## Example: Rendering a Form

```tsx
import React, { useState } from 'react';
import { ElementRenderer } from '../features/source_element';

const MyForm = ({ elements }) => {
  const [formValues, setFormValues] = useState({});

  const handleChange = (elementId, value) => {
    setFormValues(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  return (
    <form>
      {elements.map(element => (
        <ElementRenderer
          key={element.id}
          element={element}
          value={formValues[element.id]}
          onChange={(value) => handleChange(element.id, value)}
        />
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Example: Displaying Element Data

```tsx
import React from 'react';
import { renderElementPreview } from '../services/elementRenderer';

const ElementDisplay = ({ element, value }) => {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: renderElementPreview(element, value) 
      }} 
    />
  );
};
```

## Element Data Structure

Each element has:
- `elementTypeId`: Type of element (1-12)
- `elementData`: JSON string with element configuration
- `label`: Display label
- `editorNotes`: Optional notes for editors

Example `elementData` for a text input:
```json
{
  "placeholder": "Enter your name",
  "maxLength": 100,
  "required": true,
  "pattern": "[A-Za-z ]+",
  "errorMessage": "Please enter a valid name"
}
```

## Styling

The renderer includes default styling, but you can override with CSS:

```css
.element-container {
  margin-bottom: 16px;
}

.element-label {
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
}

.element-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.element-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}
```

## Security

All user input is escaped to prevent XSS attacks. The renderer uses:
- HTML escaping for all text content
- Safe attribute handling
- Content sanitization

## Demo Component

Use the demo component to see all rendering modes:

```tsx
import { ElementRendererDemo } from '../features/source_element';

<ElementRendererDemo elements={elements} />
```

This shows:
- Interactive mode with value changes
- Preview mode (read-only)
- Compact mode for tables
- Raw HTML output

## API Reference

### Functions

#### `renderElementToHTML(element, value, options)`
Renders a single element to HTML string.

**Parameters:**
- `element: SourceElement` - The element to render
- `value: any` - Current value
- `options: RenderOptions` - Rendering options

**Returns:** `string` - HTML string

#### `renderElementsAsForm(elements, values, options)`
Renders multiple elements as a complete form.

**Parameters:**
- `elements: SourceElement[]` - Array of elements
- `values: Record<number, any>` - Element values by ID
- `options: RenderOptions` - Rendering options

**Returns:** `string` - Complete form HTML

#### `renderElementPreview(element, value)`
Renders element as read-only preview.

**Returns:** `string` - HTML string

#### `renderElementCompact(element, value)`
Renders element in compact mode.

**Returns:** `string` - HTML string

#### `getElementDisplayValue(element, value)`
Gets plain text display value for an element.

**Returns:** `string` - Display text
