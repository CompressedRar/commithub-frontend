import { useState } from "react";


export default function AssignedDepartment({info}){
    const [assigned, setAssigned] = useState([]);
      const [currentPhase, setCurrentPhase] = useState(null) //monitoring, rating, planning
    
      
    
      
    
      
    
    
      return (
        <div
          key={info.id}
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
                info.category?.name === "General"
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
              <h6 className="mb-0 fw-semibold text-truncate">{info.name}</h6>
              <span className="badge bg-light text-dark border">
                {info.category?.name || "Uncategorized"}
              </span>
            </div>
    
    
            <div className="d-flex flex-wrap gap-3 small m-3">
              <div className="d-flex flex-column">
                <label className="form-label fw-semibold mb-1">
                    Description
                </label>
                <div className="text-secondary">             
                    {info.description ?? "N/A"}
                </div>
              </div>
            </div>
    
            {/* Assigned users + Buttons */}
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
                  <span className="text-muted small">No members assigned</span>
                )}
              </div>
    
            </div>
          </div>
        </div>
      );


}