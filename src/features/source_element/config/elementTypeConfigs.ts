/**
 * Element Type Configurations
 * This defines the dynamic form fields and validation for each element type
 */

export interface ElementTypeConfig {
  displayName: string;
  description: string;
  dataSchema: FieldDefinition[];
  previewTemplate?: string;
  icon?: string;
  category?: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'url' | 'email' | 'color' | 'json';
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
  helpText?: string;
  placeholder?: string;
  conditional?: {
    dependsOn: string;
    showWhen: any;
  };
}

/**
 * Default element type configurations
 * These can be extended or overridden based on backend element types
 */
export const DEFAULT_ELEMENT_TYPE_CONFIGS: Record<number, ElementTypeConfig> = {
  1: {
    displayName: 'Separator',
    description: 'A horizontal separator bar with optional text',
    dataSchema: [
      {
        key: 'Text',
        label: 'Separator Text',
        type: 'text',
        required: false,
        helpText: 'Optional text to display on the separator bar'
      }
    ]
  },

  2: {
    displayName: 'Signature Block',
    description: 'Signature capture block with optional left and right signature areas',
    dataSchema: [
      {
        key: 'HasLeftHandSigBlock',
        label: 'Has Left Signature Block',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Include a left-hand signature area'
      },
      {
        key: 'HasRightHandSigBlock',
        label: 'Has Right Signature Block',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Include a right-hand signature area'
      },
      {
        key: 'ShowDateCapture',
        label: 'Show Date Capture',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Include date fields with signatures'
      },
      {
        key: 'LeftHandSigText',
        label: 'Left Signature Text',
        type: 'text',
        required: false,
        helpText: 'Label text for the left signature block'
      },
      {
        key: 'RightHandSigText',
        label: 'Right Signature Text',
        type: 'text',
        required: false,
        helpText: 'Label text for the right signature block'
      }
    ]
  },

  3: {
    displayName: 'Number Input',
    description: 'Numeric input field with validation',
    dataSchema: [
      {
        key: 'min',
        label: 'Minimum Value',
        type: 'number',
        helpText: 'Minimum allowed value'
      },
      {
        key: 'max',
        label: 'Maximum Value',
        type: 'number',
        helpText: 'Maximum allowed value'
      },
      {
        key: 'step',
        label: 'Step Size',
        type: 'number',
        defaultValue: 1,
        helpText: 'Increment/decrement step size'
      },
      {
        key: 'precision',
        label: 'Decimal Places',
        type: 'number',
        defaultValue: 0,
        validation: { min: 0, max: 10 },
        helpText: 'Number of decimal places allowed'
      },
      {
        key: 'required',
        label: 'Required Field',
        type: 'checkbox',
        defaultValue: false
      },
      {
        key: 'unit',
        label: 'Unit Label',
        type: 'text',
        helpText: 'Unit to display after the number (e.g., "kg", "%")'
      }
    ]
  },

  4: {
    displayName: 'Select Dropdown',
    description: 'Dropdown selection from predefined options',
    dataSchema: [
      {
        key: 'options',
        label: 'Options (JSON Array)',
        type: 'textarea',
        required: true,
        placeholder: '[{"value": "option1", "label": "Option 1"}, {"value": "option2", "label": "Option 2"}]',
        helpText: 'JSON array of options with value and label properties'
      },
      {
        key: 'multiple',
        label: 'Allow Multiple Selection',
        type: 'checkbox',
        defaultValue: false
      },
      {
        key: 'required',
        label: 'Required Field',
        type: 'checkbox',
        defaultValue: false
      },
      {
        key: 'placeholder',
        label: 'Placeholder Text',
        type: 'text',
        helpText: 'Text shown when no option is selected'
      }
    ]
  },

  5: {
    displayName: 'Header',
    description: 'Header text element with customizable styling and level',
    dataSchema: [
      {
        key: 'Text',
        label: 'Header Text',
        type: 'text',
        required: false,
        helpText: 'The text content of the header'
      },
      {
        key: 'Level',
        label: 'Header Level',
        type: 'number',
        defaultValue: 1,
        validation: { min: 1, max: 6 },
        helpText: 'Header level (1-6, where 1 is largest)'
      },
      {
        key: 'IndentPastCheckbox',
        label: 'Indent Past Checkbox',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether to indent the header past checkbox alignment'
      },
      {
        key: 'CustomStyle',
        label: 'Custom Style',
        type: 'text',
        required: false,
        helpText: 'Custom inline CSS styles'
      },
      {
        key: 'CustomClass',
        label: 'Custom Class',
        type: 'text',
        required: false,
        helpText: 'Custom CSS class names'
      }
    ]
  },

  6: {
    displayName: 'Note Line',
    description: 'Note line element for capturing notes with optional indentation',
    dataSchema: [
      {
        key: 'Label',
        label: 'Label',
        type: 'text',
        required: false,
        defaultValue: 'Notes',
        helpText: 'Label text for the note line'
      },
      {
        key: 'LinesToShow',
        label: 'Lines to Show',
        type: 'number',
        required: false,
        defaultValue: 1,
        validation: { min: 1, max: 20 },
        helpText: 'Number of note lines to display'
      },
      {
        key: 'Indent_mm',
        label: 'Indent (mm)',
        type: 'number',
        required: false,
        defaultValue: 0,
        validation: { min: 0, max: 50 },
        helpText: 'Indentation in millimeters'
      },
      {
        key: 'BoldTitle',
        label: 'Bold Title',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether to display the label in bold'
      }
    ]
  },

  7: {
    displayName: 'Page Break',
    description: 'Creates a new page when rendered',
    dataSchema: []
  },

  8: {
    displayName: 'Single Line',
    description: 'Single line element with optional checkbox and data capture fields',
    dataSchema: [
      {
        key: 'HasCheckbox',
        label: 'Has Checkbox',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Include a checkbox with this line'
      },
      {
        key: 'CheckboxInsetMM',
        label: 'Checkbox Inset (mm)',
        type: 'number',
        defaultValue: 0,
        helpText: 'Checkbox indentation in millimeters'
      },
      {
        key: 'LineText',
        label: 'Line Text',
        type: 'text',
        required: false,
        helpText: 'The text content for this line'
      },
      {
        key: 'WorksheetName',
        label: 'Worksheet Name',
        type: 'text',
        required: false,
        helpText: 'Associated worksheet identifier'
      },
      {
        key: 'HasTimeCapture',
        label: 'Has Time Capture',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Include a time capture field'
      },
      {
        key: 'HasInitialsCapture',
        label: 'Has Initials Capture',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Include an initials capture field'
      },
      {
        key: 'HasAdditionalDataCapLine',
        label: 'Has Additional Data Capture Line',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Include an additional data capture line'
      },
      {
        key: 'AdditionalDataCapLinePreText',
        label: 'Additional Data Line Pre-Text',
        type: 'text',
        required: false,
        helpText: 'Text before the additional data capture line'
      },
      {
        key: 'AdditionalDataCapLinePostText',
        label: 'Additional Data Line Post-Text',
        type: 'text',
        required: false,
        helpText: 'Text after the additional data capture line'
      },
      {
        key: 'AdditionalDataCapLineLengthInMM',
        label: 'Additional Data Line Length (mm)',
        type: 'number',
        defaultValue: 0,
        helpText: 'Length of the additional data capture line in millimeters'
      },
      {
        key: 'IsOptional',
        label: 'Is Optional',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether this line is optional'
      }
    ]
  },

  9: {
    displayName: 'Multiple Choice',
    description: 'Multiple choice element with customizable options and layout',
    dataSchema: [
      {
        key: 'Label',
        label: 'Label',
        type: 'text',
        required: false,
        helpText: 'Label text for the multiple choice element'
      },
      {
        key: 'OptionsPerRow',
        label: 'Options Per Row',
        type: 'number',
        defaultValue: 1,
        validation: { min: 1, max: 10 },
        helpText: 'Number of options to display per row'
      },
      {
        key: 'BreakRowAfter',
        label: 'Break Row After',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether to break to a new row after this element'
      },
      {
        key: 'Options',
        label: 'Options (JSON Array)',
        type: 'textarea',
        required: true,
        placeholder: '[{"Label": "Option 1", "ShowInputLineAfter": false, "InputLineLengthInMM": 0}]',
        helpText: 'JSON array of options. Each option has Label (string), ShowInputLineAfter (boolean), and InputLineLengthInMM (integer). Maximum 100 options.'
      }
    ]
  },

  10: {
    displayName: 'Blank Line',
    description: 'Adds blank lines to the document',
    dataSchema: [
      {
        key: 'LinesToShow',
        label: 'Lines to Show',
        type: 'number',
        defaultValue: 1,
        validation: { min: 1, max: 20 },
        helpText: 'Number of blank lines to add'
      }
    ]
  },

  11: {
    displayName: 'Block Input',
    description: 'Small block to collect information (commonly used for vitals)',
    dataSchema: [
      {
        key: 'HeaderText',
        label: 'Header Text',
        type: 'text',
        required: false,
        helpText: 'Text to display in the block header'
      },
      {
        key: 'FooterText',
        label: 'Footer Text',
        type: 'text',
        required: false,
        helpText: 'Text to display in the block footer'
      },
      {
        key: 'InputLine1',
        label: 'Input Line 1',
        type: 'text',
        required: false,
        helpText: 'Label or text for the first input line'
      },
      {
        key: 'InputLine2',
        label: 'Input Line 2',
        type: 'text',
        required: false,
        helpText: 'Label or text for the second input line'
      },
      {
        key: 'FootNotes',
        label: 'Footnotes',
        type: 'textarea',
        required: false,
        helpText: 'Additional notes or footnotes for this block'
      },
      {
        key: 'Input2IsConversion',
        label: 'Input 2 Is Conversion',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether the second input is a conversion of the first'
      }
    ]
  },

  12: {
    displayName: 'Info Line',
    description: 'Information line element',
    dataSchema: [
      {
        key: 'Text',
        label: 'Text',
        type: 'text',
        required: false,
        helpText: 'Text content for the info line'
      }
    ]
  },

  13: {
    displayName: 'Inclusion/Exclusion',
    description: 'Inclusion or exclusion criteria item',
    dataSchema: [
      {
        key: 'Description',
        label: 'Description',
        type: 'text',
        required: false,
        helpText: 'Description of the inclusion/exclusion criteria'
      },
      {
        key: 'IsInclusion',
        label: 'Is Inclusion',
        type: 'checkbox',
        defaultValue: true,
        helpText: 'Whether this is an inclusion criterion (unchecked = exclusion)'
      },
      {
        key: 'IsSubItem',
        label: 'Is Sub-Item',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether this is a sub-item of a parent criterion'
      },
      {
        key: 'SupressInitials',
        label: 'Suppress Initials',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether to suppress the initials field'
      },
      {
        key: 'SupressDate',
        label: 'Suppress Date',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether to suppress the date field'
      },
      {
        key: 'ResetCounter',
        label: 'Reset Counter',
        type: 'checkbox',
        defaultValue: false,
        helpText: 'Whether to reset the numbering counter'
      }
    ]
  },

  14: {
    displayName: 'Block Input V2',
    description: 'Advanced block input with customizable sub-elements',
    dataSchema: [
      {
        key: 'HeaderText',
        label: 'Header Text',
        type: 'text',
        required: false,
        helpText: 'Text to display in the block header'
      },
      {
        key: 'FooterText',
        label: 'Footer Text',
        type: 'text',
        required: false,
        helpText: 'Text to display in the block footer'
      },
      {
        key: 'WidthMultiplier',
        label: 'Width Multiplier',
        type: 'number',
        defaultValue: 1,
        validation: { min: 1, max: 4 },
        helpText: 'Block width multiplier (1-4)'
      },
      {
        key: 'SubElements',
        label: 'Sub-Elements (JSON Array)',
        type: 'textarea',
        required: false,
        placeholder: '[{"Text": "Label", "bold": false, "subtle": false, "WidthMM": 50}]',
        helpText: 'JSON array of sub-elements. Each has Text (string), bold (boolean), subtle (boolean), and WidthMM (integer).'
      }
    ]
  }
};

