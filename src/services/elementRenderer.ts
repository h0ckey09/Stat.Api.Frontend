/**
 * Element Renderer Service
 * Converts source element JSON data into displayable HTML
 */

import { SourceElement } from '../types/sourceElement';
import { getElementTypeConfig } from '../features/source_element/config/elementTypeConfigs';

export interface RenderOptions {
  cssClasses?: {
    container?: string;
    label?: string;
    input?: string;
    error?: string;
    helpText?: string;
  };
  showLabels?: boolean;
  readOnly?: boolean;
  compact?: boolean;
}

/**
 * Main function to render a source element to HTML
 */
export const renderElementToHTML = (
  element: SourceElement,
  value: any = null,
  options: RenderOptions = {}
): string => {
  const defaultOptions: RenderOptions = {
    cssClasses: {
      container: 'element-container',
      label: 'element-label',
      input: 'element-input',
      error: 'element-error',
      helpText: 'element-help-text'
    },
    showLabels: true,
    readOnly: false,
    compact: false,
    ...options
  };

  try {
    const elementData = JSON.parse(element.elementData);
    const config = getElementTypeConfig(element.elementTypeId);

    if (!config) {
      return renderError(`Unknown element type: ${element.elementTypeId}`);
    }

    const renderer = getRendererForType(element.elementTypeId);
    const inputHTML = renderer(element, elementData, value, defaultOptions);

    // Wrap in container with label if needed
    if (defaultOptions.showLabels) {
      return wrapWithLabel(element.label, inputHTML, defaultOptions, element.editorNotes);
    }

    return inputHTML;
  } catch (error) {
    console.error('Error rendering element:', error);
    return renderError(`Failed to render element: ${element.label}`);
  }
};

/**
 * Render multiple elements as a form
 */
export const renderElementsAsForm = (
  elements: SourceElement[],
  values: Record<number, any> = {},
  options: RenderOptions = {}
): string => {
  const sortedElements = [...elements].sort((a, b) => a.order - b.order);
  
  const elementsHTML = sortedElements
    .filter(el => !el.isDisabled)
    .map(el => renderElementToHTML(el, values[el.id], options))
    .join('\n');

  return `<form class="source-elements-form">\n${elementsHTML}\n</form>`;
};

/**
 * Get the appropriate renderer function for an element type
 */
const getRendererForType = (elementTypeId: number): ElementRenderer => {
  const renderers: Record<number, ElementRenderer> = {
    1: renderUnsupported,    // Separator (server-side only)
    2: renderUnsupported,    // Signature Block (server-side only)
    3: renderNumberInput,    // Number Input
    4: renderSelect,         // Select Dropdown
    5: renderUnsupported,    // Header (server-side only)
    6: renderCheckbox,       // Checkbox
    7: renderUnsupported,    // Page Break (server-side only)
    8: renderUnsupported,    // Single Line (server-side only)
    9: renderUnsupported,    // Multiple Choice (server-side only)
    10: renderUnsupported,   // Blank Line (server-side only)
    11: renderUnsupported,   // Block Input (server-side only)
    12: renderUnsupported,   // Info Line (server-side only)
    13: renderUnsupported,   // Inclusion/Exclusion (server-side only)
    14: renderUnsupported    // Block Input V2 (server-side only)
  };

  return renderers[elementTypeId] || renderUnsupported;
};

type ElementRenderer = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
) => string;

/**
 * Renderer: Text Input
 */
const renderTextInput = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const attrs = [
    `type="text"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    value ? `value="${escapeHTML(value)}"` : '',
    elementData.placeholder ? `placeholder="${escapeHTML(elementData.placeholder)}"` : '',
    elementData.maxLength ? `maxlength="${elementData.maxLength}"` : '',
    elementData.pattern ? `pattern="${escapeHTML(elementData.pattern)}"` : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'readonly' : ''
  ].filter(Boolean).join(' ');

  return `<input ${attrs} />`;
};

/**
 * Renderer: Text Area
 */
const renderTextArea = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const attrs = [
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    `rows="${elementData.rows || 3}"`,
    elementData.placeholder ? `placeholder="${escapeHTML(elementData.placeholder)}"` : '',
    elementData.maxLength ? `maxlength="${elementData.maxLength}"` : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'readonly' : ''
  ].filter(Boolean).join(' ');

  const textContent = value ? escapeHTML(value) : '';
  return `<textarea ${attrs}>${textContent}</textarea>`;
};

/**
 * Renderer: Number Input
 */
const renderNumberInput = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const attrs = [
    `type="number"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    value !== null && value !== undefined ? `value="${value}"` : '',
    elementData.min !== undefined ? `min="${elementData.min}"` : '',
    elementData.max !== undefined ? `max="${elementData.max}"` : '',
    elementData.step ? `step="${elementData.step}"` : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'readonly' : ''
  ].filter(Boolean).join(' ');

  let html = `<input ${attrs} />`;
  
  if (elementData.unit) {
    html += ` <span class="number-unit">${escapeHTML(elementData.unit)}</span>`;
  }

  return html;
};

