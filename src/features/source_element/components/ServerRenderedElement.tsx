import React from 'react';
import { Box, CircularProgress, Alert, Paper, Typography } from '@mui/material';
import { useRenderElementHtml } from '../hooks/useSourceElements';

interface ServerRenderedElementProps {
  elementId: number | string;
  showLabel?: boolean;
  label?: string;
  cssUrl?: string; // Optional CSS file URL to inject into preview
}

/**
 * Component that renders a source element using server-side HTML rendering
 * Fetches pre-rendered HTML from the backend API
 */
export const ServerRenderedElement: React.FC<ServerRenderedElementProps> = ({
  elementId,
  showLabel = false,
  label,
  cssUrl
}) => {
  const { html, loading, error } = useRenderElementHtml(elementId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to render element: {error}
      </Alert>
    );
  }

  if (!html) {
    return null;
  }

  // Wrap server HTML in complete document structure for proper rendering
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Element Preview</title>${cssUrl ? `
  <link rel="stylesheet" href="${cssUrl}">` : ''}
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 16px; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  return (
    <Box className="server-rendered-element">
      {showLabel && label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}
      <Box
        dangerouslySetInnerHTML={{ __html: fullHtml }}
        sx={{
          '& .element-container': {
            marginBottom: 2
          },
          '& .element-label': {
            display: 'block',
            fontWeight: 600,
            marginBottom: 0.5,
            color: 'text.primary'
          },
          '& .element-input': {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            '&:focus': {
              outline: 'none',
              borderColor: 'primary.main',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
            }
          },
          '& textarea.element-input': {
            resize: 'vertical',
            minHeight: '60px'
          },
          '& select.element-input': {
            cursor: 'pointer'
          }
        }}
      />
    </Box>
  );
};

/**
 * Component that renders multiple elements using server-side rendering
 */
interface ServerRenderedElementsProps {
  elementIds: (number | string)[];
  title?: string;
}

export const ServerRenderedElements: React.FC<ServerRenderedElementsProps> = ({
  elementIds,
  title
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {elementIds.map((id) => (
          <ServerRenderedElement key={id} elementId={id} />
        ))}
      </Box>
    </Paper>
  );
};

export default ServerRenderedElement;
