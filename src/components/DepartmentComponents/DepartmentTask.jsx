import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { removeTask } from "../../services/departmentService";
import { socket } from "../api";
import { getSettings } from "../../services/settingsService"
function DepartmentTask({ mems, switchMember }) {
  const [assigned, setAssigned] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null) //monitoring, rating, planning

  function filterAssigned() {
    const seen = new Set();
    const filtered = mems.users?.filter((user) => {
      if (seen.has(user.id)) return false;
      seen.add(user.id);
      return true;
    });

    
    setAssigned(filtered || []);
  }

  const handleRemove = async () => {
    Swal.fire({
      title: "Do you want to remove this output?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await removeTask(mems.id);
          const msg = res.data.message;
          Swal.fire({
            title: msg.includes("successfully") ? "Success" : "Error",
            text: msg,
            icon: msg.includes("successfully") ? "success" : "error",
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.response?.data?.error || "An error occurred.",
            icon: "error",
          });
        }
      }
    });
  };

  async function loadCurrentPhase() {
          try {
              const res = await getSettings()
              const phase = res?.data?.data?.current_phase
              console.log("Current phase:", phase)
              setCurrentPhase(phase) //monitoring, rating, planning
          } catch (error) {
              console.error("Failed to load current phase:", error)
          }
      }
  function isMonitoringPhase() {
        return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring")
    }

    function isRatingPhase() {
        return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating")
    }

    function isPlanningPhase() {
        return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("planning")
    }

  useEffect(() => {
    filterAssigned();
    console.log(mems)
  }, [mems]);

  useEffect(() => {
    loadCurrentPhase()
    socket.on("user_assigned", filterAssigned);
    socket.on("task_modified", filterAssigned);
    socket.on("department_assigned", filterAssigned);
  }, []);

  return (
    <div
      key={mems.id}
      className="border rounded-3 shadow-sm bg-white mb-3 p-3 d-flex flex-column position-relative"
      style={{
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Colored bar */}
      <div
        className="position-absolute top-0 start-0 rounded-start"
        style={{
          width: "5px",
          height: "100%",
          backgroundImage:
            mems.category?.name === "General"
              ? "linear-gradient(to bottom, #7c9cff, #4a6cf7)"
              : "linear-gradient(to bottom, #f7b267, #ff8c00)",
        }}
      ></div>

      {/* Main content */}
      <div className="ms-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary fs-5">
            task_alt
          </span>
          <h6 className="mb-0 fw-semibold text-truncate">{mems.name}</h6>
          <span className="badge bg-light text-dark border">
            {mems.category?.name || "Uncategorized"}
          </span>
        </div>


        <div className="d-flex flex-wrap gap-3 small m-3">
          <div className="d-flex flex-column">
            <label className="form-label fw-semibold mb-1">
                Description
            </label>
            <div className="text-secondary">             
                {mems.description ?? "N/A"}
            </div>
          </div>
        </div>

        {/* Assigned users + Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
          {/* Assigned Users */}
          <div className="d-flex align-items-center flex-wrap gap-2">
            {assigned.length > 0 ? (
              assigned.map((user) => (
                <div
                  key={user.id}
                  className="rounded-circle border"
                  style={{
                    width: "34px",
                    height: "34px",
                    backgroundImage: `url('${user.profile_picture_link}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              ))
            ) : (
              <span className="text-muted small">No members assigned</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 ms-auto">
            {isPlanningPhase() ? <>
              <button
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  switchMember(mems.id);
                }}
                data-bs-toggle="modal"
                data-bs-target="#user-profile"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  group_add
                </span>
                Assign
              </button>

              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 px-3 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  delete
                </span>
                Remove
              </button>
            </>:
              <small className="text-muted">
                Outputs can only be assigned during Planning Period
              </small>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepartmentTask;
