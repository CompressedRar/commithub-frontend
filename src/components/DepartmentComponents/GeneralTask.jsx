import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { removeTask } from "../../services/departmentService"
import { socket } from "../api"

function GeneralTask({ mems, switchMember }) {
  const [assigned, setAssigned] = useState([])

  // Filter assigned members to remove duplicates
  function filterAssigned() {
    const seen = new Set()
    const filtered = []

    for (const user of mems.users || []) {
      if (!seen.has(user.id)) {
        seen.add(user.id)
        filtered.push(user)
      }
    }

    setAssigned(filtered)
    console.log("refresh new users")
  }

  const handleRemove = async () => {
    Swal.fire({
      title: "Do you want to remove this task?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await removeTask(mems.id)
          const msg = res.data.message
          Swal.fire({
            title: msg.includes("successfully") ? "Success" : "Error",
            text: msg,
            icon: msg.includes("successfully") ? "success" : "error",
          })
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.response?.data?.error || "An error occurred.",
            icon: "error",
          })
        }
      }
    })
  }

  useEffect(() => {
    filterAssigned()

    

  }, [mems])

  useEffect(()=> {
    socket.on("user_assigned", filterAssigned);
    socket.on("task_modified", filterAssigned);
    socket.on("department_assigned", filterAssigned);

  })


  return (
    <div
      key={mems.id}
      className="general-task-item border rounded p-3 mb-3 shadow-sm d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between bg-white"
      style={{ cursor: "pointer" }}
    >
      {/* Left colored bar */}
      <div
        className="me-3 rounded"
        style={{
          width: "6px",
          minHeight: "60px",
          backgroundImage:
            "linear-gradient(to bottom, rgb(108, 99, 255), rgb(0, 175, 255))",
        }}
      ></div>

      {/* Main info */}
      <div className="flex-grow-1">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary">task_alt</span>
          <h6 className="mb-0 fw-semibold">{mems.name}</h6>
          <span className="badge bg-light text-dark ms-2">
            {mems.category?.name || "Uncategorized"}
          </span>
        </div>


        <div className="d-flex flex-wrap gap-3 small text-secondary">
          <div>
             <strong>Target:</strong> {mems.target_accomplishment || "N/A"}
          </div>
          <div>
            <strong>Actual:</strong>
          {mems.actual_accomplishment || "N/A"}
          </div>
        </div>
      </div>

      {/* Assigned Users */}
      <div className="d-flex align-items-center gap-2 mx-3 mt-3 mt-md-0">
        {assigned.length > 0 ? (
          assigned.map((user) => (
            <div
              key={user.id}
              className="rounded-circle border"
              style={{
                width: "32px",
                height: "32px",
                backgroundImage: `url(${user.profile_picture_link})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          ))
        ) : (
          <span className="text-muted small">No users assigned</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 mt-md-0 d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
          onClick={(e) => {
            e.stopPropagation()
            switchMember(mems.id)
          }}
          data-bs-toggle="modal"
          data-bs-target="#general-user-profile"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            person_add
          </span>
          Assign
        </button>

        
      </div>
    </div>
  )
}

export default GeneralTask
