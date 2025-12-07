import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  assignUsers,
  getAssignedUsers,
  getDepartmentMembers,
  getGeneralAssignedUsers,
  unAssignUsers,
} from "../../services/departmentService";
import { socket } from "../api";
import { getMainTask } from "../../services/taskService";
import { Modal } from "bootstrap";

function GeneralAssignTask(props) {
  const [members, setMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [archiving, setArchiving] = useState(false);
  const [mainTask, setMainTask] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignedQuantity, setAssignedQuantity] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function loadAssignedMembers() {
    try {
      const res = await getGeneralAssignedUsers(props.task_id);
      setAssignedMembers(res.data);
      console.log("GENERAL assigned members:", res.data);
    } catch (error) {
      console.error(error.response?.data?.error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load assigned users.",
        icon: "error",
      });
    }
  }

  async function loadMembers() {
    try {
      const res = await getDepartmentMembers(props.dept_id, 0, 100);
      setMembers(res.data);
      console.log("department members:", res.data);
    } catch (error) {
      console.error(error.response?.data?.error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load department members.",
        icon: "error",
      });
    }
  }

  async function loadMainTask() {
    try {
      const res = await getMainTask(props.task_id);
      setMainTask(res.data);
    } catch (error) {
      console.error("Failed to load main task:", error);
    }
  }

  function checkIfAssigned(user_id) {
    return assignedMembers.some((i) => i.id === user_id);
  }

  async function AssignUser(userid, quantity) {
    try {
      const res = await assignUsers(userid, props.task_id, quantity);
      Swal.fire({
        title: res.data.message.includes("successfully") ? "Success" : "Error",
        text: res.data.message,
        icon: res.data.message.includes("successfully") ? "success" : "error",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "An error occurred.",
        icon: "error",
      });
    }
    await loadMembers();
    await loadAssignedMembers();
  }

  function openAssignModal(user) {
    setSelectedUser(user);
    setAssignedQuantity(mainTask?.target_quantity || 0);
    const modal = new Modal(document.getElementById("general-assign-quantity-modal"));
    modal.show();
  }

  async function handleConfirmAssign() {
    if (!selectedUser) return;

    if (!assignedQuantity || assignedQuantity <= 0) {
      Swal.fire({
        title: "Validation Error",
        text: "Please enter a valid quantity.",
        icon: "warning",
      });
      return;
    }

    if (assignedQuantity > (mainTask?.target_quantity || 0)) {
      Swal.fire({
        title: "Validation Error",
        text: `Assigned quantity cannot exceed target quantity (${mainTask?.target_quantity}).`,
        icon: "warning",
      });
      return;
    }

    setSubmitting(true);
    await AssignUser(selectedUser.id, assignedQuantity);
    setSubmitting(false);

    // Close modal
    const modal = Modal.getInstance(document.getElementById("general-assign-quantity-modal"));
    if (modal) modal.hide();

    // Reset form
    setSelectedUser(null);
    setAssignedQuantity(0);
  }

  async function UnassignUser(userid) {
    try {
      const res = await unAssignUsers(userid, props.task_id);
      Swal.fire({
        title: res.data.message.includes("successfully") ? "Success" : "Error",
        text: res.data.message,
        icon: res.data.message.includes("successfully") ? "success" : "error",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "An error occurred.",
        icon: "error",
      });
    }
    await loadMembers();
    await loadAssignedMembers();
  }

  async function handleUnassign(userid) {
    Swal.fire({
      title: "Remove this output from user?",
      text: "Note: Removing this output will erase this user's corresponding data from all IPCRs.",
      icon: "warning",
      showDenyButton: true,
      confirmButtonText: "Yes, remove it",
      denyButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    }).then(async (result) => {
      if (result.isConfirmed) {
        UnassignUser(userid);
      }
    });
    setArchiving(false);
  }

  function isMonitoringPhase() {
    
    return props.currentPhase && Array.isArray(props.currentPhase) && props.currentPhase.includes("monitoring");
  }

  function isRatingPhase() {
    
    return props.currentPhase && Array.isArray(props.currentPhase) && props.currentPhase.includes("rating");
  }

  function isPlanningPhase() {
    console.log("Current Phase in deptassign:", props.currentPhase && Array.isArray(props.currentPhase) && props.currentPhase.includes("planning"));
    
    return props.currentPhase && Array.isArray(props.currentPhase) && props.currentPhase.includes("planning");
  }

  useEffect(() => {
    loadAssignedMembers();
    loadMembers();
    loadMainTask();

    socket.on("user_assigned", () => {
      loadMembers();
      loadAssignedMembers();
    });

    socket.on("user_unassigned", () => {
      loadMembers();
      loadAssignedMembers();
    });

    return () => {
      socket.off("user_assigned");
      socket.off("user_unassigned");
    };
  }, []);

  return (
    <>
      <div className="assign-task-container py-2">
        {members.length === 0 ? (
          <div className="text-center text-muted py-5">
            <span className="material-symbols-outlined fs-1 mb-2">group_off</span>
            <div>No members found in this office.</div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="card border-0 shadow-sm px-3 py-2"
                style={{
                  borderRadius: "8px",
                  minHeight: "60px",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  {/* Left side (Profile + Info) */}
                  <div className="d-flex align-items-center">
                    <img
                      src={member.profile_picture_link}
                      alt="profile"
                      className="rounded-circle me-3 border"
                      style={{
                        width: "45px",
                        height: "45px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="d-flex flex-column lh-sm">
                      <span className="fw-semibold small">
                        {member.first_name} {member.last_name}
                      </span>
                      <span className="text-muted xsmall">
                        {member.department_name}
                      </span>
                    </div>
                  </div>

                  {/* Right side (Buttons) */}
                  {
                    
                      checkIfAssigned(member.id) ? (
                        
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2 py-1"
                          onClick={() => handleUnassign(member.id)}
                          disabled={!isPlanningPhase()}                          
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                          >
                            remove
                          </span>
                          Remove
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 px-2 py-1"
                          onClick={() => openAssignModal(member)}
                          disabled={!isPlanningPhase()}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                          >
                            add
                          </span>
                          Assign
                        </button>
                      )
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Quantity Modal */}
      <div
        className="modal fade"
        id="general-assign-quantity-modal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="generalAssignQuantityLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg border-0 rounded-3">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-semibold" id="generalAssignQuantityLabel">
                <span className="material-symbols-outlined me-2 align-middle">check_circle</span>
                Assign Output Quantity
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">User</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <span className="material-symbols-outlined">person</span>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    value={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ""}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Assigned Quantity <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <span className="material-symbols-outlined">counter_5</span>
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={mainTask?.target_quantity || 0}
                    value={assignedQuantity}
                    onChange={(e) => setAssignedQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
                <small className="text-muted d-block mt-2">
                  Target Quantity: <strong>{mainTask?.target_quantity || 0}</strong>
                </small>
              </div>

              <div className="alert alert-info d-flex gap-2 align-items-start mb-0">
                <span className="material-symbols-outlined flex-shrink-0 mt-1">info</span>
                <div className="small">
                  <strong>Note:</strong> The assigned quantity should not exceed the target quantity of {mainTask?.target_quantity || 0}.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary d-flex gap-2 align-items-center"
                onClick={handleConfirmAssign}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Assigning...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">done</span>
                    Confirm Assign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GeneralAssignTask;
