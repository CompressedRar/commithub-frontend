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
      className="category-task-item border rounded p-3 mb-3 shadow-sm d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between"
      
      style={{ cursor: "pointer" }}
    >
      {/* Left-colored bar for department */}
      <div
        className="department-bar me-3 rounded"
        style={{
          width: "6px",
          minHeight: "60px",
          backgroundImage:
            category.department === "General"
              ? "linear-gradient(to bottom, rgb(143, 143, 250), var(--primary-color))"
              : "linear-gradient(to bottom, var(--secondary-color), rgb(255,136,0))",
        }}
      ></div>

      {/* Main info section */}
      <div className="flex-grow-1">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary">
            highlight_mouse_cursor
          </span>
          <h6 className="mb-0 fw-semibold">{category.name}</h6>
          <span className="badge bg-light text-dark ms-2">
            {category.department}
          </span>
        </div>

        <p className="text-muted small mb-2">
          {category.target_accomplishment || "No description provided"}
        </p>

        <div className="d-flex flex-wrap gap-3 small text-secondary">
          <div>
            <strong>Time:</strong>{" "}
            {category.time_measurement
              ? category.time_measurement.charAt(0).toUpperCase() +
                category.time_measurement.slice(1)
              : "N/A"}
          </div>
          <div>
            <strong>Modification:</strong>{" "}
            {category.modifications
              ? category.modifications.charAt(0).toUpperCase() +
                category.modifications.slice(1)
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Assigned Users */}
      <div className="d-flex align-items-center gap-2 mx-3 mt-md-0">
        {assigned.length > 0 ? (
          assigned.map((user) => (
            <div
              key={user.id}
              className="profile-icon rounded-circle"
              style={{
                width: "32px",
                height: "32px",
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

      {/* Action buttons */}
      <div className="mt-3 mt-md-0 d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(category);
            props.onClick()
          }}
          data-bs-toggle="modal"
          data-bs-target="#view-task-info"
        >
          <span className="material-symbols-outlined " style={{ alignItems:"center",fontSize: "18px" }}>
            edit
          </span>
          Edit Info
        </button>

        
      </div>
    </div>
  );
}

export default CategoryTask;
