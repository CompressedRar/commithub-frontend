import { useState, useEffect, useRef } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  Button, FormControl, InputLabel,
  OutlinedInput, TextField, Stack,
} from "@mui/material";
import { Modal } from "bootstrap";
import { useCreateTask } from "../../hooks/useCreateTask";

/**
 * Self-contained modal for creating a task.
 *
 * Props:
 *  - modalId       : string  (default "add-task")
 *  - categoryId    : number
 *  - allDepartments: array
 *  - taskForm      : object  (controlled state from parent)
 *  - setTaskField  : (name, value) => void
 *  - toggleDepartment : (id, checked) => void
 *  - resetForm     : () => void
 *  - onSuccess     : () => void  (called after successful create)
 */
function CreateTaskModal({
  modalId = "add-task",
  allDepartments = [],
  taskForm,
  setTaskField,
  toggleDepartment,
  resetForm,
  onSuccess,
}) {
  const [requireDocument, setRequireDocument] = useState(true);
  const [documentFormat, setDocumentFormat] = useState("none");

  const closeModal = () => {
    const modal = Modal.getInstance(document.getElementById(modalId));
    modal?.hide();
  };

  const handleFormatChange = (e) => {
    setDocumentFormat(e.target.value);
  };

  const handleClose = () => {
    resetForm();
    setRequireDocument(false);
    closeModal();
  };

  const { submitting, handleSubmit } = useCreateTask({
    taskForm,
    requireDocument,
    documentFormat,
    onSuccess: () => { onSuccess?.(); },
    onClose: handleClose,
  });

  const handleFieldChange = (e) => {
    setTaskField(e.target.name, e.target.value);
  };

  const handleDeptChange = (e) => {
    toggleDepartment(Number(e.target.value), e.target.checked);
  };

  return (
    <div
      className="modal fade"
      id={modalId}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="createTaskLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content shadow-lg border-0 rounded-3">

          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-semibold">
              <span className="material-symbols-outlined me-2 align-middle">add_task</span>
              Create Task
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-3">
            <form noValidate onSubmit={(e) => e.preventDefault()}>

              {/* Task Name */}
              <FormControl fullWidth className="mb-3">
                <InputLabel htmlFor="task_name">Task Name *</InputLabel>
                <OutlinedInput
                  id="task_name"
                  name="task_name"
                  label="Task Name *"
                  placeholder="e.g., Board Trustees Meeting"
                  value={taskForm.task_name}
                  onChange={handleFieldChange}
                  required
                />
              </FormControl>

              {/* Offices */}
              <div className="p-2 mb-3">
                <InputLabel>Offices</InputLabel>
                <FormGroup sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {allDepartments.map((dept) => (
                    <FormControlLabel
                      key={dept.id}
                      label={dept.name}
                      control={
                        <Checkbox
                          name="department"
                          value={dept.id}
                          checked={taskForm.department.includes(dept.id)}
                          onChange={handleDeptChange}
                        />
                      }
                    />
                  ))}
                </FormGroup>
              </div>

              {/* Target Accomplishment */}
              <div className="mb-3">
                <InputLabel>Target Accomplishment *</InputLabel>
                <TextField
                  fullWidth
                  multiline
                  name="task_desc"
                  rows={4}
                  maxRows={5}
                  placeholder="Describe the measurable aspect of the output..."
                  value={taskForm.task_desc}
                  onChange={handleFieldChange}
                  required
                />
              </div>

              {/* Time Unit */}
              <div className="mb-3">
                <InputLabel>Time Unit</InputLabel>
                <TextField
                  fullWidth
                  type="text"
                  name="time_measurement"
                  placeholder="e.g. days"
                  value={taskForm.time_measurement}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Efficiency Unit */}
              <div className="mb-3">
                <InputLabel>Efficiency Unit</InputLabel>
                <TextField
                  fullWidth
                  type="text"
                  name="modification"
                  placeholder="e.g. corrections"
                  value={taskForm.modification}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Require Document */}
              <div className="mb-3 d-none">
                <label className="form-label fw-semibold">Require Supporting Document</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="requireDocToggle"
                    checked={requireDocument}
                    onChange={(e) => setRequireDocument(e.target.checked)}
                    style={{ cursor: "pointer", width: "3rem", height: "1.5rem" }}
                  />
                  <label className="form-check-label ms-2" htmlFor="requireDocToggle">
                    {requireDocument ? "Yes, required" : "No, optional"}
                  </label>
                </div>
              </div>
              {/* Supporting Document Format */}
              <div className="mb-3">
                <InputLabel>Supporting Document Format</InputLabel>

                <TextField
                  select
                  fullWidth
                  name="document_format"
                  value={documentFormat}
                  onChange={handleFormatChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="none">None</option>
                  <option value="any">Any format</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Image (JPG/PNG)</option>
                  <option value="excel">Excel</option>
                  <option value="doc">Word Document</option>
                </TextField>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="modal-footer d-flex justify-content-between">
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={
                submitting
                  ? <span className="material-symbols-outlined spin">progress_activity</span>
                  : <span className="material-symbols-outlined">add_circle</span>
              }
            >
              {submitting ? "Processing..." : "Create Task"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateTaskModal;
