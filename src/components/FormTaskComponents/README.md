# Form-Based Task Components

## Overview

This module provides two main components for managing form-based tasks in the CommiHub system:

1. **AdminTaskCreator** - Allows administrators to create task definitions using form templates as blueprints
2. **UserTaskResponse** - Allows users to answer form-based tasks

## Architecture

### Task Definition System

```
FormTemplate (Blueprint)
├── Admin Fields (Task Structure - Read Only when answered)
│   └── Define the task structure and context
├── User Fields (Response Fields)
│   └── Define what users can answer (only numeric fields)
└── Form Output Fields (Computed/Calculated)

Main_Task (Task Definition)
├── Links to FormTemplate
├── Performance Targets (Quantity, Efficiency, Timeframe)
├── Description and Requirements
└── Can be assigned to Departments/Users

Sub_Task (User Response)
├── Links to Main_Task
├── User's actual accomplishment/performance data
├── Can be consolidated for OPCR/IPCR
```

### Field Types

#### Admin Fields
- Used to define the task structure and context
- Read-only when users are answering
- Can be any type (String, Integer, Email, Date, etc.)
- Help users understand what they're working on

#### User Fields
- These are the fields users can answer
- Currently limited to numeric fields (Number, Integer)
- Can be required or optional
- User responses become sub-task data

## Components

### AdminTaskCreator

Creates a main task (task definition) from a form template.

#### Features
- Select form template as blueprint
- View admin fields (task structure)
- Edit user field descriptions
- Set performance targets (quantity, efficiency, timeframe)
- Assign to departments
- Option to require supporting documents

#### Props
```jsx
<AdminTaskCreator
  open={boolean}           // Controls dialog visibility
  onClose={() => {}}       // Called when dialog closes
  onTaskCreated={(task) => {}} // Called when task is created
/>
```

#### Example Usage
```jsx
import { AdminTaskCreator } from '../components/FormTaskComponents';
import { useState } from 'react';

export default function AdminTaskPage() {
  const [openCreator, setOpenCreator] = useState(false);

  const handleTaskCreated = (task) => {
    console.log('Task created:', task);
    // Refresh task list or navigate
  };

  return (
    <>
      <Button onClick={() => setOpenCreator(true)}>
        Create Task from Form
      </Button>

      <AdminTaskCreator
        open={openCreator}
        onClose={() => setOpenCreator(false)}
        onTaskCreated={handleTaskCreated}
      />
    </>
  );
}
```

### UserTaskResponse

Allows users to answer a specific task.

#### Features
- View task definition and performance targets
- See admin fields for context (read-only)
- Answer user response fields (numeric only)
- Input validation for required fields
- Submit response which creates a sub-task

#### Props
```jsx
<UserTaskResponse
  open={boolean}              // Controls dialog visibility
  onClose={() => {}}          // Called when dialog closes
  taskId={number}             // ID of the main task to answer
  onResponseSubmitted={(response) => {}} // Called on success
/>
```

#### Example Usage
```jsx
import { UserTaskResponse } from '../components/FormTaskComponents';
import { useState } from 'react';

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState(null);

  const handleResponseSubmitted = (response) => {
    console.log('Response submitted:', response);
    // Show success message, refresh list, etc.
  };

  return (
    <>
      <Button onClick={() => setSelectedTask(taskId)}>
        Answer Task
      </Button>

      <UserTaskResponse
        open={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        taskId={selectedTask}
        onResponseSubmitted={handleResponseSubmitted}
      />
    </>
  );
}
```

## API Endpoints

### Create Task with Form Template

**POST** `/api/v1/task/with-form`

Request:
```json
{
  "task_name": "Monthly Report",
  "description": "Submit monthly performance report",
  "form_template_id": 1,
  "category_id": 1,
  "target_quantity": 100,
  "target_efficiency": 90,
  "target_timeframe": 30,
  "timeliness_mode": "timeframe",
  "require_documents": false,
  "user_field_descriptions": {
    "field_1": "Actual accomplishment",
    "field_2": "Efficiency percentage"
  }
}
```

Response:
```json
{
  "message": "Task successfully created with form template.",
  "task_id": 5
}
```

## Data Flow

### Task Creation Flow

1. Admin opens AdminTaskCreator dialog
2. Selects a form template (defines structure)
3. Configures performance targets
4. Edits user field descriptions
5. Submits - creates Main_Task linked to FormTemplate
6. Task is ready for assignment

### Task Response Flow

1. User sees assigned task
2. Opens UserTaskResponse dialog
3. Views task definition and targets
4. Answers numeric user fields
5. Submits response
6. Response becomes Sub_Task record
7. Can be consolidated later for OPCR/IPCR

## OPCR/IPCR Integration

### For OPCR (Organizational Performance Commitment Review)
- Aggregate responses from all users in a department
- Calculate department-level performance
- Compare actual vs. target metrics
- Generate consolidation reports

### For IPCR (Individual Performance Commitment Review)
- Gather individual user responses
- Consolidate with other task performances
- Calculate individual ratings
- Support performance evaluation process

## Technical Notes

- Admin fields are stored in FormTemplate as `user_type = "Admin"`
- User response fields are stored as `user_type = "User"`
- Currently, only numeric fields (Number, Integer) are allowed for user responses
- User responses are stored in Sub_Task records
- Main_Task links to FormTemplate via `form_template_id` foreign key

## Future Enhancements

1. Support for more field types in user responses (text, date, etc.)
2. Field-level permissions and visibility controls
3. Response validation rules
4. Template versioning for historical reference
5. Response history tracking
6. Bulk response submission
7. Conditional field display based on previous answers
8. File upload support for documents

## Dependencies

- Material-UI (MUI) v7.3.8
- notistack (for snackbar notifications)
- Axios (for API calls)

## Related Services

- `formBuilderService.jsx` - Form template management
- `taskService.jsx` - Task management (includes new `createMainTaskWithForm`)
