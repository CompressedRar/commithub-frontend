import { useEffect, useState } from "react";
import {
  assignUsers,
  getAssignedUsers,
  getDepartmentMembers,
  unAssignUsers,
} from "../../services/departmentService";

import Swal from "sweetalert2";
import { socket } from "../api";
import { getMainTask } from "../../services/taskService";
import { Modal } from "bootstrap";

function DepartmentAssignTask(props) {
  const [members, setMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);

  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [archiving, setArchiving] = useState(false);
  const [mainTask, setMainTask] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  
  const [assignedQuantity, setAssignedQuantity] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function loadAssignedMembers() {
    try {
      const res = await getAssignedUsers(props.dept_id, props.task_id);

      console.log(res.data)
      setAssignedMembers(res.data);
      setCurrentMembers(res.data);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load assigned members.",
        icon: "error",
      });
    }
  }

  async function loadMembers() {
    try {
      const res = await getDepartmentMembers(props.dept_id, 0, 100);
      setMembers(res.data);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load members.",
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
    return assignedMembers.some((m) => m.id === user_id);
  }

  function  getAssignedQuantity(user_id) {
    
    var res = assignedMembers.filter((m) => m.id === user_id)
    
    return res.length == 1 ? res[0] : null;
  }

  async function AssignUser(userid, quantity) {
    try {
      const res = await assignUsers(userid, props.task_id, quantity);
      const msg = res.data.message;

      Swal.fire({
        title: msg.includes("successfully") ? "Success" : "Error",
        text: msg,
        icon: msg.includes("successfully") ? "success" : "error",
      });

      // Reload data after successful assignment
      loadAssignedMembers();
      loadMembers();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Assignment failed.",
        icon: "error",
      });
    }
  }

  async function handleAssign() {
    if (!selectedUser) {
      Swal.fire("No user selected", "Please select a user.", "warning");
      return;
    }

    if (assignedQuantity <= 0) {
      Swal.fire("Invalid quantity", "Enter a valid quantity.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await assignUsers(selectedUser.id, props.task_id, assignedQuantity);

      Swal.fire("Success", "User assigned successfully.", "success");

      setSelectedUser(null);
      setAssignedQuantity(0);

      loadAssignedMembers();
      loadMembers();
    } catch (err) {
      Swal.fire("Error", "Assignment failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }


  function openAssignModal(user) {
    setSelectedUser(user);
    setAssignedQuantity(mainTask?.target_quantity || 0);    
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
    const modal = Modal.getInstance(document.getElementById("assign-quantity-modal"));
    if (modal) modal.hide();

    // Reset form
    setSelectedUser(null);
    setAssignedQuantity(0);
  }

  async function handleUnassign(userid) {
    Swal.fire({
      title: "Remove output from this user?",
      text: "Note: Removing this output will erase this user's corresponding data from all IPCRs.",
      icon: "warning",
      showDenyButton: true,
      confirmButtonText: "Yes, remove it",
      denyButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await unAssignUsers(selectedUser.id, props.task_id);
          const msg = res.data.message;

          Swal.fire({
            title: msg.includes("successfully") ? "Success" : "Error",
            text: msg,
            icon: msg.includes("successfully") ? "success" : "error",
          });

          loadAssignedMembers();
          loadMembers();
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.response?.data?.error || "Unassignment failed.",
            icon: "error",
          });
        }
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

  
  async function handleBulkAssign() {
    if (selectedUserIds.length === 0) {
      Swal.fire("No users selected", "Please select at least one user.", "warning");
      return;
    }

    if (assignedQuantity <= 0) {
      Swal.fire("Invalid quantity", "Enter a valid quantity.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await Promise.all(
        selectedUserIds.map(userId =>
          assignUsers(userId, props.task_id, assignedQuantity)
        )
      );

      Swal.fire("Success", "Users assigned successfully.", "success");

      loadAssignedMembers();
      loadMembers();
    } catch (err) {
      Swal.fire("Error", "Assignment failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkUnassign() {
    const toRemove = assignedMembers
      .map(m => m.id)
      .filter(id => !selectedUserIds.includes(id));

    if (toRemove.length === 0) return;

    await Promise.all(
      toRemove.map(id => unAssignUsers(id, props.task_id))
    );
  }

  /*function toggleUser(userId) {
    //if (!isPlanningPhase()) return;

    console.log("TROGGLING")

    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }*/

  function selectUser(member) {
    //if (!isPlanningPhase()) return;
    console.log(member)
    setSelectedUser(prev =>
      prev?.id === member.id ? null : member
    );

    var res = getAssignedQuantity(member.id)
    if(res) {
      
      setAssignedQuantity(res?.assigned_quantity || 0);
    }
    else {
      setAssignedQuantity(mainTask?.target_quantity || 0);
    }

  }





  useEffect(() => {
    loadAssignedMembers();
    loadMembers();
    loadMainTask();
    console.log("Current Phase in deptassign:", isPlanningPhase());

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
      <div className="container py-2">
        {members.length === 0 ? (
          <div className="text-center text-muted py-5">
            <span className="material-symbols-outlined fs-1 mb-2">group_off</span>
            <div>No members found in this office.</div>
          </div>
        ) : (
          
          <div className="d-grid">

            <div className="row">
              
              <div className="col-7 card d-flex gap-2">
                {members.map((member) => (

                  <label
                  key={member.id}
                  className={`px-3 py-2 border rounded ${
                    selectedUser?.id === member.id
                      ? "border-primary bg-light"
                      : "border-secondary"
                  }`}
                  style={{ minHeight: "60px", cursor: "pointer" }}
                  
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={member.profile_picture_link}
                        alt="profile"
                        className="rounded-circle border me-3"
                        style={{ width: "45px", height: "45px", objectFit: "cover" }}
                      />
                      <div className="d-flex flex-column lh-sm">
                        <span className="fw-semibold small">
                          {member.first_name} {member.last_name}
                        </span>
                        <span className="text-muted xsmall">
                          {member.position.name}
                        </span>
                      </div>
                        {checkIfAssigned(member.id) && 
                        <div className="badge rounded-pill bg-primary mx-2">
                          Assigned
                        </div>
                      }
                    </div>

                    <input
                      type="radio"
                      checked={selectedUser?.id === member.id}
                      onChange={() => {
                        selectUser(member)
                        console.log(getAssignedQuantity(member.id))
                      }}
                      className="d-none"
                      readOnly
                    />
                  </div>
                </label>


                ))}
              </div>

              <div className="col-5 card ">
                {
                  selectedUser ? 
                  <>
                  <div className="">
                    <h5 className=" fw-semibold" id="assignQuantityLabel">
                      <span className="material-symbols-outlined me-2 align-middle">check_circle</span>
                      Assign Quantity
                    </h5>
                </div>

                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    

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
                    {
                      checkIfAssigned(selectedUser.id) &&
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        disabled={!isPlanningPhase() || !selectedUser || submitting}
                        onClick={handleUnassign}
                      >
                        Remove
                      </button>
                    }
                    <button
                      className="btn btn-primary"
                      onClick={handleAssign}
                      disabled={!isPlanningPhase() || !selectedUser || submitting}
                    >
                      Assign
                    </button>


                  </div></>:
                  <div className="d-flex justify-content-center align-items-center">
                    <span className="text-muted">Choose a member to assign.</span>
                  </div>
                }
              </div>


            </div>
          </div>




        )}
      </div>

      {/* Assign Quantity Modal */}
      <div
        className="modal fade"
        id="assign-quantity-modal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="assignQuantityLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg border-0 rounded-3">
            
          </div>
        </div>
      </div>
    </>
  );
}

export default DepartmentAssignTask;