/**
 * Renderer: Select Dropdown
 */
const renderSelect = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  let selectOptions: Array<{ value: string; label: string }> = [];
  
  try {
    if (typeof elementData.options === 'string') {
      selectOptions = JSON.parse(elementData.options);
    } else if (Array.isArray(elementData.options)) {
      selectOptions = elementData.options;
    }
  } catch (e) {
    console.error('Failed to parse select options:', e);
  }

  const attrs = [
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    elementData.multiple ? 'multiple' : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  const placeholderOption = elementData.placeholder
    ? `<option value="" disabled ${!value ? 'selected' : ''}>${escapeHTML(elementData.placeholder)}</option>`
    : '';

  const optionsHTML = selectOptions.map(opt => {
    const isSelected = value === opt.value || (Array.isArray(value) && value.includes(opt.value));
    return `<option value="${escapeHTML(opt.value)}" ${isSelected ? 'selected' : ''}>${escapeHTML(opt.label)}</option>`;
  }).join('\n');

  return `<select ${attrs}>\n${placeholderOption}\n${optionsHTML}\n</select>`;
};

/**
 * Renderer: Date Picker
 */
const renderDatePicker = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const inputType = elementData.includeTime ? 'datetime-local' : 'date';
  
  const attrs = [
    `type="${inputType}"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    value ? `value="${value}"` : '',
    elementData.minDate ? `min="${elementData.minDate}"` : '',
    elementData.maxDate ? `max="${elementData.maxDate}"` : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'readonly' : ''
  ].filter(Boolean).join(' ');

  return `<input ${attrs} />`;
};

/**
 * Renderer: Checkbox
 */
const renderCheckbox = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const isChecked = value === true || value === 'true' || value === 1 || 
                    (elementData.defaultChecked && value === undefined);

  const attrs = [
    `type="checkbox"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    isChecked ? 'checked' : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  const label = elementData.label || element.label;
  
  return `
    <div class="checkbox-wrapper">
      <input ${attrs} />
      <label for="element-${element.id}">${escapeHTML(label)}</label>
    </div>
  `;
};

/**
 * Renderer: File Upload
 */
const renderFileUpload = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const attrs = [
    `type="file"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    elementData.accept ? `accept="${escapeHTML(elementData.accept)}"` : '',
    elementData.multiple ? 'multiple' : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  let html = `<input ${attrs} />`;
  
  if (elementData.maxSize) {
    html += `<small class="file-size-hint">Max size: ${elementData.maxSize}MB</small>`;
  }

  if (value) {
    html += `<div class="current-file">Current: ${escapeHTML(value)}</div>`;
  }

  return html;
};

/**
 * Renderer: URL Input
 */
const renderURLInput = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const attrs = [
    `type="url"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    value ? `value="${escapeHTML(value)}"` : '',
    elementData.placeholder ? `placeholder="${escapeHTML(elementData.placeholder)}"` : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'readonly' : ''
  ].filter(Boolean).join(' ');

  let html = `<input ${attrs} />`;

  if (value && !options.readOnly) {
    const target = elementData.openInNewTab ? '_blank' : '_self';
    html += ` <a href="${escapeHTML(value)}" target="${target}" class="url-preview">Preview</a>`;
  }

  return html;
};

/**
 * Renderer: Email Input
 */
const renderEmailInput = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const attrs = [
    `type="email"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    value ? `value="${escapeHTML(value)}"` : '',
    elementData.placeholder ? `placeholder="${escapeHTML(elementData.placeholder)}"` : '',
    elementData.allowMultiple ? 'multiple' : '',
    elementData.required ? 'required' : '',
    options.readOnly ? 'readonly' : ''
  ].filter(Boolean).join(' ');

  return `<input ${attrs} />`;
};

/**
 * Renderer: Color Picker
 */
const renderColorPicker = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  const colorValue = value || elementData.defaultColor || '#000000';
  
  const attrs = [
    `type="color"`,
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'}"`,
    `value="${colorValue}"`,
    elementData.required ? 'required' : '',
    options.readOnly ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  let html = `<input ${attrs} />`;

  if (elementData.showPreview) {
    html += ` <span class="color-preview" style="background-color: ${colorValue}; display: inline-block; width: 30px; height: 30px; border: 1px solid #ccc; vertical-align: middle;"></span>`;
  }

  return html;
};

