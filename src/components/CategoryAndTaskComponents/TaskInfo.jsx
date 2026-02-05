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
  const [selectedDepartments, setSelectedDepartments] = useState([])
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

    console.log(name, value)
    if (taskInfo[name] !== value) setIsDirty(true);
  };

  const handleCheckbox = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
    

    // detect changes

    console.log(name, e.target.checked)
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
      setSelectedDepartments(res.data.department_ids)
      setFormData({
        ...res.data,
        target_deadline: res.data.target_deadline ? formatDateForInput(res.data.target_deadline) : ""
      });

      console.log("OUTPUt INFO",  formData)
      setIsDirty(false);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load task info.",
        icon: "error",
      });
    }
  };

  

  const handleDepartmentAppend = (e) => {
    const id = Number(e.target.value)

    setFormData(prev => ({
      ...prev,
      department: e.target.checked
        ? [...prev.department, id]
        : prev.department.filter(d => d !== id)
    }))

    if (selectedDepartments !== formData.department) setIsDirty(true);

    console.log("UPDATED FORM DATA", formData.department)
  }

  function formatDate(date) {
        const year = date.getFullYear();
        let month = date.getMonth() + 1; // getMonth() returns 0-11
        let day = date.getDate();

        // Pad single-digit month and day with a leading zero
        if (month < 10) month = `0${month}`;
        if (day < 10) day = `0${day}`;

        return `${year}-${month}-${day}`;
    }


  const handleUpdate = async () => {
    if (!formData.name) {
      Swal.fire("Validation", "Please fill all required fields", "warning");
      return;
    }

    setLoading(true);
    const newFormData = objectToFormData(formData);
    try {
      const res = await updateMainTaskInfo(newFormData);
      Swal.fire({
        title: "Success",
        text: res.data.message || "Task successfully updated.",
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
      title: "Do you want to archive this task?",
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
            {formData.name || "Task"}
          </h5>
          <small className="text-muted d-block">View and manage task details</small>
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
          <label className="form-label fw-semibold">Task Name <span className="text-danger">*</span></label>
          <input
            name="name"
            type="text"
            className="form-control"
            placeholder="e.g., Board Trustees Meeting"
            value={formData.name || ""}
            onChange={handleChange}
          />
          <small className="text-muted d-block mt-1">The main title of this task</small>
        </div>

        {/* Office/Department */}

        <div className="mb-3 p-2">
          <label className="form-label fw-semibold">Office</label>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"5px"}}>
            {allDepartments.map((dept) => (
               
              <div className="d-flex gap-2">
                <input  name="department" type="checkbox" id = {`dept-${dept.name}`} value = {dept.id} onChange={handleDepartmentAppend} checked = {formData.department.includes(dept.id)}/>
                
                <label htmlFor={`dept-${dept.name}`}>
                  {dept.name}
                </label>
                
              </div>
              
            ))}
          </div>          
        </div>

        <div className="mb-3 p-2">
          <label className="form-label fw-semibold">Description</label>
          <textarea className="form-control" rows={5} name="description" placeholder="Define what the task entails..." onChange={handleChange} value={formData.description || ""} id=""></textarea>        
        </div>

        {/* Description */}
        <h6 className="fw-semibold mt-4 mb-3">Success Indicators</h6>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Target Accomplishment <span className="text-danger">*</span></label>
            <textarea
              id="target_accomplishment"
              name="target_accomplishment"
              className="form-control"
              rows="4"
              placeholder="Define the target quantity/measure..."
              value={formData.target_accomplishment || ""}
              onChange={handleChange}
            ></textarea>
            <small className="text-muted d-block mt-1">What is the expected outcome?</small>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Actual Accomplisment <span className="text-danger">*</span></label>
            <textarea
              id="actual_accomplishment"
              name="actual_accomplishment"
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
        <div className="mb-3 d-none">
          <label className="form-label fw-semibold">Timeliness Mode</label>
          <select
            name="timeliness_mode"
            className="form-select"
            value={formData.timeliness_mode || "timeframe"}
            onChange={handleChange}
          >
            <option value="timeframe">Timeframe (number + unit)</option>
          </select>
        </div>

        <div className="row g-2">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Target Timeliness</label>
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
              <input
                name="time_measurement"
                className="form-control"
                placeholder="eg. days"
                value={formData.time_measurement || "day"}
                onChange={handleChange}
              />
              <small className="text-muted d-block mt-1">Unit for the timeframe</small>
            </div>
          </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Require Supporting Document</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="require_documents"
                        onChange={handleCheckbox}
                        style={{ cursor: "pointer", width: "3rem", height: "1.5rem" }}
                        value={formData.require_documents}
                      />
                      <label className="form-check-label ms-2" htmlFor="requireDocToggle">
                        {formData.require_documents ? "Yes, required" : "No, optional"}
                      </label>
                    </div>
                  </div>

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