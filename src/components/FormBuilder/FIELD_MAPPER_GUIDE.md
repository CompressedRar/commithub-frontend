# Field Mapper: Excel Blueprint Guide

## Overview

The Form Template Builder with Field Mapper helps you create a **blueprint** for how task data is laid out in Excel exports. Every task you create from this template will follow the same Excel structure.

---

## How It Works

### Step 1: Load Sample Data
Click the **"📋 Load Sample Task"** button to populate the form builder with example fields.

This loads:
- **5 Admin Fields** (task configuration)
- **4 User Fields** (faculty input)
- **3 Output Fields** (calculated values)

### Step 2: Review Input Fields
The sample includes two types of input fields:

#### Admin Fields (String Type)
These are configured by department heads and provide task context:
- **Task Name** - What is the task?
- **Department** - Which department?
- **Task Category** - Type of work
- **Due Date** - When is it due?
- **Expected Duration** - How long should it take?

#### User Fields (Integer Type)
These are filled by faculty/employees doing the task:
- **Hours Spent** - How many hours worked?
- **Progress %** - Completion percentage (0-100)
- **Deliverables Count** - How many deliverables done?
- **Issues Encountered** - How many issues/blockers?

### Step 3: Review Output Fields
The system calculates these based on user input:

| Output Field | Input Field | Type | Purpose |
|---|---|---|---|
| **Task Status** | Progress % | Case Output | Converts % to status label<br/>0-25% → "Not Started"<br/>26-50% → "In Progress"<br/>51-75% → "Nearly Complete"<br/>76-100% → "Completed" |
| **Effort Adjusted Hours** | Hours Spent | Integer Modifier | Calculates adjusted effort<br/>Formula: `value * 1.2` |
| **Risk Level** | Issues | Case Output | Assesses project risk<br/>0 issues → "Low Risk"<br/>1-2 issues → "Medium Risk"<br/>3+ issues → "High Risk" |

### Step 4: Map Fields in Grid
Open the **Field Mapper** section and arrange fields in a grid:

**Example Layout (5 rows × 3 columns):**
```
┌─────────────────┬──────────────┬──────────────┐
│  Task Name      │ Department   │ Task Category│
│  Due Date       │ Expected Dur.│ Hours Spent  │
│  Progress %     │ Deliverables │ Issues       │
│  Task Status    │ Risk Level   │ Adj. Hours   │
│  (empty)        │ (empty)      │ (empty)      │
└─────────────────┴──────────────┴──────────────┘
```

**Field Mapping Purpose:**
- This layout becomes the **blueprint** for Excel export
- Each task created with this template uses the same arrangement
- Colors indicate field types:
  - **Light Blue** = Admin fields
  - **Light Purple** = User fields
  - **Light Blue Grid** = Output/calculated fields

---

## Excel Export Blueprint

When you export tasks to Excel, the field mapping controls the layout:

### Without Field Mapper (Linear Layout)
```
Task Name | Department | Task Category | ... | Hours Spent | Progress % | Task Status | ...
```
(All fields in a single row - hard to read for many fields)

### With Field Mapper (Grid Layout)
```
Row 1:  Task Name          Department        Task Category
Row 2:  Due Date           Expected Duration Hours Spent
Row 3:  Progress %         Deliverables      Issues
Row 4:  Task Status        Risk Level        Adjusted Hours
```
Much more organized and readable!

---

## Sample Data Structure

### Admin Fields (Task Configuration)
```javascript
{
  id: 1,
  title: "Task Name",
  type: "String",          // Only string type for Admin
  user: "Admin",
  required: true,
  placeholder: "Enter task title",
}
```

### User Fields (Faculty Input)
```javascript
{
  id: 6,
  title: "Hours Spent",
  type: "Integer",         // Only integer type for User
  user: "User",
  required: true,
  description: "Number of hours spent on this task",
  name: "hourSpent",       // Used to bind output fields
}
```

### Output Fields (Calculated Values)
```javascript
// Case Output Example
{
  id: 101,
  title: "Task Status",
  type: "CaseOutput",
  inputFieldName: "progressPercent",    // Binds to User field
  cases: [
    { condition: "0-25", output: "Not Started" },
    { condition: "26-50", output: "In Progress" },
    { condition: "51-75", output: "Nearly Complete" },
    { condition: "76-100", output: "Completed" }
  ]
}

// Integer Modifier Example
{
  id: 102,
  title: "Effort Adjusted Hours",
  type: "IntegerModifier",
  inputFieldName: "hourSpent",
  formula: "value * 1.2"
}
```

---

## Workflow Summary

```
1. Create Template
   ├─ Define Input Fields (Admin & User)
   ├─ Create Output Fields (Formulas & Cases)
   └─ Map Fields in Grid (BLUEPRINT)

2. Create Task from Template
   ├─ Admin fills task configuration
   ├─ User enters actual data
   └─ Output fields calculate automatically

3. Export to Excel
   └─ Uses field mapping as layout blueprint
      (Fields appear in grid positions)
```

---

## Testing the Mapper

### Recommended Test Steps:
1. ✅ Click **"📋 Load Sample Task"** to load example fields
2. ✅ Review the 5 admin + 4 user + 3 output fields
3. ✅ Scroll to **Field Mapper** section
4. ✅ Click any field in the left sidebar and drag to grid
5. ✅ Arrange fields in a logical layout (grouped by category)
6. ✅ Click **Grid Settings** to try different grid sizes
7. ✅ Use **X** button to remove fields
8. ✅ Click **Export** to see the mapping structure in console

### Expected Console Output:
```javascript
{
  gridConfig: { rows: 5, columns: 3 },
  fieldMapping: [
    { cell: "0-0", fieldId: 1, fieldTitle: "Task Name" },
    { cell: "0-1", fieldId: 2, fieldTitle: "Department" },
    ...
  ]
}
```

---

## Key Concepts

### Field Types Restriction
- **Admin Fields** → String type only (descriptions, text data)
- **User Fields** → Integer type only (metrics, measurements)
- **Output Fields** → Calculated from user inputs

### Field Binding
- Output fields are bound to user fields via `inputFieldName`
- Example: "Task Status" reads `progressPercent` to determine status
- This binding enables automated calculation in Excel

### Grid Blueprint as Template
- The grid layout defines how tasks appear in Excel
- It's a repeating pattern for every task instance
- Provides consistency across all exported data

---

## Next Steps

After testing the mapper:
1. **Customize Formulas** - Edit output field formulas for your calculation logic
2. **Refine Grid Layout** - Rearrange fields for optimal Excel presentation
3. **Save Template** - Use the "Save Task Template" button to store your blueprint
4. **Create Tasks** - Generate actual tasks using this template
5. **Export to Excel** - Use the field mapping to structure Excel output

---

## Tips

- 📌 Keep frequently-used fields in top rows
- 📌 Group related fields (e.g., all date fields together)
- 📌 Leave some cells empty for visual spacing
- 📌 Test formulas before saving (check output field preview)
- 📌 Name your user fields clearly (for binding in output fields)

The field mapper is your Excel blueprint factory! 🎨
