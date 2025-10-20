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

function HeadDepartmentInfo({ id, firstLoad }) {
  const [deptInfo, setDeptinfo] = useState({});
  const [managerInfo, setManagerInfo] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ department_name: "", icon: "" });
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // === Load Department ===
  async function loadDepartmentInfo(deptId) {
    try {
      const res = await getDepartment(deptId).then((d) => d.data);
      setDeptinfo(res);
      setManagerInfo(res.users.find((u) => u.role === "head") || null);
      setFormData({ id: deptId, department_name: res.name, icon: res.icon });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load office info", "error");
    }
  }

  useEffect(() => {
    loadDepartmentInfo(id);
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

  // === Layout ===
  return (
    <div className="container-fluid py-3 overflow-auto" style={{ maxHeight: "calc(100vh - 110px)" }}>
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


      {/* ─── Stats Cards ──────────────────────────────── */}
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

      {/* ─── Tabs ──────────────────────────────── */}
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

      {/* ─── Content ──────────────────────────────── */}
      <div >
        {currentPage === 0 && (
          <>
            <DepartmentTasksTable id={id} />
            <GeneralTasksTable id={id} />
          </>
        )}
        {currentPage === 1 && (
          <>
            <div className="bg-white p-3 mb-3 rounded shadow-sm">
              <UserPerformanceInDepartment dept_id={id} />
            </div>
            <DepartmentMemberTable deptid={id} admin_mode = {false}/>
          </>
        )}
        {currentPage === 2 && <PerformanceReviews deptid={id} />}
      </div>
    </div>
  );
}

export default HeadDepartmentInfo;
