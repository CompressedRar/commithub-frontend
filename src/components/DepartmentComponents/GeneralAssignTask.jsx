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

function GeneralAssignTask(props) {
  const [members, setMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [archiving, setArchiving] = useState(false);

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

  function checkIfAssigned(user_id) {
    return assignedMembers.some((i) => i.id === user_id);
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

  async function AssignUser(userid) {
    try {
      const res = await assignUsers(userid, props.task_id);
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

  async function handleAssign(userid) {
    Swal.fire({
      title: "Do you want to assign this member?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
      icon: "question",
    }).then(async (result) => {
      if (result.isConfirmed) {
        AssignUser(userid);
      }
    });
    setArchiving(false);
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
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
      icon: "warning",
    }).then(async (result) => {
      if (result.isConfirmed) {
        UnassignUser(userid);
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
    <div className="assign-task-container">
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
                {checkIfAssigned(member.id) ? (
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2 py-1"
                    onClick={() => handleUnassign(member.id)}
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
                    onClick={() => handleAssign(member.id)}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px" }}
                    >
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

export default GeneralAssignTask;
