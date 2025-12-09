import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  archiveMainTask,
  getMainTask,
  updateMainTaskInfo,
} from "../../services/taskService";
import { objectToFormData } from "../api";
import { getDepartments } from "../../services/departmentService";

function TaskInfo({ id, backAfterArchive, backToPage }) {
  const [taskInfo, setTaskInfo] = useState({});
  const [formData, setFormData] = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titleEditable, setTitleEditable] = useState(false);

  // helper: convert server datetime to input-friendly "yyyy-MM-ddTHH:mm" (local)
  const formatDateForInput = (dt) => {
    if (!dt) return "";
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return "";
      const tzOffset = d.getTimezoneOffset() * 60000;
      const local = new Date(d.getTime() - tzOffset);
      return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    } catch {
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // detect changes
    if (taskInfo[name] !== value) setIsDirty(true);
  };

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setAllDepartments(res.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTaskInfo = async () => {
    try {
      const res = await getMainTask(id);
      console.log("MAIN TASK DATA", res.data);
      setTaskInfo(res.data);
      setFormData({
        ...res.data,
        target_deadline: res.data.target_deadline ? formatDateForInput(res.data.target_deadline) : ""
      });
      setIsDirty(false);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load output info.",
        icon: "error",
      });
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.task_desc) {
      Swal.fire("Validation", "Please fill all required fields", "warning");
      return;
    }

    setLoading(true);
    const newFormData = objectToFormData(formData);
    try {
      const res = await updateMainTaskInfo(newFormData);
      Swal.fire({
        title: "Success",
        text: res.data.message || "Output successfully updated.",
        icon: "success",
      });
      setIsDirty(false);
      setTitleEditable(false);
      loadTaskInfo();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Update failed.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    Swal.fire({
      title: "Do you want to archive this output?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await archiveMainTask(id);
          Swal.fire("Archived!", res.data.message, "success");
          backAfterArchive?.();
        } catch (error) {
          Swal.fire("Error", error.response?.data?.error, "error");
        }
      }
    });
  };

  useEffect(() => {
    if (id) {
      loadTaskInfo();
      loadDepartments();
    }
  }, [id]);

  return (
    <div className="py-2">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">task_alt</span>
            {formData.name || "Output"}
          </h5>
          <small className="text-muted d-block">View and manage output details</small>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger d-flex" onClick={handleArchive}>
            <span className="material-symbols-outlined me-1">archive</span> Archive
          </button>
        </div>
      </div>

      {/* Form */}
      <form noValidate className="mb-4">
        {/* Output Name */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Output Name <span className="text-danger">*</span></label>
          <input
            name="name"
            type="text"
            className="form-control"
            placeholder="e.g., Board Trustees Meeting"
            value={formData.name || ""}
            onChange={handleChange}
          />
          <small className="text-muted d-block mt-1">The main title of this output</small>
        </div>

        {/* Office/Department */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Office</label>
          <select
            name="department"
            className="form-select"
            value={formData.department || ""}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            <option key="" value="General">General</option>
            {allDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <h6 className="fw-semibold mt-4 mb-3">Success Indicators</h6>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Target Quantity <span className="text-danger">*</span></label>
            <textarea
              id="target_accomplishment"
              className="form-control"
              rows="4"
              placeholder="Define the target quantity/measure..."
              value={formData.target_accomplishment || ""}
              onChange={handleChange}
            ></textarea>
            <small className="text-muted d-block mt-1">What is the expected outcome?</small>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Actual Quantity <span className="text-danger">*</span></label>
            <textarea
              id="actual_accomplishment"
              className="form-control"
              rows="4"
              placeholder="Record the actual accomplishment..."
              value={formData.actual_accomplishment || ""}
              onChange={handleChange}
            ></textarea>
            <small className="text-muted d-block mt-1">What was actually achieved?</small>
          </div>
        </div>

        {/* Target Quantity */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Target Quantity</label>
          <input
            name="target_quantity"
            type="number"
            className="form-control"
            placeholder="Enter target quantity"
            value={formData.target_quantity || ""}
            onChange={handleChange}
            min="1"
          />
          <small className="text-muted d-block mt-1">The target number to be achieved</small>
        </div>

        {/* Target Efficiency */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Target Efficiency</label>
          <input
            name="target_efficiency"
            type="number"
            className="form-control"
            placeholder="Enter target efficiency"
            value={formData.target_efficiency}
            onChange={handleChange}
          />
          <small className="text-muted d-block mt-1">The efficiency measure or goal</small>
        </div>

        {/* Efficiency Unit */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Efficiency Unit</label>
          <select
            name="modification"
            className="form-select"
            value={formData.modification || "correction"}
            onChange={handleChange}
          >
            <option value="correction">Correction</option>
            <option value="revision">Revision</option>
            <option value="error">Error</option>
          </select>
          <small className="text-muted d-block mt-1">Type of modification allowed</small>
        </div>

        {/* Timeliness Mode */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Timeliness Mode</label>
          <select
            name="timeliness_mode"
            className="form-select"
            value={formData.timeliness_mode || "timeframe"}
            onChange={handleChange}
          >
            <option value="timeframe">Timeframe (number + unit)</option>
            <option value="deadline">Deadline (specific date/time)</option>
          </select>
          <small className="text-muted d-block mt-1">How to measure timeliness</small>
        </div>

        {/* Conditional: Timeframe or Deadline */}
        {(formData.timeliness_mode || "timeframe") === "timeframe" ? (
          <div className="row g-2">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Target Timeframe (units)</label>
              <input
                type="number"
                name="target_timeframe"
                className="form-control"
                placeholder="Enter number of units"
                value={formData.target_timeframe || ""}
                onChange={handleChange}
                min="1"
              />
              <small className="text-muted d-block mt-1">Use with unit selector below</small>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Time Unit</label>
              <select
                name="time_measurement"
                className="form-select"
                value={formData.time_measurement || "day"}
                onChange={handleChange}
              >
                <option value="minute">Minute</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="semester">Semester</option>
                <option value="year">Year</option>
              </select>
              <small className="text-muted d-block mt-1">Unit for the timeframe</small>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label fw-semibold">Target Deadline</label>
            <input
              type="datetime-local"
              name="target_deadline"
              className="form-control"
              value={formData.target_deadline || ""}
              onChange={handleChange}
            />
            <small className="text-muted d-block mt-1">Specify exact date/time for completion</small>
          </div>
        )}

        {/* Status */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Status</label>
          <div className="p-3 bg-light rounded">
            <small className="text-muted d-block">
              Created: <span className="fw-semibold">{formData.created_at ? new Date(formData.created_at).toLocaleDateString() : "N/A"}</span>
            </small>
            { false && 
              <small className="text-muted d-block">
              Last Updated: <span className="fw-semibold">{formData.updated_at ? new Date(formData.updated_at).toLocaleDateString() : "N/A"}</span>
            </small>
            }
          </div>
        </div>
      </form>

      {/* Save/Cancel Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button
          className="btn btn-outline-secondary d-flex"
          onClick={() => {
            setFormData({
              ...taskInfo,
              target_deadline: taskInfo.target_deadline ? formatDateForInput(taskInfo.target_deadline) : ""
            });
            setIsDirty(false);
          }}
          disabled={!isDirty || loading}
        >
          <span className="material-symbols-outlined me-1">close</span> Cancel
        </button>
        <button
          className="btn btn-primary d-flex"
          disabled={!isDirty || loading}
          onClick={handleUpdate}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
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