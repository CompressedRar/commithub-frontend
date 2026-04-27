/**
 * Form-Based Task Integration Guide
 * 
 * This file shows how to integrate form-based task components into existing pages
 * and provides quick-reference code snippets.
 */

// ============================================================================
// INTEGRATION #1: ADMIN TASK CREATION (Already implemented in CategoryTasks.jsx)
// ============================================================================

/*
In CategoryTasks.jsx:

1. Import the component:
   import { AdminTaskCreator } from "../FormTaskComponents";

2. Add state:
   const [openFormTaskCreator, setOpenFormTaskCreator] = useState(false);

3. Add button in the UI:
   <Button
     variant="contained"
     color="success"
     size="large"
     endIcon={<AddBoxIcon />}
     onClick={() => setOpenFormTaskCreator(true)}
   >
     Create Form Task
   </Button>

4. Add the dialog:
   <AdminTaskCreator
     open={openFormTaskCreator}
     onClose={() => setOpenFormTaskCreator(false)}
     onTaskCreated={() => {
       loadCategory(); // Refresh
       setOpenFormTaskCreator(false);
     }}
   />
*/

// ============================================================================
// INTEGRATION #2: USER TASK RESPONSE
// ============================================================================

/*
For users to answer form-based tasks, you have several options:

OPTION A: In ManageTask.jsx (recommended for existing flow)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add a button to show form-based task response:

1. Import:
   import { UserTaskResponse } from "../FormTaskComponents";

2. Add state:
   const [selectedFormTask, setSelectedFormTask] = useState(null);

3. Next to "Add" button, add "Answer Form Task" button:
   {task.form_template_id ? (
     <button 
       className="btn btn-info ms-2"
       onClick={() => setSelectedFormTask(task.id)}
     >
       Answer Form Task
     </button>
   ) : null}

4. Add dialog:
   {selectedFormTask && (
     <UserTaskResponse
       open={selectedFormTask !== null}
       onClose={() => setSelectedFormTask(null)}
       taskId={selectedFormTask}
       onResponseSubmitted={() => {
         loadDepartmentTasks(batchID);
         setSelectedFormTask(null);
       }}
     />
   )}

OPTION B: Create a dedicated Form Tasks page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create: frontend/src/pages/FormTasks.jsx
- List all form-based tasks assigned to user
- Show "Answer" button next to each task
- Use UserTaskResponse for answering
- Show submission history

OPTION C: Add to existing task list
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In any task list component (GeneralTask.jsx, etc.):
- Filter tasks by form_template_id
- Show "Form-Based Task" badge
- Add "Answer" button instead of "Edit"
*/

// ============================================================================
// QUICK CODE SNIPPETS
// ============================================================================

// Example: Show form-based task button
const FormTaskButton = ({ task, onAnswerClick }) => {
  return task.form_template_id ? (
    <button
      className="btn btn-sm btn-info"
      onClick={() => onAnswerClick(task.id)}
    >
      📋 Answer Form Task
    </button>
  ) : null;
};

// Example: Task list filter
const filterFormTasks = (tasks) => {
  return tasks.filter(t => t.form_template_id && t.status === 1);
};

// Example: Task response submission
const handleFormTaskResponse = async (taskId, response) => {
  try {
    // Response data structure:
    // {
    //   task_id: 5,
    //   user_responses: { "field_1": "100", "field_2": "95" },
    //   actual_acc: 100,
    //   actual_time: 0,
    //   actual_mod: 0
    // }
    
    // TODO: Create API endpoint to save sub-task
    // POST /api/v1/task/response with above structure
    
    console.log('Form task response:', response);
  } catch (error) {
    console.error('Failed to submit response:', error);
  }
};

// ============================================================================
// BACKEND API ENDPOINTS
// ============================================================================

/*
1. CREATE FORM-BASED TASK (Admin)
   POST /api/v1/task/with-form
   
   Request:
   {
     "task_name": "Monthly Report",
     "description": "Submit monthly performance metrics",
     "form_template_id": 1,
     "category_id": 1,
     "target_quantity": 100,
     "target_efficiency": 90,
     "target_timeframe": 30,
     "timeliness_mode": "timeframe",
     "require_documents": false
   }
   
   Response:
   {
     "message": "Task successfully created with form template.",
     "task_id": 5
   }

2. GET MAIN TASK (with form template)
   GET /api/v1/task/:id
   
   Returns task with linked form_template data

3. SUBMIT FORM RESPONSE (User)
   TODO: Create endpoint
   POST /api/v1/task/:taskId/submit-response
   
   Request:
   {
     "user_responses": { "field_1": "100", "field_2": "95" },
     "actual_acc": 100,
     "actual_time": 0,
     "actual_mod": 0
   }
   
   Creates Sub_Task record with response data
*/

export default {};
