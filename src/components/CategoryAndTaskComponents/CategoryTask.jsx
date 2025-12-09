import { useEffect, useState } from "react";

function CategoryTask({ category = {}, onClick, onEdit }) {
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

  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div
      key={category.id}
      className="border rounded-3 shadow-sm bg-white mb-3 p-3 d-flex flex-column position-relative"
      style={{
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onClick={() => onClick?.(category)}
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
            task_alt
          </span>

          <div className="flex-grow-1">
            <h6 className="mb-0 fw-semibold text-truncate">
              {category.name || category.title || "Untitled"}
            </h6>
            <small className="text-muted d-block">
              {category.type || category.department || ""}
            </small>
          </div>

          <div className="text-end">
            <small className="text-muted d-block">Created</small>
            <small className="fw-semibold d-block">
              {formatDate(category.created_at)}
            </small>
          </div>
        </div>

        <div className="row gx-3 gy-2 mt-2">
          <div className="col-12">
            <label className="form-label small text-muted mb-1">
              Description
            </label>
            <div className="small text-secondary">
              
                {category.summary?.actual ?? category.actual_accomplishment ?? "N/A"}
            </div>
          </div>

          <div className="col-6">
            <label className="form-label small text-muted mb-1">
              Target Quantity
            </label>
            <div className="fw-medium">
              {category.target_quantity ?? category.summary?.target ?? "N/A"}
            </div>
          </div>

          

          <div className="col-6">
            <label className="form-label small text-muted mb-1">
              Target Efficiency
            </label>
            <div className="fw-medium">
              {category.target_efficiency ?? "N/A"}
            </div>
          </div>

          <div className="col-6">
            <label className="form-label small text-muted mb-1">
              Modification
            </label>
            <div className="fw-medium">
              {category.modification ||
                category.modifications ||
                category.description?.alterations ||
                "N/A"}
            </div>
          </div>

          <div className="col-6">
            <label className="form-label small text-muted mb-1">
              Timeliness Mode
            </label>
            <div className="fw-medium">
              {(category.timeliness_mode ||
                category.description?.timeliness_mode ||
                "timeframe").toString()}
            </div>
          </div>

          {(category.timeliness_mode || category.description?.timeliness_mode) ===
          "timeframe" ? (
            <>
              <div className="col-6">
                <label className="form-label small text-muted mb-1">
                  Timeframe
                </label>
                <div className="fw-medium">
                  {category.target_timeframe ??
                    category.working_days?.target ??
                    "N/A"}{" "}
                  {category.time_measurement || category.description?.time || ""}
                </div>
              </div>
            </>
          ) : (
            <div className="col-6">
              <label className="form-label small text-muted mb-1">
                Target Deadline
              </label>
              <div className="fw-medium">
                {category.target_deadline
                  ? formatDate(category.target_deadline)
                  : "N/A"}
              </div>
            </div>
          )}

          <div className="col-12">
            <label className="form-label small text-muted mb-1">Assigned</label>
            <div className="d-flex flex-wrap gap-2">
              {assigned.length > 0 ? (
                assigned.map((user) => (
                  <div key={user.id} className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle border"
                      style={{
                        width: "34px",
                        height: "34px",
                        backgroundImage: `url('${
                          user.profile_picture_link || user.avatar || ""
                        }')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      title={`${user.first_name || ""} ${user.last_name || ""}`}
                    />
                    <div className="small text-secondary">
                      {user.first_name
                        ? `${user.first_name} ${user.last_name || ""}`
                        : user.name || user.email}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-muted small">No users assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="d-flex gap-2 justify-content-end mt-3">        
          <button
            className="d-flex btn btn-sm btn-outline-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(category);
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              open_in_new
            </span>
            <span className="ms-1 d-none d-md-inline">Open</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryTask;