/**
 * Renderer: Radio Button Group
 */
const renderRadioGroup = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  let radioOptions: Array<{ value: string; label: string }> = [];
  
  try {
    if (typeof elementData.options === 'string') {
      radioOptions = JSON.parse(elementData.options);
    } else if (Array.isArray(elementData.options)) {
      radioOptions = elementData.options;
    }
  } catch (e) {
    console.error('Failed to parse radio options:', e);
  }

  const layout = elementData.layout || 'vertical';
  const containerClass = `radio-group radio-group-${layout}`;

  const radiosHTML = radioOptions.map((opt, index) => {
    const isChecked = value === opt.value;
    const radioId = `element-${element.id}-${index}`;
    
    const attrs = [
      `type="radio"`,
      `id="${radioId}"`,
      `name="element-${element.id}"`,
      `value="${escapeHTML(opt.value)}"`,
      isChecked ? 'checked' : '',
      elementData.required ? 'required' : '',
      options.readOnly ? 'disabled' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="radio-option">
        <input ${attrs} />
        <label for="${radioId}">${escapeHTML(opt.label)}</label>
      </div>
    `;
  }).join('\n');

  return `<div class="${containerClass}">\n${radiosHTML}\n</div>`;
};

/**
 * Renderer: Rich Text Editor
 */
const renderRichTextEditor = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  if (options.readOnly && value) {
    return `<div class="rich-text-display" id="element-${element.id}">${value}</div>`;
  }

  const attrs = [
    `id="element-${element.id}"`,
    `name="${element.label}"`,
    `class="${options.cssClasses?.input || 'element-input'} rich-text-editor"`,
    `contenteditable="${!options.readOnly}"`,
    `style="min-height: ${elementData.minHeight || 200}px;"`,
    elementData.required ? 'data-required="true"' : ''
  ].filter(Boolean).join(' ');

  const content = value || '';
  
  return `
    <div ${attrs}>${content}</div>
    <input type="hidden" name="${element.label}" value="${escapeHTML(content)}" />
  `;
};

/**
 * Renderer: Unsupported element type
 */
const renderUnsupported = (
  element: SourceElement,
  elementData: any,
  value: any,
  options: RenderOptions
): string => {
  return `<div class="element-unsupported">
    <em>Element type ${element.elementTypeId} (${element.elementTypeLabel}) is not yet supported for rendering</em>
  </div>`;
};

/**
 * Wrap input with label and container
 */
const wrapWithLabel = (
  label: string,
  inputHTML: string,
  options: RenderOptions,
  helpText?: string
): string => {
  const labelClass = options.cssClasses?.label || 'element-label';
  const containerClass = options.cssClasses?.container || 'element-container';
  const helpTextClass = options.cssClasses?.helpText || 'element-help-text';

  let html = `<div class="${containerClass}">`;
  html += `\n  <label class="${labelClass}">${escapeHTML(label)}</label>`;
  html += `\n  ${inputHTML}`;
  
  if (helpText && !options.compact) {
    html += `\n  <small class="${helpTextClass}">${escapeHTML(helpText)}</small>`;
  }
  
  html += `\n</div>`;
  
  return html;
};

/**
 * Render an error message
 */
const renderError = (message: string): string => {
  return `<div class="element-error" style="color: red; padding: 10px; border: 1px solid red; background-color: #ffeeee;">
    <strong>Error:</strong> ${escapeHTML(message)}
  </div>`;
};

/**
 * Escape HTML to prevent XSS
 */
const escapeHTML = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return '';
  
  const text = String(str);
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Render element data as a preview (read-only formatted display)
 */
export const renderElementPreview = (
  element: SourceElement,
  value: any = null
): string => {
  return renderElementToHTML(element, value, {
    showLabels: true,
    readOnly: true,
    compact: false
  });
};

/**
 * Render element data as a compact display (e.g., for tables)
 */
export const renderElementCompact = (
  element: SourceElement,
  value: any = null
): string => {
  return renderElementToHTML(element, value, {
    showLabels: false,
    readOnly: true,
    compact: true
  });
};

/**
 * Extract plain text value from element data for display
 */
export const getElementDisplayValue = (element: SourceElement, value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (element.elementTypeId) {
    case 6: // Checkbox
      return value ? 'Yes' : 'No';
    case 10: // Color
      return `<span style="color: ${value};">●</span> ${value}`;
    case 5: // Date
      return new Date(value).toLocaleDateString();
    default:
      return String(value);
  }
};
