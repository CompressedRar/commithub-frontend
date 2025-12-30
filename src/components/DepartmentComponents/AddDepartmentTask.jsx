import { useState, useEffect } from "react";
import { getCategoriesWithTasks } from "../../services/categoryService";
import {
  assignDepartment,
  getDepartment,
  removeTask,
} from "../../services/departmentService";
import Swal from "sweetalert2";
import { socket } from "../api";

function AddDepartmentTask(props) {
  const [allCategories, setAllCategories] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState({});
  const [archiving, setArchiving] = useState(false);

  async function loadAllCategories() {
    const res = await getCategoriesWithTasks()
      .then((data) => data.data)
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: error.response.data.error,
          icon: "error",
        });
      });
      
    console.log("categoru ",res)
    setAllCategories(res);
  }

  async function loadDepartmentInfo() {
    const res = await getDepartment(props.dept_id)
      .then((data) => data.data)
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: error.response.data.error,
          icon: "error",
        });
      });

    setDepartmentInfo(res);
  }

  const Remove = async (task_id) => {
    const res = await removeTask(task_id, props.dept_id)
      .then((data) => data.data.message)
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: error.response.data.error,
          icon: "error",
        });
      });

    if (res === "Output successfully removed.") {
      Swal.fire({ title: "Success", text: res, icon: "success" });
      loadAllCategories();
    } else {
      Swal.fire({ title: "Error", text: res, icon: "error" });
    }
  };

  const handleRemove = async (task_id) => {
    Swal.fire({
      title: "Do you want to remove this Output?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await Remove(task_id);
      }
    });
    setArchiving(false);
  };

  const assignTask = async (task_id) => {
    const res = await assignDepartment(task_id, props.dept_id)
      .then((data) => data.data.message)
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: error.response.data.error,
          icon: "error",
        });
      });

    if (res === "Output successfully assigned.") {
      Swal.fire({ title: "Success", text: res, icon: "success" });
      loadAllCategories();
    } else {
      Swal.fire({ title: "Error", text: res, icon: "error" });
    }
  };

  const handleAssign = async (task_id) => {
    Swal.fire({
      title: "Assign this Output to this department?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await assignTask(task_id);
      }
    });
    setArchiving(false);
  };

  useEffect(() => {
    loadAllCategories();
    loadDepartmentInfo();

    socket.on("department_assigned", () => {
      loadAllCategories();
    });

    return () => {
      socket.off("department_assigned");
    };
  }, []);

  return (
    <div
      className="modal-body"
      style={{
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      {allCategories.map((category, cidx) => {
        const activeTasks = category.main_tasks.filter((task) => task.status);

        return (
          <div key={cidx} className="mb-4">
            <h6 className="fw-semibold text-secondary mb-3 border-bottom pb-2">
              <i className="bi bi-folder2-open me-2 text-primary"></i>
              {category.name}
            </h6>

            {activeTasks.length > 0 ? (
              <div className="d-grid gap-2">
                {activeTasks.map((task, tidx) => (
                  <div className="row">
                  <div
                    key={tidx}
                    className="border col-xl-4 col-lg-6 col-md-12 rounded p-3 bg-white shadow-sm d-flex justify-content-between align-items-center"
                  >
                    {/* Task Info */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <i className="bi bi-check2-square text-primary"></i>
                      <span className="fw-semibold">{task.name}</span>
                      <span
                        className={`badge rounded-pill ${
                          task.department === "General"
                            ? "bg-info text-dark"
                            : "bg-light text-muted border"
                        }`}
                      >
                        
                      </span>
                    </div>
                    {/* Actions */}
                    <div>
                      {!task.department_ids.includes(departmentInfo.id) ? (
                        <button
                          className="btn btn-sm btn-outline-primary px-3"
                          onClick={() => handleAssign(task.id)}
                        >
                          <i className="bi bi-plus-lg me-1"></i> Add
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger px-3"
                          onClick={() => handleRemove(task.id)}
                        >
                          <i className="bi bi-trash me-1"></i> Remove
                        </button>
                      )}
                    </div>
                  </div>


                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted fst-italic py-3 bg-light rounded">
                <i className="bi bi-info-circle me-2"></i>
                No available Outputs under this category.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AddDepartmentTask;
