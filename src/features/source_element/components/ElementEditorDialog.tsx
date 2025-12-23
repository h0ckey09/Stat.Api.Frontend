import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { SourceElement, UpdateSourceElementData } from '../../../types/sourceElement';
import { 
  getElementTypeConfig, 
  getDefaultElementData, 
  validateElementData,
  DEFAULT_ELEMENT_TYPE_CONFIGS
} from '../config/elementTypeConfigs';

interface ElementEditorDialogProps {
  open: boolean;
  element: SourceElement | null;
  isCreating?: boolean;
  activeElementCount?: number;
  onSave: (data: UpdateSourceElementData) => Promise<number | null>;
  onCancel: () => void;
  loading?: boolean;
}

const TabPanel = ({ children, value, index, ...other }: any) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`element-editor-tabpanel-${index}`}
    aria-labelledby={`element-editor-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const ElementEditorDialog: React.FC<ElementEditorDialogProps> = ({
  open,
  element,
  isCreating = false,
  activeElementCount = 0,
  onSave,
  onCancel,
  loading = false
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [elementTypeId, setElementTypeId] = useState<number>(1);
  const [label, setLabel] = useState('');
  const [editorNotes, setEditorNotes] = useState('');
  const [order, setOrder] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [rawJsonData, setRawJsonData] = useState('{}');
  const [jsonError, setJsonError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [optionFormData, setOptionFormData] = useState<any>({});

  const currentElementType = useMemo(() => {
    return getElementTypeConfig(elementTypeId);
  }, [elementTypeId]);

  // Initialize form data when element changes or dialog opens
  useEffect(() => {
    if (element) {
      setElementTypeId(element.elementTypeId);
      setLabel(element.label);
      setEditorNotes(element.editorNotes || '');
      setOrder(element.order);
      setIsDisabled(element.isDisabled);
      
      // Parse JSON data
      try {
        const jsonData = element.elementData ? JSON.parse(element.elementData) : {};
        setFormData(jsonData);
        setRawJsonData(JSON.stringify(jsonData, null, 2));
        setJsonError('');
      } catch (error) {
        setRawJsonData(element.elementData || '{}');
        setJsonError('Invalid JSON data');
        setFormData({});
      }
    } else {
      // Reset for new element
      setElementTypeId(1);
      setLabel('');
      setEditorNotes('');
      // Calculate default order: (activeElementCount + 1) * 10
      setOrder((activeElementCount + 1) * 10);
      setIsDisabled(false);
      
      // Set default data for the element type
      const defaultData = getDefaultElementData(1);
      try {
        const parsedDefault = JSON.parse(defaultData);
        setFormData(parsedDefault);
        setRawJsonData(defaultData);
      } catch {
        setFormData({});
        setRawJsonData('{}');
      }
    }
    setValidationErrors({});
    setSaveError('');
    // When creating a new element, start on "Other Data" tab (index 1)
    // When editing, start on "Element Data" tab (index 0)
    setTabValue(isCreating ? 1 : 0);
  }, [element, open, isCreating]);

  // Update form data when element type changes
  useEffect(() => {
    if (elementTypeId && !element) {
      const defaultData = getDefaultElementData(elementTypeId);
      try {
        const parsedDefault = JSON.parse(defaultData);
        setFormData(parsedDefault);
        setRawJsonData(defaultData);
        setJsonError('');
      } catch {
        setFormData({});
        setRawJsonData('{}');
      }
    }
  }, [elementTypeId, element]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFormFieldChange = (fieldKey: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldKey]: value
    }));
    
    // Update raw JSON
    const newData = { ...formData, [fieldKey]: value };
    setRawJsonData(JSON.stringify(newData, null, 2));
    
    // Clear validation error for this field
    if (validationErrors[fieldKey]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldKey];
        return updated;
      });
    }
  };

  const handleRawJsonChange = (newJson: string) => {
    setRawJsonData(newJson);
    try {
      const parsedData = JSON.parse(newJson);
      setFormData(parsedData);
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON syntax');
    }
  };

  const handleElementTypeChange = (newTypeId: number) => {
    setElementTypeId(newTypeId);
    
    // Reset form data to defaults for new type
    const defaultData = getDefaultElementData(newTypeId);
    try {
      const parsedDefault = JSON.parse(defaultData);
      setFormData(parsedDefault);
      setRawJsonData(defaultData);
      setJsonError('');
    } catch {
      setFormData({});
      setRawJsonData('{}');
    }
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Basic validation
    if (!label.trim()) {
      errors.label = 'Label is required';
    }
    
    if (!currentElementType) {
      errors.general = 'Please select a valid element type';
      setValidationErrors(errors);
      return false;
    }

    // Validate element data using configuration
    const validation = validateElementData(rawJsonData, elementTypeId);
    if (!validation.isValid) {
      validation.errors.forEach((error, index) => {
        errors[`data_${index}`] = error;
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    console.log('handleSave called');
    setSaveError('');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed');
    setSaving(true);
    try {
      // Parse the JSON data to inject ElementType and Version
      let elementDataObj;
      try {
        elementDataObj = JSON.parse(rawJsonData);
      } catch (e) {
        console.error('JSON parse error:', e);
        setSaveError('Invalid JSON data');
        setSaving(false);
        return;
      }

      // Add ElementType and Version to the JSON object
      elementDataObj.ElementType = elementTypeId;
      // Element 14 is Version 3, all others are Version 1
      elementDataObj.Version = elementTypeId === 14 ? 3 : 1;

      // Convert back to JSON string
      const updatedJsonData = JSON.stringify(elementDataObj);

      const elementData: UpdateSourceElementData = {
        label: label.trim(),
        elementTypeId,
        elementData: updatedJsonData,
        editorNotes: editorNotes.trim(),
        order,
        isDisabled
      };

      console.log('Calling onSave with:', elementData);
      const savedElementId = await onSave(elementData);
      console.log('onSave returned:', savedElementId);
      if (savedElementId) {
        onCancel(); // Close dialog on successful save
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setSaveError(error.message || 'Failed to save element');
    } finally {
      setSaving(false);
    }
  };

  // Handle adding a new option to an array field
  const handleAddOption = (fieldKey: string) => {
    setEditingOptionIndex(-1); // -1 means new option
    
    // Initialize option form based on field key
    if (fieldKey === 'Options') {
      setOptionFormData({
        Label: '',
        ShowInputLineAfter: false,
        InputLineLengthInMM: 0
      });
    } else {
      setOptionFormData({});
    }
  };

  // Handle editing an existing option
  const handleEditOption = (fieldKey: string, index: number) => {
    const options = formData[fieldKey] || [];
    setEditingOptionIndex(index);
    setOptionFormData({ ...options[index] });
  };

  // Handle saving an option (new or edited)
  const handleSaveOption = (fieldKey: string) => {
    const options = [...(formData[fieldKey] || [])];
    
    if (editingOptionIndex === -1) {
      // Add new option
      options.push({ ...optionFormData });
    } else if (editingOptionIndex !== null) {
      // Update existing option
      options[editingOptionIndex] = { ...optionFormData };
    }
    
    handleFormFieldChange(fieldKey, options);
    setEditingOptionIndex(null);
    setOptionFormData({});
  };

  // Handle deleting an option
  const handleDeleteOption = (fieldKey: string, index: number) => {
    const options = [...(formData[fieldKey] || [])];
    options.splice(index, 1);
    handleFormFieldChange(fieldKey, options);
  };

  // Handle canceling option edit
  const handleCancelOptionEdit = () => {
    setEditingOptionIndex(null);
    setOptionFormData({});
  };

  const renderFormField = (field: any) => {
    const value = formData[field.key] ?? field.defaultValue ?? '';
    const hasError = !!validationErrors[field.key];

    switch (field.type) {
      case 'text':
      case 'url':
      case 'email':
        return (
          <TextField
            key={field.key}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleFormFieldChange(field.key, e.target.value)}
            error={hasError}
            helperText={validationErrors[field.key] || field.helpText}
            placeholder={field.placeholder}
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            required={field.required}
            margin="normal"
          />
        );

      case 'number':
        return (
          <TextField
            key={field.key}
            fullWidth
            label={field.label}
            type="number"
            value={value}
            onChange={(e) => handleFormFieldChange(field.key, Number(e.target.value))}
            error={hasError}
            helperText={validationErrors[field.key] || field.helpText}
            placeholder={field.placeholder}
            required={field.required}
            margin="normal"
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max,
            }}
          />
        );

      case 'textarea':
        // Check if this is an options array field
        if (field.key === 'Options' && Array.isArray(value)) {
          return (
            <Box key={field.key} sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {field.label}
              </Typography>
              <List sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                {value.length === 0 ? (
                  <ListItem>
                    <ListItemText secondary="No options added yet" />
                  </ListItem>
                ) : (
                  value.map((option: any, index: number) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleDeleteOption(field.key, index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemButton onClick={() => handleEditOption(field.key, index)}>
                        <ListItemText 
                          primary={option.Label || `Option ${index + 1}`}
                          secondary={option.ShowInputLineAfter ? `Input line: ${option.InputLineLengthInMM}mm` : undefined}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                )}
              </List>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => handleAddOption(field.key)}
                size="small"
              >
                Add Option
              </Button>
              
              {/* Option editor form */}
              {editingOptionIndex !== null && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {editingOptionIndex === -1 ? 'Add New Option' : 'Edit Option'}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Label"
                    value={optionFormData.Label || ''}
                    onChange={(e) => setOptionFormData({ ...optionFormData, Label: e.target.value })}
                    margin="normal"
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(optionFormData.ShowInputLineAfter)}
                        onChange={(e) => setOptionFormData({ ...optionFormData, ShowInputLineAfter: e.target.checked })}
                      />
                    }
                    label="Show Input Line After"
                  />
                  {optionFormData.ShowInputLineAfter && (
                    <TextField
                      fullWidth
                      label="Input Line Length (mm)"
                      type="number"
                      value={optionFormData.InputLineLengthInMM || 0}
                      onChange={(e) => setOptionFormData({ ...optionFormData, InputLineLengthInMM: Number(e.target.value) })}
                      margin="normal"
                      size="small"
                    />
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={() => handleSaveOption(field.key)}
                      size="small"
                      disabled={!optionFormData.Label}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleCancelOptionEdit}
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          );
        }
        
        // Regular textarea
        return (
          <TextField
            key={field.key}
            fullWidth
            multiline
            rows={4}
            label={field.label}
            value={value}
            onChange={(e) => handleFormFieldChange(field.key, e.target.value)}
            error={hasError}
            helperText={validationErrors[field.key] || field.helpText}
            placeholder={field.placeholder}
            required={field.required}
            margin="normal"
          />
        );

      case 'select':
        return (
          <FormControl key={field.key} fullWidth error={hasError} required={field.required} margin="normal">
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleFormFieldChange(field.key, e.target.value)}
            >
              {field.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(validationErrors[field.key] || field.helpText) && (
              <Typography variant="caption" color={hasError ? 'error' : 'text.secondary'}>
                {validationErrors[field.key] || field.helpText}
              </Typography>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.key}
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => handleFormFieldChange(field.key, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'color':
        return (
          <Box key={field.key} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <TextField
              fullWidth
              label={field.label}
              value={value}
              onChange={(e) => handleFormFieldChange(field.key, e.target.value)}
              error={hasError}
              helperText={validationErrors[field.key] || field.helpText}
              required={field.required}
            />
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleFormFieldChange(field.key, e.target.value)}
              style={{ width: 50, height: 40, border: 'none', borderRadius: 4 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  // Available element types from configuration
  const availableElementTypes = Object.entries(DEFAULT_ELEMENT_TYPE_CONFIGS).map(([id, config]) => ({
    id: Number(id),
    label: config.displayName,
    description: config.description
  }));

  return (
    <Dialog 
      open={open} 
      onClose={saving ? undefined : onCancel}
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      {/* Loading overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        open={saving}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isCreating ? 'Creating element...' : 'Saving changes...'}
          </Typography>
        </Box>
      </Backdrop>
      
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isCreating ? 'Create New Element' : 'Edit Element'}
          </Typography>
          <IconButton onClick={onCancel} size="small" disabled={saving}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        {Object.keys(validationErrors).map(key => 
          key.startsWith('data_') && (
            <Alert key={key} severity="error" sx={{ mb: 1 }}>
              {validationErrors[key]}
            </Alert>
          )
        )}

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Element Data" />
          <Tab label="Other Data" />
          <Tab label="Raw JSON" />
        </Tabs>

        {/* Element Data Tab */}
        <TabPanel value={tabValue} index={0}>
          {currentElementType ? (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {currentElementType.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentElementType.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {currentElementType.dataSchema.map(field => renderFormField(field))}
              </Box>
            </Box>
          ) : (
            <Alert severity="warning">
              Please select an element type to configure its data
            </Alert>
          )}
        </TabPanel>

        {/* Other Data Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              error={!!validationErrors.label}
              helperText={validationErrors.label}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Element Type</InputLabel>
              <Select
                value={elementTypeId}
                label="Element Type"
                onChange={(e) => handleElementTypeChange(Number(e.target.value))}
              >
                {availableElementTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              helperText="Display order within the page"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Editor Notes"
              value={editorNotes}
              onChange={(e) => setEditorNotes(e.target.value)}
              helperText="Internal notes for editors (not visible to end users)"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDisabled}
                    onChange={(e) => setIsDisabled(e.target.checked)}
                  />
                }
                label="Disabled"
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Raw JSON Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">JSON Data</Typography>
            <Tooltip title="Reset to default values">
              <IconButton 
                onClick={() => {
                  const defaultData = getDefaultElementData(elementTypeId);
                  setRawJsonData(defaultData);
                  try {
                    setFormData(JSON.parse(defaultData));
                    setJsonError('');
                  } catch {
                    setFormData({});
                  }
                }}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={15}
            label="Element Data (JSON)"
            value={rawJsonData}
            onChange={(e) => handleRawJsonChange(e.target.value)}
            error={!!jsonError}
            helperText={jsonError || 'Edit the JSON data directly'}
            sx={{ 
              '& .MuiInputBase-input': { 
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }
            }}
          />
        </TabPanel>

      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={saving || !!jsonError}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : (isCreating ? 'Create Element' : 'Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
