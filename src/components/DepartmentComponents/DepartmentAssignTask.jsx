import { useEffect, useState } from "react";
import {
  assignUsers,
  getAssignedUsers,
  getDepartmentMembers,
  unAssignUsers,
} from "../../services/departmentService";
import Swal from "sweetalert2";
import { socket } from "../api";

function DepartmentAssignTask(props) {
  const [members, setMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [archiving, setArchiving] = useState(false);

  async function loadAssignedMembers() {
    try {
      const res = await getAssignedUsers(props.dept_id, props.task_id);
      setAssignedMembers(res.data);
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

  function checkIfAssigned(user_id) {
    return assignedMembers.some((m) => m.id === user_id);
  }

  async function AssignUser(userid) {
    try {
      const res = await assignUsers(userid, props.task_id);
      const msg = res.data.message;

      Swal.fire({
        title: msg.includes("successfully") ? "Success" : "Error",
        text: msg,
        icon: msg.includes("successfully") ? "success" : "error",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Assignment failed.",
        icon: "error",
      });
    }
  }

  async function handleAssign(userid) {
    Swal.fire({
      title: "Assign this task to the user?",
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await AssignUser(userid);
      }
    });
    setArchiving(false);
  }

  async function UnassignUser(userid) {
    try {
      const res = await unAssignUsers(userid, props.task_id);
      const msg = res.data.message;

      Swal.fire({
        title: msg.includes("successfully") ? "Success" : "Error",
        text: msg,
        icon: msg.includes("successfully") ? "success" : "error",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Unassignment failed.",
        icon: "error",
      });
    }
  }

  async function handleUnassign(userid) {
    Swal.fire({
      title: "Remove task from this user?",
      text: "Note: Removing this task will erase this user's corresponding data from all IPCRs.",
      icon: "warning",
      showDenyButton: true,
      confirmButtonText: "Yes, remove it",
      denyButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await UnassignUser(userid);
      }
    });
    setArchiving(false);
  }

  useEffect(() => {
    loadAssignedMembers();
    loadMembers();

    socket.on("user_assigned", () => {
      loadMembers();
      loadAssignedMembers();
    });

    socket.on("user_unassigned", () => {
      loadMembers();
      loadAssignedMembers();
    });

  }, []);

  return (
    <div className="container py-2">
  {members.length === 0 ? (
    <div className="text-center text-muted py-5">
      <span className="material-symbols-outlined fs-1 mb-2">group_off</span>
      <div>No members found in this department.</div>
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

            {checkIfAssigned(member.id) ? (
              <button
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2 py-1"
                onClick={() => handleUnassign(member.id)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  remove
                </span>
                Remove
              </button>
            ) : (
              <button
                className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 px-2 py-1"
                onClick={() => handleAssign(member.id)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  add
                </span>
                Assign
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

  );
}

export default DepartmentAssignTask;
