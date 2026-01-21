import { useEffect, useState } from "react";
import { updateDepartment, getDepartment, archiveDepartment, generateDepartmentPerformanceReport } from "../../services/departmentService";
import DepartmentMemberTable from "./DepartmentMemberTable";
import { objectToFormData, socket } from "../api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import DepartmentTasksTable from "./DepartmentTasksTable";
import DepartmentAssignHead from "./DepartmentAssignHead";
import PerformanceReviews from "./PerformanceReview";
import CreateOPCRModal from "./CreateOPCRModal";
import UserPerformanceInDepartment from "../Charts/UserPerformanceInDepartment";
import { getSettings } from "../../services/settingsService";
import TaskWeights from "./Tasks/TaskWeights";
import FormulaSettings from "./Tasks/TaskFormulas";

function DepartmentInfo({ id, firstLoad, loadDepts }) {
  const [deptInfo, setDeptinfo] = useState({});
  const [managerInfo, setManagerInfo] = useState(null);
  const [formData, setFormData] = useState({ department_name: "", icon: "" });
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [currentPhase, setCurrentPhase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false)

  async function loadCurrentPhase() {
    try {
      const res = await getSettings();
      let phase = res?.data?.data?.current_phase;
      // normalize to an array so we can support multiple active phases
      if (!phase) {
        phase = [];
      } else if (!Array.isArray(phase)) {
        phase = [phase];
      }
      console.log("Current phase(s):", phase);
      setCurrentPhase(phase);
    } catch (error) {
      console.error("Failed to load current phase:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDepartmentInfo(deptId) {
    try {
      const res = await getDepartment(deptId).then((data) => data.data);
      setDeptinfo(res);
      setManagerInfo(res.users.find((u) => u.role === "head" || u.role === "president") || null);
      setFormData({ id: deptId, department_name: res.name, icon: res.icon });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load department info", "error");
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

  const handleDataChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      loadDepts();
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
      Modal.getInstance(document.getElementById("archive-department"))?.hide();
      firstLoad();
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

  function getPhaseInfos() {
    const infos = [];
    if (isPlanningPhase())
      infos.push({ key: "planning", label: "Planning Phase", shortLabel: "Planning", color: "info", icon: "calendar_month" });
    if (isMonitoringPhase())
      infos.push({ key: "monitoring", label: "Monitoring Phase", shortLabel: "Monitoring", color: "warning", icon: "timeline" });
    if (isRatingPhase())
      infos.push({ key: "rating", label: "Rating Phase", shortLabel: "Rating", color: "success", icon: "star_rate" });

    if (infos.length === 0) infos.push({ key: "inactive", label: "Inactive", shortLabel: "Inactive", color: "secondary", icon: "block" });
    return infos;
  }

  const phaseInfos = getPhaseInfos();

  // Determine available tabs based on phase
  const getTabs = () => {
    const allTabs = [
      { label: "Performance Reviews", index: 0, icon: "assessment", phases: ["planning","monitoring", "rating"] },
      { label: "Tasks", index: 1, icon: "task_alt", phases: ["planning", "monitoring", "rating"] },
      { label: "Weights", index: 2, icon: "weight", phases: ["planning", "monitoring", "rating"] },
      { label: "Members", index: 3, icon: "group", phases: ["planning", "monitoring", "rating"] },
    ];

    return allTabs.filter((tab) => tab.phases.some((phase) => currentPhase?.includes(phase)));
  };

  // ensure a sensible default tab is selected when phase changes
  useEffect(() => {
    const tabs = getTabs();
    if (!tabs || tabs.length === 0) return;
    // if currentPage is not in available tabs, select the first available tab
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

  return (
    <>
      {/* Modals */}
      <CreateOPCRModal deptid={id} />

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

      <div className="modal fade" id="assign-head" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Assign Office Head</h5>
              <button type="button" className="btn-close " data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <DepartmentAssignHead dept_id={id} />
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="edit-department" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Office Info</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
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
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmission}>
                {submitting ? <span className="spinner-border spinner-border-sm"></span> : "Update Office"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-fluid py-3 overflow-auto bg-light">
        
        {/* Phase Banner */}
        <div className="alert alert-soft-primary d-flex justify-content-between align-items-center mb-4 border-0 rounded-3 shadow-sm" 
          style={{ backgroundColor: `#e7f1ff`, borderLeft: `5px solid #0d6efd` }}>
          <div className="d-flex align-items-center justify-content-center gap-3">
            <div className={`rounded-circle p-3 ${phaseInfos.length === 1 ? `bg-${phaseInfos[0].color}` : 'bg-primary'}`} style={{ width: 50, height: 50 }}>
              <span className="material-symbols-outlined text-white d-flex align-items-center justify-content-center" 
                style={{ fontSize: 24 }}>{phaseInfos.length === 1 ? phaseInfos[0].icon : 'layers'}</span>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">Current Phase{phaseInfos.length > 1 ? 's' : ''}</h6>
              <p className="mb-0 text-muted small">{phaseInfos.length === 1 ? phaseInfos[0].label : 'Multiple phases active'}</p>
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {phaseInfos.map((p) => (
              <span key={p.key} className={`badge bg-${p.color} me-1`}>{p.shortLabel}</span>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div
          className="rounded-4 shadow-sm mb-4 position-relative overflow-hidden"
          style={{
            backgroundImage: `url('${import.meta.env.BASE_URL}nc-splash-new.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "240px",
          }}
        >
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
          <div className="position-relative text-white p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h3 className="fw-bold mb-1">{deptInfo.name || "Loading..."}</h3>
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

            <div className="d-flex gap-2 justify-content-end flex-wrap">
              <button
                className="btn btn-light text-dark fw-semibold d-flex align-items-center gap-1 shadow-sm border-0 px-3 py-2 rounded-pill"
                data-bs-toggle="modal"
                data-bs-target="#assign-head"
              >
                <span className="material-symbols-outlined">person_add</span>
                Assign Head
              </button>

              {!(["College of Computing Studies ", "College of Education ", "College of Hospitality Management", "President's Office"].includes(deptInfo.name)) && (
                <button
                  className="btn btn-primary fw-semibold d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-pill"
                  data-bs-toggle="modal"
                  data-bs-target="#edit-department"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit
                </button>
              )}

              {!(["College of Computing Studies ", "College of Education ", "College of Hospitality Management", "President's Office"].includes(deptInfo.name)) && (
                <button
                  className="btn btn-danger fw-semibold d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-pill"
                  data-bs-toggle="modal"
                  data-bs-target="#archive-department"
                >
                  <span className="material-symbols-outlined">archive</span>
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Phase-aware Tabs */}
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

        {/* Tab Content */}
        <div>

          {currentPage === 0 &&  (
            <PerformanceReviews deptid={id} />
          )}

          {currentPage === 1 && (
            <>
              <div className="alert alert-info d-flex mb-3">
                <span className="material-symbols-outlined me-2">info</span>
                During Planning Phase: Tasks are created and assigned to staff members.
              </div>
              <DepartmentTasksTable id={id} admin_mode={true} currentPhase={currentPhase}/>
            </>
          )}
          
          {currentPage === 2 && (
            <>
              <div className="alert alert-info d-flex mb-3">
                <span className="material-symbols-outlined me-2">info</span>
                During Planning Phase: Tasks are also weighted based on priority, scope and difficulty.
              </div>
              <TaskWeights dept_id={id}></TaskWeights>
            </>
          )}
          

          {currentPage === 3 && (
            <div className="d-grid" style={{display:"grid", backgroundColor:"white"}}>
              <div className="row">
                
                <div className="col-lg-12 col-md-12" >
                  <button className="btn btn-primary d-flex flex-row gap-2" disabled = {downloading} onClick={ async ()=> {
                    setDownloading(true)
                    const link = await generateDepartmentPerformanceReport(id)
                          .then((d) => d.data.download_url)
                          .catch((err) => {
                            Swal.fire("Error", err.response?.data?.error || "Failed to download", "error")
                            setDownloading(false)
                            return null
                          })
                        if (link) window.open(link, "_blank", "noopener,noreferrer")
                    generateDepartmentPerformanceReport(id)
                  setDownloading(false)
                  }}>
                    
                    {downloading ? <span className="spinner-border spinner-border-sm"></span> : <span className="material-symbols-outlined">download</span>}
                    {downloading ? "Generating..." : "Download Office Performance Summary"}
                  </button>
                  <UserPerformanceInDepartment dept_id={id} currentPhase={currentPhase}/>
                </div>
                <div className="col-lg-12 col-md-12">
                  <DepartmentMemberTable deptid={id} currentPhase={currentPhase}/>
                </div>
                
              </div>
              
              
            </div>
          )}
          
          {currentPage === 4 && (
            <div className="d-grid" style={{display:"grid", backgroundColor:"white"}}>
              <FormulaSettings></FormulaSettings>
              
              
            </div>
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
    </>
  );
}

export default DepartmentInfo;
