# Server-Rendered Element HTML - Usage Guide

The application now supports fetching server-rendered HTML for source elements from your backend API.

## Backend Endpoint

Your backend handles rendering at: `/api/v1/source/RenderElementHtml/:id`

## API Service Method

```javascript
import { sourceElementApi } from '../features/source_element';

// Fetch server-rendered HTML
const html = await sourceElementApi.renderElementHtml(elementId);
```

## React Hook

```typescript
import { useRenderElementHtml } from '../features/source_element';

const MyComponent = () => {
  const { html, loading, error, fetchHtml } = useRenderElementHtml(elementId);
  
  // Automatically fetches HTML on mount
  // Or manually fetch: await fetchHtml(elementId);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
};
```

## React Components

### Single Element

```tsx
import { ServerRenderedElement } from '../features/source_element';

<ServerRenderedElement 
  elementId={123}
  showLabel={true}
  label="User Input"
/>
```

### Multiple Elements

```tsx
import { ServerRenderedElements } from '../features/source_element';

<ServerRenderedElements 
  elementIds={[1, 2, 3, 4]}
  title="Form Elements"
/>
```

## Features

✅ **Automatic loading states** - Shows spinner while fetching  
✅ **Error handling** - Displays error alerts if fetch fails  
✅ **Authentication** - Uses your Auth system automatically  
✅ **Type-safe** - Full TypeScript support  
✅ **Styled** - Includes default Material-UI styling  

## Example: Display Element in Preview Tab

```tsx
import { useRenderElementHtml } from '../features/source_element';

const PreviewTab = ({ elementId }) => {
  const { html, loading, error } = useRenderElementHtml(elementId);
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Server Preview</Typography>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Paper>
  );
};
```

## Example: Refresh HTML on Demand

```tsx
const { html, loading, fetchHtml } = useRenderElementHtml();

// Fetch HTML when needed
const handleRefresh = async () => {
  await fetchHtml(elementId);
};

<Button onClick={handleRefresh} disabled={loading}>
  Refresh Preview
</Button>
```

## API Response Format

The backend endpoint should return one of:
- Plain HTML string: `"<div>...</div>"`
- Object with `html` property: `{ html: "<div>...</div>" }`
- Object with `Html` property: `{ Html: "<div>...</div>" }`

The service automatically handles all three formats.

## Combined Client/Server Rendering

You can use both approaches:

```tsx
// Client-side rendering (from elementRenderer.ts)
import { renderElementToHTML } from '../services/elementRenderer';
const clientHtml = renderElementToHTML(element, value);

// Server-side rendering (from backend API)
import { useRenderElementHtml } from '../features/source_element';
const { html: serverHtml } = useRenderElementHtml(element.id);
```

Use client-side for:
- Interactive forms with immediate feedback
- Dynamic preview while editing
- Offline capability

Use server-side for:
- Final rendered output
- Complex rendering logic on backend
- Consistent rendering across platforms
- Security-sensitive rendering
