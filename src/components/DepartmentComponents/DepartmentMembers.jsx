import { useState } from "react";
import Swal from "sweetalert2";
import { removeUserFromDepartment } from "../../services/departmentService";

function DepartmentMembers({ mems }) {
  const [open, setOpen] = useState(false);

  // Handle member removal
  const handleRemoval = async () => {
    Swal.fire({
      title: "Remove member from this office?",
      text: `${mems.first_name} ${mems.last_name} will lose access to this office.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await removeUserFromDepartment(mems.id);
          Swal.fire("Removed", res.data.message, "success");
        } catch (error) {
          Swal.fire("Error", error.response?.data?.error || "Failed to remove member", "error");
        }
      }
    });
  };

  // Determine performance label and style
  const getPerformanceBadge = () => {
    const rating = mems.avg_performance;
    if (rating === 5)
      return <span className="badge bg-success px-3 py-2">OUTSTANDING</span>;
    if (rating >= 4)
      return <span className="badge bg-primary px-3 py-2">VERY SATISFACTORY</span>;
    if (rating >= 3)
      return <span className="badge bg-info text-dark px-3 py-2">SATISFACTORY</span>;
    if (rating >= 2)
      return <span className="badge bg-warning text-dark px-3 py-2">UNSATISFACTORY</span>;
    if (rating >= 1)
      return <span className="badge bg-danger px-3 py-2">POOR</span>;
    return <span className="badge bg-secondary px-3 py-2">UNRATED</span>;
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

      {/* Performance */}

      <td className="text-nowrap">{parseFloat(mems.avg_performance).toFixed(2)}</td>
      <td className="text-nowrap">{getPerformanceBadge()}</td>

      {/* Email */}

      {/* Position */}
      <td className="text-nowrap">{mems.position.name}</td>

      {/* Tasks Count */}

      {/* Status */}

      {/* Actions (Dropdown) */}
      <td className="text-end position-relative">
        <button
          className="btn btn-sm btn-light border rounded-circle"
          onClick={() => setOpen(!open)}
        >
          <span className="material-symbols-outlined align-middle">more_vert</span>
        </button>

        {open && (
          <div
            className="position-absolute bg-white border rounded-3 shadow-sm mt-2 py-2"
            style={{
              right: 0,
              minWidth: "220px",
              zIndex: 1050,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
            }}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-secondary"
              style={{
                borderRadius: "8px",
                transition: "background-color 0.2s ease",
              }}
              onClick={() => handleRemoval()}
            >
              <span className="material-symbols-outlined fs-5 text-danger">
                group_remove
              </span>
              <span>Remove Member</span>
            </button>

            {/* Example placeholder options (optional) */}
            {/* <button
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-secondary"
            >
              <span className="material-symbols-outlined fs-5 text-primary">
                visibility
              </span>
              <span>View Profile</span>
            </button> */}
          </div>
        )}
      </td>
    </tr>
  );
}

export default DepartmentMembers;
