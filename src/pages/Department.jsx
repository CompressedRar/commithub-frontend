import { useEffect, useState } from "react";
import { getDepartments, registerDepartment } from "../services/departmentService";
import DepartmentInfo from "../components/DepartmentComponents/DepartmentInfo";
import { objectToFormData } from "../components/api";
import Swal from "sweetalert2";

function Department() {
  const [departments, setDepartments] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [formData, setFormData] = useState({ department_name: "", icon: "" });
  const [submitting, setSubmitting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // mobile collapsible toggle

  async function loadAllDepartments() {
    try {
      const res = await getDepartments();
      setDepartments(res.data);

      if (res.data.length > 0 && !currentDepartment) {
        setCurrentDepartment(res.data[0].id);
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to load departments", "error");
    }
  }

  async function handleSubmission() {
    const newFormData = objectToFormData(formData);
    setSubmitting(true);
    try {
      const res = await registerDepartment(newFormData);
      if (res.data.message === "Office successfully created.") {
        Swal.fire("Success", res.data.message, "success");
        await loadAllDepartments();
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to create office", "error");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadAllDepartments();
  }, []);

  const availableIcons = [
    "computer", "auto_stories", "flights_and_hotels", "checkbook",
    "account_balance", "local_library", "school", "psychology",
    "supervisor_account", "domain",
  ];

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Create Office Modal */}
      <div
        className="modal fade"
        id="add-department"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="addDeptLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold" id="addDeptLabel">
                Create Office
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="department_name" className="form-label fw-semibold">
                  Office Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="department_name"
                  className="form-control"
                  placeholder="e.g. Computing Studies"
                  onInput={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Choose Icon <span className="text-danger">*</span>
                </label>
                <div className="d-flex flex-wrap gap-3">
                  {availableIcons.map((icon) => (
                    <div key={icon} className="text-center">
                      <input
                        type="radio"
                        className="btn-check"
                        name="icon"
                        id={icon}
                        value={icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      />
                      <label
                        className={`btn btn-outline-primary d-flex flex-column align-items-center p-2 rounded-3 ${
                          formData.icon === icon ? "active" : ""
                        }`}
                        htmlFor={icon}
                        style={{ width: "65px", height: "65px" }}
                      >
                        <span className="material-symbols-outlined fs-3">{icon}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleSubmission}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="material-symbols-outlined spin">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">add</span> Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Toggle */}
      <div className="d-lg-none mb-3">
        <button
            className="btn btn-primary w-100 d-flex justify-content-between align-items-center"
            onClick={() => setMobileOpen(!mobileOpen)}
        >
            <span>Offices</span>
            <span className="material-symbols-outlined">
            {mobileOpen ? "expand_less" : "expand_more"}
            </span>
        </button>

        {mobileOpen && (
            <div className="bg-white border rounded-3 mt-2 p-3">
            {departments.length > 0 ? (
                departments.map((dept) => (
                <div
                    key={dept.id}
                    className={`card mb-2 p-2 cursor-pointer ${
                    currentDepartment === dept.id ? "border-primary" : "border"
                    }`}
                    onClick={() => {
                    setCurrentDepartment(dept.id);
                    setMobileOpen(false); // auto-collapse after selecting
                    }}
                >
                    <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">{dept.icon || "apartment"}</span>
                    <span className="fw-semibold">{dept.name}</span>
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center text-muted py-2">No offices created yet.</div>
            )}
            </div>
        )}

        {/* Mobile Info Panel */}
        {currentDepartment && (
            <div className="bg-white rounded-4 border p-4 mt-3">
            <DepartmentInfo key={currentDepartment} id={currentDepartment} loadDepts={loadAllDepartments} />
            </div>
        )}
        </div>

      {/* Desktop 2-Column Layout */}
      <div className="row g-4 d-none d-lg-flex">
        <div className="col-4">
          <div className="bg-white rounded-4 border p-4 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-semibold mb-0">
                <span className="material-symbols-outlined align-middle me-2 text-primary">domain</span>
                Offices
              </h4>
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-department">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <div
                    key={dept.id}
                    className={`card mb-2 p-3 cursor-pointer ${
                      currentDepartment === dept.id ? "border-primary" : "border"
                    }`}
                    onClick={() => setCurrentDepartment(dept.id)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="material-symbols-outlined text-primary">{dept.icon || "apartment"}</span>
                      <span className="fw-semibold">{dept.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-5">No offices created yet.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-8" id="department-info-panel">
          {currentDepartment ? (
            <div className="bg-white rounded-4 border p-4 h-100">
              <DepartmentInfo key={currentDepartment} id={currentDepartment} loadDepts={loadAllDepartments} />
            </div>
          ) : (
            <div className="bg-white rounded-4 border p-4 h-100 d-flex align-items-center justify-content-center text-muted">
              Select an office to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Department;
