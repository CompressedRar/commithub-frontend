# Field Mapper - Documentation

The Field Mapper is an Excel-like grid interface that allows you to arrange your form fields in a spatial layout.

## Features

✅ **Grid-Based Layout** - Arrange fields in rows and columns similar to Excel
✅ **Drag & Drop** - Drag fields from the sidebar into grid cells
✅ **Visual Organization** - Color-coded fields by type (Admin/User)
✅ **Configurable Grid** - Adjust grid size from 1-20 rows and 1-10 columns
✅ **Field Status Tracking** - See which fields are placed and which are available
✅ **Export Mapping** - Export the field arrangement for backend processing

## How to Use

### 1. **Add Fields First**
   - Use the Form Builder to create all your input and output fields
   - Input Fields (Admin, User) and Output Fields will be available in the mapper

### 2. **Open the Field Mapper**
   - Scroll down to "Field Mapper" section
   - Click "Open Mapper" button

### 3. **Configure Grid Size**
   - Click "Grid Settings" button
   - Set desired number of rows (1-20) and columns (1-10)
   - Click "Update"

### 4. **Arrange Fields**
   - Left sidebar shows available fields (not yet placed)
   - Drag a field from the sidebar onto a grid cell
   - You can place multiple fields throughout the grid

### 5. **Manage Placement**
   - Click the X icon on a field to remove it from a cell
   - Drag a field to a different cell to move it
   - "Clear Mapping" button removes all fields from the grid

### 6. **Export Layout**
   - Click "Export" to save the field arrangement
   - Mapping is logged to console and includes:
     - Field IDs and titles
     - Cell coordinates (row-column)
     - Grid configuration

## Component Structure

```
FieldMapper/
├── FieldMapper.jsx          - Main grid component
└── FieldMapperPanel.jsx     - Wrapper with toggle panel

hooks/
└── useFieldMapper.js        - State management hook
```

## Data Structure

The field mapper stores mappings as:
```javascript
{
  "rowIndex-colIndex": {
    id: 3,
    title: "User Score",
    type: "Integer",
    user: "User",
    ...
  }
}
```

When exported:
```javascript
{
  gridConfig: { rows: 5, columns: 3 },
  fieldMapping: [
    { cell: "0-0", fieldId: 1, fieldTitle: "Task Name" },
    { cell: "0-1", fieldId: 2, fieldTitle: "Priority" },
    ...
  ]
}
```

## Color Coding

- **Light Blue (#e3f2fd)** - Admin input fields
- **Light Purple (#f3e5f5)** - User input fields
- **Light Blue Grid (#f0f7ff)** - Cells with placed fields
- **Light Gray (#fafafa)** - Empty cells

## Tips

1. **Best Practices:**
   - Place related fields close together
   - Use consistent layouts for similar forms
   - Leave some cells empty for visual spacing

2. **Grid Planning:**
   - Consider your form's visual hierarchy
   - Group Admin and User fields by section
   - Output fields can be placed in their own section

3. **Mobile Responsiveness:**
   - Mapper shows the grid layout
   - Actual rendering depends on frontend screen size
   - Export and adjust if needed for mobile

## Future Enhancements

- [ ] Field merge cells (span fields across multiple cells)
- [ ] Field groups/sections
- [ ] Grid templates (preset layouts)
- [ ] Responsive grid breakpoints
- [ ] Import saved layouts
- [ ] Cell styling options
- [ ] Preview responsive layouts

---

The Field Mapper bridges the gap between field definition (Form Builder) and field placement (Task Creator), allowing designers to visually layout their forms before implementation.
