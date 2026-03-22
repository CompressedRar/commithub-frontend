import { useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";

// ── helpers ────────────────────────────────────────────────────────────────

const GRADIENT_ASSIGNED = "linear-gradient(to bottom, #f7b267, #ff8c00)";
const GRADIENT_DEFAULT  = "linear-gradient(to bottom, #7c9cff, #4a6cf7)";

// ── sub-components ─────────────────────────────────────────────────────────

function AssignedAvatars({ users }) {
  // Deduplicate by user id — useMemo, not useEffect + setState
  const unique = useMemo(() => {
    const seen = new Set();
    return (users ?? []).filter(({ id }) => (seen.has(id) ? false : seen.add(id)));
  }, [users]);

  if (unique.length === 0) {
    return <span className="text-muted small">No users assigned</span>;
  }

  return (
    <AvatarGroup max={6} spacing="medium">
      {unique.map((user) => (
        <Avatar
          key={user.id}
          alt={user.first_name?.[0]}
          src={user.profile_picture_link}
          sx={{ backgroundColor: "white", boxShadow: "0px 3px 5px #c9c9c9" }}
        />
      ))}
    </AvatarGroup>
  );
}

function DepartmentList({ departments }) {
  if (!departments?.length) {
    return <small className="text-muted">No offices assigned.</small>;
  }

  return (
    <small className="text-muted d-block">
      {departments.map((dept) => (
        <span key={dept.id ?? dept.department_name} className="d-block">
          {dept.department_name}
        </span>
      ))}
    </small>
  );
}

// ── hover styles (stable reference outside component to avoid re-creation) ─

const HOVER_ON  = { boxShadow: "0 6px 12px rgba(0,0,0,0.08)", transform: "translateY(-2px)" };
const HOVER_OFF = { boxShadow: "0 2px 6px rgba(0,0,0,0.05)", transform: "translateY(0)" };

const applyStyle = (el, styles) => Object.assign(el.style, styles);

// ── main component ─────────────────────────────────────────────────────────

function CategoryTask({ category = {}, onClick }) {
  const hasDepartments = category.departments?.length > 0;
  const accentGradient = hasDepartments ? GRADIENT_ASSIGNED : GRADIENT_DEFAULT;
  const title = category.name ?? category.title ?? "Untitled";

  return (
    <Accordion
      className="border rounded-3 shadow-sm bg-white m-1 p-3 col-lg-12 col-md-12 d-flex flex-column position-relative"
      style={{ cursor: "pointer", transition: "box-shadow 0.2s ease, transform 0.2s ease" }}
      onMouseEnter={(e) => applyStyle(e.currentTarget, HOVER_ON)}
      onMouseLeave={(e) => applyStyle(e.currentTarget, HOVER_OFF)}
    >
      <AccordionSummary>
        {/* Accent bar */}
        <div
          className="position-absolute top-0 start-0 rounded-start"
          style={{ width: 5, height: "100%", backgroundImage: accentGradient }}
        />

        <div>
          <h6 className="mb-2 fw-bold text-truncate d-flex gap-2">
            <span className="material-symbols-outlined text-primary fs-5">task_alt</span>
            {title}
          </h6>

          <div className="col-12">
            <label className="form-label fw-semibold mb-1">Description</label>
            <div className="small text-secondary">{category.description ?? "N/A"}</div>
          </div>
        </div>
      </AccordionSummary>

      <AccordionDetails>
        <div className="ms-3">
          {/* Offices */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <div className="flex-grow-1">
              <label className="form-label fw-semibold mb-1">Assigned Offices</label>
              <DepartmentList departments={category.departments} />
            </div>
          </div>

          {/* Assigned users */}
          <div className="row gx-3 gy-2 mt-2">
            <div className="col-12">
              <label className="form-label fw-semibold mb-1">Assigned</label>
              <div className="d-flex flex-wrap gap-2">
                <AssignedAvatars users={category.users} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button
              className="d-flex btn btn-sm btn-outline-secondary"
              onClick={(e) => { e.stopPropagation(); onClick?.(category); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                open_in_new
              </span>
              <span className="ms-1 d-none d-md-inline">Open</span>
            </button>
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
}

export default CategoryTask;
