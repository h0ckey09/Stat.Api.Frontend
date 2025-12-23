import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { SourceElement } from '../../../types/sourceElement';
import ElementRenderer from '../components/ElementRenderer';
import { renderElementsAsForm } from '../../../services/elementRenderer';

interface ElementRendererDemoProps {
  elements: SourceElement[];
}

/**
 * Demo component showing different ways to use the element renderer
 */
export const ElementRendererDemo: React.FC<ElementRendererDemoProps> = ({ elements }) => {
  const [tabValue, setTabValue] = useState(0);
  const [formValues, setFormValues] = useState<Record<number, any>>({});
  const [formHTML, setFormHTML] = useState('');
  const [useServerRendering, setUseServerRendering] = useState(true); // Default to server rendering

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleValueChange = (elementId: number, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  const generateFormHTML = () => {
    const html = renderElementsAsForm(elements, formValues, {
      showLabels: true,
      readOnly: false
    });
    setFormHTML(html);
  };

  const renderDefaultMode = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {elements.map(element => (
        <Box key={element.id} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
          <Card>
            <CardHeader
              title={element.label}
              subheader={`Type: ${element.elementTypeLabel} | Order: ${element.order}`}
            />
            <Divider />
            <CardContent>
              <ElementRenderer
                element={element}
                value={formValues[element.id]}
                mode="default"
                onChange={(value) => handleValueChange(element.id, value)}
                useServerRendering={useServerRendering}
              />
              
              {element.editorNotes && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    <strong>Editor Notes:</strong> {element.editorNotes}
                  </Typography>
                </Alert>
              )}

              {formValues[element.id] !== undefined && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" component="div">
                    <strong>Current Value:</strong> {JSON.stringify(formValues[element.id])}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );

  const renderPreviewMode = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {elements.map(element => (
        <Box key={element.id} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
          <Card>
            <CardHeader title={element.label} />
            <Divider />
            <CardContent>
              <ElementRenderer
                element={element}
                value={formValues[element.id] || getSampleValue(element)}
                mode="preview"
                useServerRendering={useServerRendering}
              />
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );

  const renderCompactMode = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Compact Display (for tables/lists)
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {elements.map(element => (
        <Box key={element.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 600 }}>
            {element.label}:
          </Typography>
          <ElementRenderer
            element={element}
            value={formValues[element.id] || getSampleValue(element)}
            mode="compact"
            useServerRendering={useServerRendering}
          />
        </Box>
      ))}
    </Paper>
  );

  const renderHTMLOutput = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant="contained" onClick={generateFormHTML}>
          Generate HTML
        </Button>
        <Typography variant="body2" color="text.secondary">
          Click to generate complete form HTML
        </Typography>
      </Box>

      {formHTML && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Generated HTML:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            >
              {formHTML}
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rendered Output:
            </Typography>
            <Box
              dangerouslySetInnerHTML={{ __html: formHTML }}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}
            />
          </Paper>
        </>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Element Renderer Demo
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={useServerRendering ? 'Server Rendering' : 'Client Rendering'}
            color={useServerRendering ? 'primary' : 'secondary'}
            size="small"
          />
          <FormControlLabel
            control={
              <Switch
                checked={useServerRendering}
                onChange={(e) => setUseServerRendering(e.target.checked)}
              />
            }
            label="Use Server Rendering"
          />
        </Box>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {useServerRendering 
          ? 'Using server-side rendering: HTML is fetched from the backend API (/api/v1/source/RenderElementHtml/:id)'
          : 'Using client-side rendering: HTML is generated in the browser using elementRenderer.ts'
        }
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Interactive (Default)" />
          <Tab label="Preview (Read-Only)" />
          <Tab label="Compact" />
          <Tab label="HTML Output" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && renderDefaultMode()}
        {tabValue === 1 && renderPreviewMode()}
        {tabValue === 2 && renderCompactMode()}
        {tabValue === 3 && renderHTMLOutput()}
      </Box>
    </Box>
  );
};

/**
 * Generate sample values for demonstration
 */
const getSampleValue = (element: SourceElement): any => {
  try {
    const elementData = JSON.parse(element.elementData);

    switch (element.elementTypeId) {
      case 1: // Text Input
        return 'Sample text';
      case 2: // Text Area
        return 'This is a sample\nmulti-line text content';
      case 3: // Number
        return 42;
      case 4: // Select
        try {
          const options = typeof elementData.options === 'string' 
            ? JSON.parse(elementData.options) 
            : elementData.options;
          return options[0]?.value || '';
        } catch {
          return '';
        }
      case 5: // Date
        return '2025-11-18';
      case 6: // Checkbox
        return true;
      case 7: // File
        return 'sample-document.pdf';
      case 8: // URL
        return 'https://example.com';
      case 9: // Email
        return 'user@example.com';
      case 10: // Color
        return '#3498db';
      case 11: // Radio
        try {
          const options = typeof elementData.options === 'string' 
            ? JSON.parse(elementData.options) 
            : elementData.options;
          return options[0]?.value || '';
        } catch {
          return '';
        }
      case 12: // Rich Text
        return '<p>This is <strong>rich</strong> text with <em>formatting</em></p>';
      default:
        return 'Sample value';
    }
  } catch {
    return 'Sample value';
  }
};

export default ElementRendererDemo;
