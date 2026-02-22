import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
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
    console.log(category)
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
    <Accordion
      key={category.id}
      className="border rounded-3 shadow-sm bg-white m-1 p-3 col-lg-12 col-md-12 d-flex flex-column position-relative"
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
      <AccordionSummary>
        <div
        className="position-absolute top-0 start-0 rounded-start"
        style={{
          width: "5px",
          height: "100%",
          backgroundImage:
            category.departments.length == 0
              ? "linear-gradient(to bottom, #7c9cff, #4a6cf7)"
              : "linear-gradient(to bottom, #f7b267, #ff8c00)",
        }}
      ></div>
        <div>
          <h6 className="mb-2 fw-bold text-truncate d-flex gap-2">
            <span className="material-symbols-outlined text-primary fs-5">
              task_alt
            </span>
            {category.name || category.title || "Untitled"}              
          </h6>
          <div className="col-12">
              <label className="form-label fw-semibold mb-1">
                Description
              </label>
              <div className="small text-secondary">
                
                  {category.description ?? "N/A"}
              </div>
            </div>
        </div>
      </AccordionSummary>

      {/* Main content */}
      <AccordionDetails>
        <div className="ms-3">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            

            <div className="flex-grow-1">
              <label className="form-label fw-semibold mb-1">
                Assigned Offices
              </label>
              <small className="text-muted d-block">
                {
                  category.departments.length != 0?

                  category.departments.map((dept) => (
                    <>
                      {dept.department_name}  <br/>
                    </>
                  ))
                  :
                  "No offices assigned."
                }
              </small>
            </div>

            
          </div>

          <div className="row gx-3 gy-2 mt-2">
            

            

            <div className="col-12">
              <label className="form-label fw-semibold mb-1">Assigned</label>
              <div className="d-flex flex-wrap gap-2">
                
                {assigned.length > 0 ? (
                  <AvatarGroup max={6} spacing={"medium"}>
                    {
                      assigned.map((user) => (
                        <Avatar sx={{backgroundColor:"white", boxShadow:"0px 3px 5px #c9c9c9"}} key={user.id} alt={user.first_name[0]} src={user.profile_picture_link}></Avatar>
                      ))
                    }
                  </AvatarGroup>                
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
      </AccordionDetails>
    </Accordion>
  );
}

export default CategoryTask;
