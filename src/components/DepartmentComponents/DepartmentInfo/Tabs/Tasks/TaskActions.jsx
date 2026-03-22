export const TaskActionButton = ({ onClick, icon, label, color = "primary", modalId, className = "" }) => (
  <button
    className={`btn btn-sm btn-outline-${color} d-flex align-items-center gap-2 px-3 py-1 ${className}`}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    data-bs-toggle={modalId ? "modal" : undefined}
    data-bs-target={modalId ? `#${modalId}` : undefined}
  >
    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{icon}</span>
    {label}
  </button>
);