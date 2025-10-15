import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  archiveMainTask,
  getMainTask,
  updateMainTaskInfo,
} from "../../services/taskService";
import { objectToFormData } from "../api";

function TaskInfo({ id, backAfterArchive }) {
  const [taskInfo, setTaskInfo] = useState({});
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // detect changes
    if (taskInfo[id] !== value) setIsDirty(true);
  };

  const loadTaskInfo = async () => {
    try {
      const res = await getMainTask(id);
      setTaskInfo(res.data);
      setFormData(res.data);
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

  const handleUpdate = async () => {
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
          backAfterArchive();
        } catch (error) {
          Swal.fire("Error", error.response?.data?.error, "error");
        }
      }
    });
  };

  useEffect(() => {
    if (id) loadTaskInfo();
  }, [id]);

  return (
    <div className="p-2">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Task Information</h5>
          <button className="btn btn-danger btn-sm d-flex align-items-center gap-2" onClick={handleArchive}>
            <span className="material-symbols-outlined">archive</span> Archive Task
          </button>
        </div>

        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-bold">Task Name</label>
            <input
              id="name"
              type="text"
              className="form-control"
              value={formData.name || ""}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Target Output</label>
              <textarea
                id="target_accomplishment"
                className="form-control"
                rows="3"
                value={formData.target_accomplishment || ""}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Actual Output</label>
              <textarea
                id="actual_accomplishment"
                className="form-control"
                rows="3"
                value={formData.actual_accomplishment || ""}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Time Measurement</label>
              <input
                id="time_measurement"
                type="text"
                className="form-control"
                value={formData.time_measurement || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Modification</label>
              <input
                id="modifications"
                type="text"
                className="form-control"
                value={formData.modifications || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              disabled={!isDirty || loading}
              onClick={handleUpdate}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
  );
}

export default TaskInfo;
