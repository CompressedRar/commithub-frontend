import { useEffect, useState } from "react";

function CategoryTask({ category, onClick, onEdit }) {
  const [assigned, setAssigned] = useState([]);

  function filterAssigned() {
    const iterated = new Set();
    const filtered = [];

    for (const user of category.users || []) {
      if (!iterated.has(user.id)) {
        iterated.add(user.id);
        filtered.push(user);
      }
    }

    setAssigned(filtered);
  }

  useEffect(() => {
    filterAssigned();
  }, [category]);

  return (
    <div
      key={category.id}
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
            category.department === "General"
              ? "linear-gradient(to bottom, #7c9cff, #4a6cf7)"
              : "linear-gradient(to bottom, #f7b267, #ff8c00)",
        }}
      ></div>

      {/* Main content */}
      <div className="ms-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary fs-5">
            folder_open
          </span>
          <h6 className="mb-0 fw-semibold text-truncate">{category.name}</h6>
          <span className="badge bg-light text-dark border">
            {category.department}
          </span>
        </div>


        <div className="d-flex flex-wrap gap-3 small text-secondary mb-3">
          <div>
            <span className="text-muted">Time:</span>{" "}
            <span className="fw-medium">
              {category.time_measurement
                ? category.time_measurement.charAt(0).toUpperCase() +
                  category.time_measurement.slice(1)
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted">Modification:</span>{" "}
            <span className="fw-medium">
              {category.modifications
                ? category.modifications.charAt(0).toUpperCase() +
                  category.modifications.slice(1)
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Assigned users + Button */}
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
              <span className="text-muted small">No users assigned</span>
            )}
          </div>

          {/* Action button */}
          <button
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3 py-1 ms-auto"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(category);
              onClick();
            }}
            data-bs-toggle="modal"
            data-bs-target="#view-task-info"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              edit
            </span>
            Edit Info
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryTask;
