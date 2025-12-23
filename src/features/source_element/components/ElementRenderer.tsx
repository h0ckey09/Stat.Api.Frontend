import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { SourceElement } from '../../../types/sourceElement';
import { renderElementToHTML, renderElementPreview, renderElementCompact, RenderOptions } from '../../../services/elementRenderer';
import { useRenderElementHtml } from '../hooks/useSourceElements';
import { Box, CircularProgress, Alert } from '@mui/material';

interface ElementRendererProps {
  element: SourceElement;
  value?: any;
  options?: RenderOptions;
  mode?: 'default' | 'preview' | 'compact';
  onChange?: (value: any) => void;
  useServerRendering?: boolean; // New prop to control rendering method
  cssUrl?: string; // Optional CSS file URL to inject into preview
}

/**
 * React component wrapper for element rendering
 * Supports both client-side and server-side rendering
 * Server-side rendering is now the default
 */
export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  value,
  options = {},
  mode = 'default',
  onChange,
  useServerRendering = true, // Default to server-side rendering
  cssUrl
}) => {
  const [clientHtml, setClientHtml] = useState<string>('');
  
  // Always call the hook, but only pass element ID if server rendering is enabled
  // This ensures hooks are called in the same order every render
  const { html: serverHtml, loading, error, fetchHtml } = useRenderElementHtml(
    useServerRendering && element.id ? element.id : undefined
  );

  // Generate client-side HTML as fallback or when explicitly requested
  useEffect(() => {
    if (!useServerRendering) {
      let html: string;
      switch (mode) {
        case 'preview':
          html = renderElementPreview(element, value);
          break;
        case 'compact':
          html = renderElementCompact(element, value);
          break;
        default:
          html = renderElementToHTML(element, value, options);
      }
      setClientHtml(html);
    }
  }, [element, value, options, mode, useServerRendering]);

  // Handle value changes if onChange is provided (client-side only)
  const handleChange = useCallback((event: Event) => {
    if (!onChange) return;

    const target = event.target as HTMLInputElement;
    let newValue: any;

    switch (element.elementTypeId) {
      case 3: // Number
        newValue = target.valueAsNumber;
        break;
      case 6: // Checkbox
        newValue = target.checked;
        break;
      case 5: // Date
        newValue = target.valueAsDate;
        break;
      case 4: // Select (multiple)
        if (target instanceof HTMLSelectElement && target.multiple) {
          newValue = Array.from(target.selectedOptions).map(opt => opt.value);
        } else {
          newValue = target.value;
        }
        break;
      default:
        newValue = target.value;
    }

    onChange(newValue);
  }, [onChange, element.elementTypeId]);

  useEffect(() => {
    // Only attach change listeners for client-side rendering with onChange handler
    if (!onChange || useServerRendering) return;

    // Attach change event listeners to rendered elements (client-side only)
    const container = document.getElementById(`element-${element.id}`);
    if (container) {
      container.addEventListener('change', handleChange);
      container.addEventListener('input', handleChange);

      return () => {
        container.removeEventListener('change', handleChange);
        container.removeEventListener('input', handleChange);
      };
    }
  }, [element.id, onChange, useServerRendering, handleChange]);

  // Determine which HTML to use
  let htmlContent = useServerRendering ? serverHtml : clientHtml;

  // Handle server-side rendering states (AFTER all hooks have been called)
  if (useServerRendering) {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (error) {
      // Check if it's an authentication error
      const isAuthError = error.includes('Authentication') || 
                         error.includes('authentication') || 
                         error.includes('No authentication token');
      
      return (
        <Alert severity={isAuthError ? 'info' : 'error'} sx={{ mb: 2 }}>
          {isAuthError 
            ? 'Server preview requires authentication. Please log in to view server-rendered preview.'
            : `Failed to render element: ${error}`
          }
        </Alert>
      );
    }

    if (!serverHtml) {
      return null;
    }

    // Wrap server HTML in complete document structure for proper rendering
    htmlContent = `
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
  ${serverHtml}
</body>
</html>`;
  }

  return (
    <Box
      className="element-renderer-wrapper"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
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
        '& .element-help-text': {
          display: 'block',
          marginTop: 0.5,
          fontSize: '12px',
          color: 'text.secondary'
        },
        '& .element-error': {
          padding: 1,
          marginTop: 1,
          border: '1px solid',
          borderColor: 'error.main',
          backgroundColor: 'error.light',
          color: 'error.dark',
          borderRadius: 1
        },
        '& textarea.element-input': {
          resize: 'vertical',
          minHeight: '60px'
        },
        '& select.element-input': {
          cursor: 'pointer'
        },
        '& .checkbox-wrapper': {
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '& input[type="checkbox"]': {
            width: 'auto',
            cursor: 'pointer'
          },
          '& label': {
            cursor: 'pointer',
            marginBottom: 0
          }
        },
        '& .radio-group': {
          display: 'flex',
          gap: 2,
          '&.radio-group-vertical': {
            flexDirection: 'column'
          },
          '&.radio-group-horizontal': {
            flexDirection: 'row',
            flexWrap: 'wrap'
          }
        },
        '& .radio-option': {
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          '& input[type="radio"]': {
            width: 'auto',
            cursor: 'pointer'
          },
          '& label': {
            cursor: 'pointer',
            marginBottom: 0
          }
        },
        '& .color-preview': {
          marginLeft: 1,
          borderRadius: '4px'
        },
        '& .number-unit': {
          marginLeft: 0.5,
          color: 'text.secondary'
        },
        '& .file-size-hint': {
          display: 'block',
          marginTop: 0.5,
          fontSize: '12px',
          color: 'text.secondary'
        },
        '& .current-file': {
          marginTop: 1,
          padding: 1,
          backgroundColor: 'grey.100',
          borderRadius: 1,
          fontSize: '12px'
        },
        '& .url-preview': {
          marginLeft: 1,
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline'
          }
        },
        '& .rich-text-editor': {
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: 1,
          '&:focus': {
            outline: 'none',
            borderColor: 'primary.main'
          }
        },
        '& .rich-text-display': {
          padding: 1,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          minHeight: '100px'
        }
      }}
    />
  );
};

export default ElementRenderer;
