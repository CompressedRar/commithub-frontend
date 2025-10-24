import { useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import { archiveAccount, unarchiveAccount } from "../../services/userService";

function Members({ mems, switchMember }) {
  const [open, setOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const Reactivate = async () => {
    try {
      const res = await unarchiveAccount(mems.id);
      Swal.fire("Success", res.data.message, "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Reactivation failed", "error");
    }
  };

  const handleReactivate = async () => {
    Swal.fire({
      title: "Do you want to reactivate this account?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) Reactivate();
    });

    const modalEl = document.getElementById("user-profile");
    const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
    modal.hide();
    setArchiving(false);
  };

  const handleArch = async () => {
    try {
      const res = await archiveAccount(mems.id);
      Swal.fire("Success", res.data.message, "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Deactivation failed", "error");
    }
  };

  const handleArchive = async () => {
    Swal.fire({
      title: "Do you want to deactivate this account?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) handleArch();
    });

    const modalEl = document.getElementById("user-profile");
    const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
    modal.hide();
    setArchiving(false);
  };

  return (
    <tr key={mems.id} className="align-middle">
      {/* Profile */}
      <td className="d-flex align-items-center gap-2 text-nowrap">
        <div
          className="rounded-circle border flex-shrink-0"
          style={{
            width: "40px",
            height: "40px",
            backgroundImage: `url(${mems.profile_picture_link || "/default-profile.png"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <span className="fw-semibold text-truncate" style={{ maxWidth: "150px" }}>
          {mems.first_name} {mems.last_name}
        </span>
      </td>

      {/* Email */}
      <td className="text-truncate" style={{ maxWidth: "180px" }}>
        <small className="text-muted">{mems.email}</small>
      </td>

      {/* Department */}
      <td className="text-nowrap">{mems.department.name}</td>

      {/* Position */}
      <td className="text-nowrap">{mems.position.name}</td>

      {/* Role */}
      <td className="text-nowrap">{mems.role[0].toUpperCase() + mems.role.slice(1)}</td>

      {/* Status */}
      <td className="text-center">
        {mems.account_status === 0 ? (
          <span className="badge bg-secondary px-3 py-2">Deactivated</span>
        ) : (
          <span className="badge bg-success px-3 py-2">Active</span>
        )}
      </td>

      {/* Created At */}
      <td className="text-nowrap">
        <small className="text-muted">{mems.created_at}</small>
      </td>

      {/* Actions */}
      <td className="text-end position-relative">
        <button
          className="btn btn-sm btn-light border rounded-circle"
          onClick={() => setOpen(!open)}
        >
          <span className="material-symbols-outlined align-middle">more_vert</span>
        </button>

        {/* Dropdown menu (custom controlled) */}
        {open && (
          <div
            className="position-absolute bg-white border rounded-3 shadow-sm mt-2 py-2"
            style={{
                right: 0,
                minWidth: "220px",
                zIndex: 1050,
                padding: "8px 0",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
            }}
            onMouseLeave={() => setOpen(false)}
            >
            <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-secondary"
                onClick={() => switchMember(mems.id)}
                data-bs-toggle="modal"
                data-bs-target="#user-profile"
                style={{
                borderRadius: "8px",
                transition: "background-color 0.2s ease",
                }}
            >
                <span className="material-symbols-outlined fs-5 text-primary">account_circle</span>
                <span>View Profile</span>
            </button>

            <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-secondary"
                onClick={() =>
                mems.account_status === 0 ? handleReactivate() : handleArchive()
                }
                style={{
                borderRadius: "8px",
                transition: "background-color 0.2s ease",
                }}
            >
                <span className="material-symbols-outlined fs-5 text-danger">
                {mems.account_status === 0 ? "person_add" : "person_cancel"}
                </span>
                <span>
                {mems.account_status === 0
                    ? "Reactivate Account"
                    : "Deactivate Account"}
                </span>
            </button>
            </div>

        )}
      </td>
    </tr>
  );
}

export default Members;
