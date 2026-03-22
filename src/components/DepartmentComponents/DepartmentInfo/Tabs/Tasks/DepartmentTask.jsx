import { useTaskLogic } from "./hooks/useTaskLogic";
import { TaskActionButton } from "./TaskActions";

function DepartmentTask({ mems, dept_id, switchMember, switchInfo }) {
  const { assignedUsers, settings, isPlanningPhase, handleRemove } = useTaskLogic(mems, dept_id);

  const categoryGradient = mems.category?.name === "General"
    ? "linear-gradient(to bottom, #7c9cff, #4a6cf7)"
    : "linear-gradient(to bottom, #f7b267, #ff8c00)";

  return (
    <div
      className="border rounded-3 shadow-sm bg-white mb-3 p-3 d-flex flex-column position-relative task-card"
      style={{ cursor: "pointer", transition: "all 0.2s ease" }}
    >
      {/* Left Accent Bar */}
      <div 
        className="position-absolute top-0 start-0 rounded-start" 
        style={{ width: "5px", height: "100%", backgroundImage: categoryGradient }} 
      />

      <div className="ms-3">
        {/* Title and Category */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary fs-5">task_alt</span>
          <h6 className="mb-0 fw-semibold text-truncate">{mems.name}</h6>
          <span className="badge bg-light text-dark border">
            {mems.category?.name || "Uncategorized"}
          </span>
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="small fw-bold text-uppercase text-muted mb-1 d-block">Description</label>
          <div className="small text-secondary">{mems.description ?? "No description provided."}</div>
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          {/* Assigned Avatars */}
          <div className="d-flex align-items-center flex-wrap gap-1">
            {assignedUsers.length > 0 ? (
              assignedUsers.map((user) => (
                <div
                  key={user.id}
                  title={user.full_name}
                  className="rounded-circle border"
                  style={{
                    width: "32px", height: "32px",
                    backgroundImage: `url('${user.profile_picture_link}')`,
                    backgroundSize: "cover", backgroundPosition: "center"
                  }}
                />
              ))
            ) : (
              <span className="text-muted small italic">No members assigned</span>
            )}
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 ms-auto">
            {isPlanningPhase ? (
              <>
              
                {settings?.enable_formula && (
                  <TaskActionButton 
                    label="Formulas" icon="function" modalId="formulas"
                    onClick={() => { switchMember(mems.id); switchInfo(); }} 
                  />
                )}
                <TaskActionButton 
                  label="Assign" icon="group_add" modalId="user-profile"
                  onClick={() => switchMember(mems.id)} 
                />
                <TaskActionButton 
                  label="Remove" icon="delete" color="danger"
                  onClick={handleRemove} 
                />
              </>
            ) : (
              <small className="text-muted bg-light px-2 py-1 rounded">
                Read-only: Planning period closed
              </small>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .task-card:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.08) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export default DepartmentTask;