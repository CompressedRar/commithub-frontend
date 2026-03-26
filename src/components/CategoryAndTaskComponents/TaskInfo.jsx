import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useTaskInfo } from "../../hooks/useTaskInfo";

// ── sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return <h6 className="fw-semibold mt-4 mb-3">{children}</h6>;
}

function FormField({ label, required, hint, children }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {hint && <small className="text-muted d-block mt-1">{hint}</small>}
    </div>
  );
}

function DepartmentCheckboxes({ allDepartments, selectedIds, onToggle }) {
  return (
    <FormGroup sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
      {allDepartments.map((dept) => (
        <FormControlLabel
          key={dept.id}
          label={dept.name}
          control={
            <Checkbox
              name="department"
              value={dept.id}
              checked={selectedIds?.includes(dept.id) ?? false}
              onChange={(e) => onToggle(dept.id, e.target.checked)}
            />
          }
        />
      ))}
    </FormGroup>
  );
}

// ── main component ─────────────────────────────────────────────────────────

function TaskInfo({ id, backAfterArchive }) {
  const {
    formData,
    allDepartments,
    isDirty,
    loading,
    handleChange,
    handleCheckbox,
    toggleDepartment,
    resetForm,
    handleUpdate,
    handleArchive,
  } = useTaskInfo(id, { onArchived: backAfterArchive });


  return (
    <div className="py-2">

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">task_alt</span>
            {formData.name ?? "Task"}
          </h5>
          <small className="text-muted d-block">View and manage task details</small>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger d-flex" onClick={handleArchive}>
            <span className="material-symbols-outlined me-1">archive</span>
            Archive
          </button>
        </div>
      </div>

      {/* Form */}
      <form noValidate onSubmit={(e) => e.preventDefault()} className="mb-4">

        <FormField label="Task Name" required hint="The main title of this task">
          <input
            name="name"
            type="text"
            className="form-control"
            placeholder="e.g., Board Trustees Meeting"
            value={formData.name ?? ""}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Office">
          <DepartmentCheckboxes
            allDepartments={allDepartments}
            selectedIds={formData.department}
            onToggle={toggleDepartment}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            className="form-control"
            rows={5}
            name="description"
            placeholder="Define what the task entails..."
            value={formData.description ?? ""}
            onChange={handleChange}
          />
        </FormField>

        <SectionHeader>Success Indicators</SectionHeader>

        <div className="row">
          <div className="col-md-6 mb-3">
            <FormField
              label="Target Accomplishment"
              required
              hint="What is the expected outcome?"
            >
              <textarea
                name="target_accomplishment"
                className="form-control"
                rows={4}
                placeholder="Define the target quality/measure..."
                value={formData.target_accomplishment ?? ""}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="col-md-6 mb-3">
            <FormField
              label="Actual Accomplishment"
              required
              hint="What was actually achieved?"
            >
              <textarea
                name="actual_accomplishment"
                className="form-control"
                rows={4}
                placeholder="Record the actual accomplishment..."
                value={formData.actual_accomplishment ?? ""}
                onChange={handleChange}
              />
            </FormField>
          </div>
        </div>

        <FormField label="Efficiency Unit" hint="Type of modification allowed">
          <input
            type="text"
            name="modification"
            className="form-control"
            value={formData.modifications ?? ""}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Time Unit" hint="Unit for the timeframe">
          <input
            name="time_measurement"
            className="form-control"
            placeholder="e.g. days"
            value={formData.time_measurement ?? "day"}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Require Supporting Document">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="requireDocToggle"
              name="require_documents"
              checked={!!formData.require_documents}
              onChange={handleCheckbox}
              style={{ cursor: "pointer", width: "3rem", height: "1.5rem" }}
            />
            <label className="form-check-label ms-2" htmlFor="requireDocToggle">
              {formData.require_documents ? "Yes, required" : "No, optional"}
            </label>
          </div>
        </FormField>

        {/* Metadata */}
        <FormField label="Status">
          <div className="p-3 bg-light rounded">
            <small className="text-muted d-block">
              Created:{" "}
              <span className="fw-semibold">
                {formData.created_at
                  ? new Date(formData.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </small>
          </div>
        </FormField>

      </form>

      {/* Footer Actions */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button
          className="btn btn-outline-secondary d-flex"
          onClick={resetForm}
          disabled={!isDirty || loading}
        >
          <span className="material-symbols-outlined me-1">close</span>
          Cancel
        </button>

        <button
          className="btn btn-primary d-flex"
          onClick={handleUpdate}
          disabled={!isDirty || loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined me-1">save</span>
              Save Changes
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default TaskInfo;
