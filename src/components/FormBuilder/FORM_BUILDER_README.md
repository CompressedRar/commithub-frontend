# Form Builder - Documentation

A fully functional, dynamic form template builder for creating customizable forms with multiple field types.

## Features

✅ **Dynamic Field Management** - Add, edit, and delete form fields on the fly
✅ **Multiple Field Types** - String, Integer, Number, Email, Date, Boolean, TextArea, Dropdown
✅ **User Role Separation** - Separate fields for Admin and User inputs
✅ **Field Validation** - Mark fields as required
✅ **Live Preview** - Preview how the form will look before saving
✅ **Full State Management** - Custom hook for managing form builder state
✅ **Responsive UI** - Material-UI components for professional appearance

## Components

### 1. **Builder.jsx** (Main Component)
Located in: `src/components/FormBuilder/TaskBuilder/Builder.jsx`

The main orchestrator component that:
- Manages overall form template structure
- Displays all configured fields
- Provides add/edit/delete functionality
- Includes template save and clear features
- Shows success alerts on save
- Confirmation dialogs for destructive actions

**Key Features:**
- "Add Admin Field" - Creates a new field for admin users
- "Add User Field" - Creates a new field for regular users
- "Preview Form" - Shows live preview of the configured form
- "Save Task Template" - Saves the template (API integration needed)
- "Clear All" - Removes all fields with confirmation

### 2. **Editor.jsx** (Field Property Editor)
Located in: `src/components/FormBuilder/PropertyEditor/Editor.jsx`

A drawer component for editing individual field properties:
- **Field Title** (required) - The label shown to users
- **Placeholder Text** - Helper text inside the input
- **User Type** - Select between Admin or User input
- **Field Type** - Choose from 8+ field types
- **Required** - Toggle to make field mandatory

**Supported Field Types:**
- String - Plain text input
- TextArea - Multi-line text input
- Integer - Whole number input
- Number - Decimal number input
- Email - Email validation
- Date - Date picker
- Boolean - Checkbox
- Dropdown - Select with options

### 3. **Record.jsx** (Field Row Component)
Located in: `src/components/FormBuilder/Record/Record.jsx`

Displays each field in a clean table row format showing:
- Field title
- Field type (Chip badge)
- User type (Admin/User with color coding)
- Required status (Yes/No)
- Action buttons (Edit, Delete)

### 4. **FormRenderer.jsx** (Field Renderer)
Located in: `src/components/FormBuilder/FormRenderer.jsx`

Dynamically renders form fields based on configuration:
- Handles all field types
- Two-way data binding via `onChange` callback
- Read-only mode support
- Proper validation and placeholders
- Responsive layout using MUI Stack

### 5. **FormPreview.jsx** (Live Preview)
Located: `src/components/FormBuilder/FormPreview.jsx`

Dialog component that:
- Shows live preview of the configured form
- Allows testing field interactions
- Displays submitted form values
- Helps validate form design before saving

## Custom Hook

### **useFormBuilder.js**
Located in: `src/hooks/useFormBuilder.js`

A custom React hook for managing form builder state:

```javascript
const {
  fields,              // Array of field objects
  selectedField,       // Currently selected field
  setSelectedField,    // Set selected field
  addField,           // Add new field (Admin or User)
  updateField,        // Update existing field by id
  deleteField,        // Delete field by id
  clearFields,        // Clear all fields
  getFieldsByUser,    // Get fields filtered by user type
} = useFormBuilder();
```

**Field Object Structure:**
```javascript
{
  id: number,         // Unique timestamp-based ID
  title: string,      // Field label
  placeholder: string,// Helper text
  type: string,       // Field type (String, Integer, etc.)
  user: string,       // "Admin" or "User"
  required: boolean   // Is field mandatory?
}
```

## Usage Example

### Basic Setup
```jsx
import Builder from './components/FormBuilder/TaskBuilder/Builder';

function App() {
  return <Builder />;
}
```

### Using FormRenderer Independently
```jsx
import FormRenderer from './components/FormBuilder/FormRenderer';
import { useState } from 'react';

function MyForm({ fields }) {
  const [values, setValues] = useState({});

  const handleChange = (fieldId, value) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <FormRenderer
      fields={fields}
      values={values}
      onChange={handleChange}
    />
  );
}
```

## Workflow

1. **Add Fields** - Click "Add Admin Field" or "Add User Field"
2. **Configure** - Set title, type, and other properties in the Editor
3. **Preview** - Click "Preview Form" to see the live form
4. **Test** - Interact with fields in the preview to verify behavior
5. **Save** - Click "Save Task Template" to persist (add API integration)

## Next Steps (Integration)

To fully integrate this form builder:

1. **API Integration** - Update `handleSaveTemplate()` to call your backend:
   ```javascript
   const handleSaveTemplate = async () => {
     try {
       const response = await fetch('/api/form-templates', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ fields })
       });
       // Handle response
     } catch (error) {
       console.error('Save failed:', error);
     }
   };
   ```

2. **Load Templates** - Add functionality to load existing templates:
   ```javascript
   const loadTemplate = async (templateId) => {
     const response = await fetch(`/api/form-templates/${templateId}`);
     const { fields } = await response.json();
     setFields(fields);
   };
   ```

3. **Dropdown Options** - Add support for dynamic option configuration:
   ```javascript
   // In Editor.jsx, add an options field when type === 'Dropdown'
   ```

4. **Field Ordering** - Add drag-and-drop to reorder fields

5. **Field Groups** - Group related fields together

6. **Validation Rules** - Add regex patterns and custom validators

## Styling

All components use Material-UI (MUI) for consistent styling:
- Customizable via MUI theme
- Responsive design with flexbox/grid
- Accessibility features built-in
- Icon support via @mui/icons-material

## Dependencies

- `react` - ~18.0+
- `@mui/material` - Material Design components
- `@mui/icons-material` - Icon library

## File Structure

```
FormBuilder/
├── TaskBuilder/
│   └── Builder.jsx (Main component)
├── PropertyEditor/
│   └── Editor.jsx (Field editor)
├── Record/
│   └── Record.jsx (Field row)
├── Fields/
│   ├── StringField.jsx
│   ├── IntegerField.jsx
│   └── NumberField.jsx
├── FormRenderer.jsx (Field renderer)
├── FormPreview.jsx (Live preview)
└── hooks/
    └── useFormBuilder.js (State hook)
```

## Features Not Yet Implemented

- [ ] Drag-and-drop field reordering
- [ ] Field groups/sections
- [ ] Custom validation rules
- [ ] Conditional field visibility
- [ ] Multi-language support
- [ ] Field templates library
- [ ] Import/export functionality

---

Created with React, MUI, and custom state management.
