import { useEffect, useState } from "react";
import { updateDepartment, getDepartment, archiveDepartment } from "../../services/departmentService";
import DepartmentMemberTable from "./DepartmentMemberTable";
import { objectToFormData, socket } from "../api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import DepartmentTasksTable from "./DepartmentTasksTable";
import DepartmentAssignHead from "./DepartmentAssignHead";
import PerformanceReviews from "./PerformanceReview";
import CreateOPCRModal from "./CreateOPCRModal";
import GeneralTasksTable from "./GeneralTasksTable";
import UserPerformanceInDepartment from "../Charts/UserPerformanceInDepartment";
import { getSettings } from "../../services/settingsService";

function HeadDepartmentInfo({ id, firstLoad }) {
  const [deptInfo, setDeptinfo] = useState({});
  const [managerInfo, setManagerInfo] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ department_name: "", icon: "" });
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [currentPhase, setCurrentPhase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCurrentPhase() {
    try {
      const res = await getSettings();
      const phase = res?.data?.data?.current_phase;
      console.log("Current phase:", phase);
      setCurrentPhase(phase);
    } catch (error) {
      console.error("Failed to load current phase:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // === Load Department ===
  async function loadDepartmentInfo(deptId) {
    try {
      const res = await getDepartment(deptId).then((d) => d.data);
      setDeptinfo(res);
      setManagerInfo(res.users.find((u) => u.role === "head" || u.role === "president" || u.role === "administrator") || null);
      setFormData({ id: deptId, department_name: res.name, icon: res.icon });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load office info", "error");
    }
  }

  useEffect(() => {
    loadDepartmentInfo(id);
    loadCurrentPhase();
  }, [id]);

  useEffect(() => {
    socket.on("department", () => loadDepartmentInfo(id));
    return () => socket.off("department");
  }, [id]);

  const handleDataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmission = async () => {
    if (!formData.department_name) {
      Swal.fire("Error", "Office name is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateDepartment(objectToFormData(formData));
      Swal.fire(
        res.data.message.includes("successfully") ? "Success" : "Error",
        res.data.message,
        res.data.message.includes("successfully") ? "success" : "error"
      );
      loadDepartmentInfo(id);
      Modal.getInstance(document.getElementById("edit-department"))?.hide();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to update office", "error");
    }
    setSubmitting(false);
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await archiveDepartment(id);
      Swal.fire(
        res.data.message.includes("successfully") ? "Success" : "Error",
        res.data.message,
        res.data.message.includes("successfully") ? "success" : "error"
      );
      firstLoad();
      Modal.getInstance(document.getElementById("archive-department"))?.hide();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to archive office", "error");
    }
    setArchiving(false);
  };

  function isMonitoringPhase() {
    
    return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring");
  }

  function isRatingPhase() {
    
    return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating");
  }

  function isPlanningPhase() {
    
    return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("planning");
  }

  function getPhaseLabel() {
    if (isPlanningPhase()) return { label: "Planning Phase", color: "info", icon: "calendar_month" };
    if (isMonitoringPhase()) return { label: "Monitoring Phase", color: "warning", icon: "timeline" };
    if (isRatingPhase()) return { label: "Rating Phase", color: "success", icon: "star_rate" };
    return { label: "Inactive", color: "secondary", icon: "block" };
  }

  const phaseInfo = getPhaseLabel();

  // Determine available tabs based on phase
  const getTabs = () => {
    const allTabs = [
      { label: "Performance Reviews", index: 0, icon: "assessment", phases: ["monitoring", "rating"] },
      { label: "Outputs", index: 1, icon: "task_alt", phases: ["planning", "monitoring", "rating"] },
      { label: "Members", index: 2, icon: "group", phases: ["planning", "monitoring", "rating"] },
    ];

    return allTabs.filter((tab) => tab.phases.some((phase) => currentPhase?.includes(phase)));
  };

  // set default visible tab when phase is loaded/changed
  useEffect(() => {
    const tabs = getTabs();
    if (!tabs || tabs.length === 0) return;
    const availableIndexes = tabs.map((t) => t.index);
    if (!availableIndexes.includes(currentPage)) {
      setCurrentPage(tabs[0].index);
    }
  }, [currentPhase]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // === Layout ===
  return (
    <div className="container-fluid py-3 overflow-auto bg-light" style={{ maxHeight: "calc(100vh - 110px)" }}>
      <CreateOPCRModal deptid={id} />

      {/* ─── Modals ──────────────────────────────── */}
      {/* Archive Modal */}
      <div className="modal fade" id="archive-department" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Archive Office</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">Are you sure you want to archive this office?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-danger" onClick={handleArchive}>
                {archiving ? <span className="spinner-border spinner-border-sm"></span> : "Archive Office"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Head Modal */}
      <div className="modal fade" id="assign-head" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Assign Office Head</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <DepartmentAssignHead dept_id={id} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <div className="modal fade" id="edit-department" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Office Info</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Office Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleDataChange}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmission}>
                {submitting ? <span className="spinner-border spinner-border-sm"></span> : "Update Office"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Banner */}
      <div className="alert alert-soft-primary d-flex justify-content-between align-items-center mb-4 border-0 rounded-3 shadow-sm" 
        style={{ backgroundColor: `#e7f1ff`, borderLeft: `5px solid #0d6efd` }}>
        <div className="d-flex align-items-center justify-content-center gap-3">
          <div className={`rounded-circle p-3 bg-${phaseInfo.color}`} style={{ width: 50, height: 50 }}>
            <span className="material-symbols-outlined text-white d-flex align-items-center justify-content-center" 
              style={{ fontSize: 24 }}>{phaseInfo.icon}</span>
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark">Current Phase</h6>
            <p className="mb-0 text-muted small">{phaseInfo.label}</p>
          </div>
        </div>
        {isPlanningPhase() && (
          <span className="badge bg-info">Plan outputs and assign to staff</span>
        )}
        {isMonitoringPhase() && (
          <span className="badge bg-warning">Monitor progress and actual accomplishments</span>
        )}
        {isRatingPhase() && (
          <span className="badge bg-success">Rate performance and consolidate results</span>
        )}
      </div>

      {/* ─── Header / Banner ──────────────────────────────── */}
      <div
        className="rounded-4 shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}nc-splash-new.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "240px",
        }}
      >
        {/* Dark overlay for contrast */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>

        {/* Foreground content */}
        <div className="position-relative text-white p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <h3 className="fw-bold mb-1 text-shadow-sm">{deptInfo.name || "Loading..."}</h3>
            <p className="mb-0">
              Office Head:{" "}
              {managerInfo ? (
                <span className="fw-semibold text-info">
                  {managerInfo.first_name + " " + managerInfo.last_name}
                </span>
              ) : (
                <span className="text-warning">None</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3 border-bottom">
        <ul className="nav nav-tabs">
          {getTabs().map((tab) => (
            <li className="nav-item" key={tab.index}>
              <button
                onClick={() => setCurrentPage(tab.index)}
                className="nav-link border-0 d-flex align-items-center gap-2"
                style={{
                  borderBottom: currentPage === tab.index ? "3px solid #0d6efd" : "3px solid transparent",
                  color: currentPage === tab.index ? "#0d6efd" : "#6c757d",
                  fontWeight: currentPage === tab.index ? "600" : "400",
                  backgroundColor: "transparent",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ─── Content ──────────────────────────────── */}
      <div>
          {currentPage === 1 && isPlanningPhase() && (
            <>
              <div className="alert alert-info d-flex mb-3">
                <span className="material-symbols-outlined me-2">info</span>
                During Planning Phase: Outputs are created and assigned to staff members.
              </div>
              <DepartmentTasksTable id={id} admin_mode={false} currentPhase = {currentPhase} />
              <GeneralTasksTable id={id}  currentPhase = {currentPhase}/>
            </>
          )}

          {currentPage === 1 && isMonitoringPhase() && (
             <>
               <DepartmentTasksTable id={id} admin_mode={false}  currentPhase = {currentPhase}/>
               <GeneralTasksTable id={id}  currentPhase = {currentPhase}/>
             </>
           )}

           {currentPage === 2 && (
             <>
               <div className="bg-white p-3 mb-3 rounded shadow-sm">
                 <UserPerformanceInDepartment dept_id={id} />
               </div>
               <DepartmentMemberTable deptid={id} />
             </>
           )}

          {currentPage === 0 && (isMonitoringPhase() || isRatingPhase()) && (
            <PerformanceReviews deptid={id} />
          )}

          {/* Empty state when tab not available */}
          {getTabs().length === 0 && (
            <div className="text-center py-5 text-muted">
              <span className="material-symbols-outlined fs-1 mb-2 d-block">lock</span>
              <h5>No Tabs Available</h5>
             <p>Check back when the phase changes.</p>
           </div>
          )}
         </div>
       </div>
   );
}

export default HeadDepartmentInfo;
