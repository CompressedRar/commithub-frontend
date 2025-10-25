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

function DepartmentInfo({ id, firstLoad, loadDepts }) {
  const [deptInfo, setDeptinfo] = useState({});
  const [managerInfo, setManagerInfo] = useState(null);
  const [formData, setFormData] = useState({ department_name: "", icon: "" });
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  async function loadDepartmentInfo(deptId) {
    try {
      const res = await getDepartment(deptId).then((data) => data.data);
      setDeptinfo(res);
      setManagerInfo(res.users.find((u) => u.role === "head") || null);
      setFormData({ id: deptId, department_name: res.name, icon: res.icon });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load department info", "error");
    }
  }

  useEffect(() => {
    loadDepartmentInfo(id);
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

  return (
    <>
      {/* ✅ ─── Modals moved OUTSIDE the scrollable container ─── */}
      <CreateOPCRModal deptid={id} />

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
      <div className="modal fade" id="assign-head" aria-hidden="true">
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

      {/* Edit Department Modal */}
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

      {/* ✅ ─── Scrollable Container starts here ─── */}
      <div className="container-fluid py-3 overflow-auto bg-light" style={{ maxHeight: "calc(100vh - 110px)" }}>
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
              <button
                className="btn btn-primary fw-semibold d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-pill"
                data-bs-toggle="modal"
                data-bs-target="#edit-department"
              >
                <span className="material-symbols-outlined">edit</span>
                Edit
              </button>
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

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { icon: "assignment_globe", label: "OPCR", value: deptInfo.opcr_count },
            { icon: "article_person", label: "IPCR", value: deptInfo.ipcr_count },
            { icon: "group", label: "Members", value: deptInfo.user_count },
            { icon: "task", label: "Outputs", value: deptInfo.main_tasks_count },
          ].map((stat, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="card text-center h-100 border-0 shadow-sm">
                <div className="card-body">
                  <span className="material-symbols-outlined text-primary fs-2">{stat.icon}</span>
                  <h4 className="fw-bold mt-2">{stat.value || 0}</h4>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3 border-bottom">
          {["Outputs", "Members", "Performance Reviews"].map((label, index) => (
            <li className="nav-item" key={index}>
              <button
                onClick={() => setCurrentPage(index)}
                className="nav-link border-0"
                style={{
                  borderBottom: currentPage === index ? "3px solid #0d6efd" : "3px solid transparent",
                  color: currentPage === index ? "#0d6efd" : "#6c757d",
                  fontWeight: currentPage === index ? "600" : "400",
                  backgroundColor: "transparent",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div>
          {currentPage === 0 && (
            <>
              <DepartmentTasksTable id={id} admin_mode={true} />
              <GeneralTasksTable id={id} />
            </>
          )}
          {currentPage === 1 && (
            <>
              <div className="bg-white p-3 mb-3 rounded shadow-sm">
                <UserPerformanceInDepartment dept_id={id} />
              </div>
              <DepartmentMemberTable deptid={id} />
            </>
          )}
          {currentPage === 2 && <PerformanceReviews deptid={id} />}
        </div>
      </div>
    </>
  );
}

export default DepartmentInfo;
