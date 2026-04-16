/**
 * Sample Task Data for Field Mapper Testing
 * 
 * This represents a typical task template with:
 * - Admin fields: Static task configuration from department heads
 * - User fields: Input from faculty/employees
 * - Output fields: Calculated values for Excel export
 * 
 * Purpose: Create a BLUEPRINT that determines how tasks are laid out in Excel
 * When generated, each task repeats this field structure in the Excel file
 */

export const sampleTaskData = {
  inputFields: [
    // Admin Fields (String type only)
    {
      id: 1,
      title: "Task Name",
      type: "String",
      user: "Admin",
      required: true,
      placeholder: "Enter task title",
      name: null,
    },
    {
      id: 2,
      title: "Department",
      type: "String",
      user: "Admin",
      required: true,
      placeholder: "e.g., Engineering, Marketing",
      name: null,
    },
    {
      id: 3,
      title: "Task Category",
      type: "String",
      user: "Admin",
      required: true,
      placeholder: "e.g., Research, Implementation",
      name: null,
    },
    {
      id: 4,
      title: "Due Date",
      type: "String",
      user: "Admin",
      required: false,
      placeholder: "YYYY-MM-DD",
      name: null,
    },
    {
      id: 5,
      title: "Expected Duration",
      type: "String",
      user: "Admin",
      required: false,
      placeholder: "e.g., 2 weeks, 40 hours",
      name: null,
    },

    // User Fields (Integer type only)
    {
      id: 6,
      title: "Hours Spent",
      type: "Integer",
      user: "User",
      required: true,
      placeholder: "0",
      description: "Number of hours spent on this task",
      name: "hourSpent",
    },
    {
      id: 7,
      title: "Progress %",
      type: "Integer",
      user: "User",
      required: true,
      placeholder: "0",
      description: "Completion percentage (0-100)",
      name: "progressPercent",
    },
    {
      id: 8,
      title: "Deliverables Count",
      type: "Integer",
      user: "User",
      required: false,
      placeholder: "0",
      description: "Number of deliverables completed",
      name: "deliverables",
    },
    {
      id: 9,
      title: "Issues Encountered",
      type: "Integer",
      user: "User",
      required: false,
      placeholder: "0",
      description: "Number of blockers or issues",
      name: "issues",
    },
  ],

  outputFields: [
    {
      id: 101,
      title: "Task Status",
      type: "CaseOutput",
      inputFieldNames: ["progressPercent"],
      formula: null,
      cases: [
        { condition: "0-25", output: "Not Started" },
        { condition: "26-50", output: "In Progress" },
        { condition: "51-75", output: "Nearly Complete" },
        { condition: "76-100", output: "Completed" },
      ],
    },
    {
      id: 102,
      title: "Effort Adjusted Hours",
      type: "IntegerModifier",
      inputFieldNames: ["hourSpent"],
      formula: "{hourSpent} * 1.2",
      cases: [],
    },
    {
      id: 103,
      title: "Risk Level",
      type: "CaseOutput",
      inputFieldNames: ["issues"],
      formula: null,
      cases: [
        { condition: "0", output: "Low Risk" },
        { condition: "1-2", output: "Medium Risk" },
        { condition: "3+", output: "High Risk" },
      ],
    },
  ],
};

/**
 * Template Explanation:
 * 
 * ADMIN FIELDS (Task Configuration):
 * - Set by department heads/managers
 * - Define what the task is about
 * - Provide context and deadlines
 * 
 * USER FIELDS (Faculty/Employee Input):
 * - Filled by the person doing the task
 * - Track actual work done
 * - Measure progress and effort
 * 
 * OUTPUT FIELDS (Calculated for Excel):
 * - Derived from user input
 * - Examples:
 *   * Task Status: Converts progress % to readable status
 *   * Effort Adjusted Hours: Calculates adjusted time (with overhead)
 *   * Risk Level: Determines project risk based on issues
 * 
 * FIELD MAPPING (Excel Blueprint):
 * When you map these fields in the grid, you're creating a layout template.
 * Every task created from this template will use the same Excel layout:
 * 
 * Example Layout:
 * ┌─────────────┬──────────────┬──────────────┐
 * │ Task Name   │ Department   │ Task Category│
 * │ Due Date    │ Expected Dur.│ Hours Spent  │
 * │ Progress %  │ Deliverables │ Issues       │
 * │ Status      │ Risk Level   │ Adj. Hours   │
 * └─────────────┴──────────────┴──────────────┘
 * 
 * This structure repeats for each task when exported to Excel.
 */