/**
 * Utility function to get element type configuration
 */
export const getElementTypeConfig = (
  elementTypeId: number,
  customConfigs?: Record<number, ElementTypeConfig>
): ElementTypeConfig | null => {
  const configs = { ...DEFAULT_ELEMENT_TYPE_CONFIGS, ...customConfigs };
  return configs[elementTypeId] || null;
};

/**
 * Utility function to validate element data against its type configuration
 */
export const validateElementData = (
  elementData: string,
  elementTypeId: number,
  customConfigs?: Record<number, ElementTypeConfig>
): { isValid: boolean; errors: string[] } => {
  const config = getElementTypeConfig(elementTypeId, customConfigs);
  if (!config) {
    return { isValid: false, errors: ['Unknown element type'] };
  }

  let parsedData: any;
  try {
    parsedData = JSON.parse(elementData);
  } catch {
    return { isValid: false, errors: ['Invalid JSON data'] };
  }

  const errors: string[] = [];

  config.dataSchema.forEach(field => {
    const value = parsedData[field.key];

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} is required`);
    }

    // Validate field-specific rules
    if (value !== undefined && value !== null && value !== '' && field.validation) {
      const { min, max, pattern } = field.validation;

      if (field.type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`${field.label} must be a valid number`);
        } else {
          if (min !== undefined && numValue < min) {
            errors.push(`${field.label} must be at least ${min}`);
          }
          if (max !== undefined && numValue > max) {
            errors.push(`${field.label} must be at most ${max}`);
          }
        }
      }

      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          errors.push(`${field.label} format is invalid`);
        }
      }
    }
  });

  return { isValid: errors.length === 0, errors };
};

/**
 * Utility function to get default data for an element type
 */
export const getDefaultElementData = (
  elementTypeId: number,
  customConfigs?: Record<number, ElementTypeConfig>
): string => {
  const config = getElementTypeConfig(elementTypeId, customConfigs);
  if (!config) {
    return '{}';
  }

  const defaultData: any = {};
  config.dataSchema.forEach(field => {
    if (field.defaultValue !== undefined) {
      defaultData[field.key] = field.defaultValue;
    }
  });

  return JSON.stringify(defaultData, null, 2);
};
