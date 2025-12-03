// ...existing code...
import { useEffect, useRef, useState } from "react";
import { objectToFormData, socket } from "../api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import { archiveCategory, getCategory, updateCategory } from "../../services/categoryService";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { getDepartments } from "../../services/departmentService";
import { convert_tense } from "../../services/tenseConverted";
import CategoryTask from "./CategoryTask";
import CategoryTaskAverages from "../Charts/CategoryTaskAverage";
import CategoryPerformanceCharts from "../Charts/CategoryPerformance";

import { createMainTask } from "../../services/taskService";

function CategoryTasks(props) {
  const [categoryTasks, setCategoryTasks] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState({});

  const [formData, setFormData] = useState({
    category_name: "",
    id: props.id,
  });

  const [updateData, setUpdateData] = useState({
    category_name: "",
    id: props.id,
  });

  const [submitting, setSubmission] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [titleEditable, setTitleEditable] = useState(false);
  const [pastTense, setPastTense] = useState("");
  const [translating, setTranslating] = useState(false);
  const [requireDocument, setRequireDocument] = useState(false);

  const [isEmpty, setEmpty] = useState(true);

  const titleRef = useRef(null);

  // --- API Loaders
  async function loadDepartments() {
    try {
      const res = await getDepartments().then((data) => data.data);
      setAllDepartments(res);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCategoryTasks(id) {
    if (id == null) return;
    setEmpty(false);
    try {
      const res = await getCategory(id).then((d) => d.data);
      setCategoryInfo(res);
      setCategoryTasks(res.main_tasks || []);
      setFormData({
        task_name: "",
        department: "0",
        task_desc: "",
        time_measurement: "minute",
        modification: "correction",
        accomplishment_editable: 0,
        time_editable: 0,
        modification_editable: 0,
        id,
      });
      setUpdateData({ title: res.name, id });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.response?.data?.error || "Failed to load category", "error");
    }
  }

  // --- Effects
  useEffect(() => {
    loadCategoryTasks(props.id);
    loadDepartments();

    const reload = () => {
      loadCategoryTasks(props.id);
      loadDepartments();
    };

    socket.on("category", reload);
    socket.on("main_task", reload);
    return () => {
      socket.off("category", reload);
      socket.off("main_task", reload);
    };
  }, [props.id]);

  useEffect(() => {
    if (!pastTense) return;
    const deb = setTimeout(async () => {
      setTranslating(true);
      try {
        const converted_tense = await convert_tense(String(pastTense));
        setFormData((f) => ({ ...f, past_task_desc: converted_tense }));
      } catch {
        Swal.fire("Error", "There is an error while processing description.", "error");
      } finally {
        setTranslating(false);
      }
    }, 500);
    return () => clearTimeout(deb);
  }, [pastTense]);

  // --- Handlers
  const handleDataChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleTitleChange = (e) => {
    setUpdateData((prev) => ({ ...prev, [e.target.id]: e.target.textContent }));
  };

  const handleArch = async () => {
    try {
      const a = await archiveCategory(props.id);
      const msg = a.data?.message;
      if (msg === "Key Result Area successfully archived.") {
        Swal.fire("Success", msg, "success");
        props.reloadAll?.();
      } else Swal.fire("Error", msg || "Failed to archive", "error");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.response?.data?.error || "Archive failed", "error");
    }
  };

  const handleArchive = () => {
    Swal.fire({
      title: "Do you want to archive this Key Result Area?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then(async (r) => r.isConfirmed && (await handleArch()));
  };

  const handleUpdate = async () => {
    try {
      const a = await updateCategory(updateData);
      const msg = a.data?.message;
      if (msg === "Key Result Area updated.") {
        Swal.fire("Success", msg, "success");
        props.reloadAll?.();
      } else Swal.fire("Error", msg || "Update failed", "error");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.response?.data?.error || "Update failed", "error");
    }
  };

  const openModal = () => {
    const modal = new Modal(document.getElementById("add-task"));
    modal.show();
  };

  const closeModal = () => {
    const modal = Modal.getInstance(document.getElementById("add-task"));
    if (modal) modal.hide();
  };

  const handleSubmission = async () => {
    setSubmission(true);
    let converted_tense = "";

    try {
      converted_tense = await convert_tense(String(pastTense));
    } catch {
      Swal.fire("Error", "There is an error while processing description.", "error");
      setSubmission(false);
      return;
    }

    const newFormData = objectToFormData(formData);
    newFormData.append("past_task_desc", converted_tense);

    if (!formData.task_name || !formData.task_desc) {
      Swal.fire("Error", "Please fill all required fields", "error");
      setSubmission(false);
      return;
    }

    try {
      const a = await createMainTask(newFormData);
      const msg = a.data?.message;
      msg === "Output successfully created."
        ? Swal.fire("Success", msg, "success")
        : Swal.fire("Error", msg || "Failed to create", "error");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to create output", "error");
    } finally {
      setSubmission(false);
    }

    await loadCategoryTasks(props.id);
    closeModal();
  };

  // --- Utilities
  const requiredCount = categoryTasks.filter((t) => t.required_documents).length;
  const completedCount = categoryTasks.filter((t) => t.required_documents && t.status === 1).length;

  // --- Render (no cards; clean panels + list)
  return (
    <div
      className="category-main-container container-fluid py-3"
      style={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        paddingBottom: "2.5rem",
        position: "relative",
      }}
    >
      {isEmpty && (
        <div className="mb-3 p-4 bg-light border rounded-3">
          <div className="d-flex align-items-start gap-3">
            <span className="material-symbols-outlined fs-2 text-muted">info</span>
            <div>
              <h5 className="mb-1">No MFO Data</h5>
              <p className="mb-0 text-muted">There are no information about this major final output.</p>
            </div>
          </div>
        </div>
      )}

      {/* TOP: title + actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div style={{ minWidth: 220 }}>
            <h4
              ref={titleRef}
              id="title"
              contentEditable={titleEditable}
              suppressContentEditableWarning={true}
              onInput={handleTitleChange}
              className={`mb-0 fw-semibold d-flex align-items-center gap-2 ${titleEditable ? "border border-primary bg-white rounded px-2 py-1" : "text-primary"}`}
              style={{ outline: "none", cursor: titleEditable ? "text" : "default" }}
            >
              <span className="material-symbols-outlined">folder</span>
              <span>{categoryInfo?.name || "Category"}</span>
            </h4>
            <small className="text-muted d-block">{categoryInfo?.description}</small>
          </div>

          {titleEditable ? (
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-success d-flex align-items-center gap-1" onClick={() => { handleUpdate(); setTitleEditable(false); }}>
                <span className="material-symbols-outlined">check</span> Save
              </button>
              <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => { setTitleEditable(false); loadCategoryTasks(props.id); }}>
                <span className="material-symbols-outlined">close</span> Cancel
              </button>
            </div>
          ) : (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setTitleEditable(true); setTimeout(() => titleRef.current?.focus(), 50); }}>
              <span className="material-symbols-outlined">edit</span>
            </button>
          )}
        </div>

        <div className="d-flex gap-2 align-items-center">
          

          <button className="btn btn-outline-danger d-flex gap-2 align-items-center" onClick={handleArchive}>
            <span className="material-symbols-outlined me-1">archive</span> Archive
          </button>
          <button className="btn btn-primary d-flex gap-2 align-items-center" onClick={openModal}>
            <span className="material-symbols-outlined me-1">add</span> Create Output
          </button>
        </div>
      </div>

      {/* METRICS + CHART AREA (plain panels) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-4">
          <div className="p-3 bg-white border rounded-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="mb-0 fw-semibold">Category Summary</h6>
                <small className="text-muted">Quick metrics</small>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3 flex-wrap">
              <div className="p-3 bg-light rounded-2 text-center" style={{ minWidth: 100 }}>
                <div className="fw-bold">{categoryTasks.length}</div>
                <small className="text-muted d-block">Outputs</small>
              </div>

              <div className="p-3 bg-light rounded-2 text-center" style={{ minWidth: 100 }}>
                <div className="fw-bold">{parseFloat(categoryInfo?.average_score ?? 0).toFixed(2)}</div>
                <small className="text-muted d-block">Avg Rating</small>
              </div>
            </div>

            <div className="mt-3">
              <CategoryTaskAverages cat_id={props.id} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="p-3 bg-white border rounded-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="mb-0 fw-semibold">Performance</h6>
                <small className="text-muted">Trend charts</small>
              </div>
            </div>

            <div className="mt-2">
              <CategoryPerformanceCharts categoryId={props.id} />
            </div>
          </div>
        </div>
      </div>

      {/* TASKS LIST (no cards) */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Outputs</h5>
          <small className="text-muted">{categoryTasks?.length ?? 0} items</small>
        </div>

        {(!Array.isArray(categoryTasks) || categoryTasks.length === 0) ? (
          <div className="py-5 text-center text-muted border rounded-3 bg-light">
            <span className="material-symbols-outlined fs-1 d-block mb-2">playlist_remove</span>
            <div>There are no existing outputs.</div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {categoryTasks
              .filter((t) => t?.status === 1)
              .map((task) => (
                <CategoryTask
                  key={task.id}
                  category={task}
                  onClick={() => {
                    // open view modal (parent expects changeTaskID)
                    props.changeTaskID(task.id);
                  }}
                  onEdit={(cat) => {
                    // populate form for editing and open modal
                    setFormData((f) => ({
                      ...f,
                      task_name: cat.title ?? f.task_name,
                      department: cat.department_id ?? cat.department ?? f.department,
                      task_desc: cat.task_desc ?? f.task_desc,
                      time_measurement: cat.time_measurement ?? f.time_measurement,
                      modification: cat.modification ?? f.modification,
                      id: cat.id ?? f.id,
                    }));
                    openModal();
                  }}
                />
              ))}
          </div>
        )}
      </div>

      {/* MODAL (Create Output) - keep modal content but without inner card */}
      <div
        className="modal fade"
        id="add-task"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="createTaskLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow-lg border-0 rounded-3">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-semibold">
                <span className="material-symbols-outlined me-2 align-middle">add_task</span>
                Create Output
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body px-4 py-3">
              <form noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Output <span className="text-danger">*</span></label>
                  <input type="text" name="task_name" className="form-control"
                    placeholder="e.g., Board Trustees Meeting" onInput={handleDataChange} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Office <span className="text-danger">*</span></label>
                  <select name="department" className="form-select" onChange={handleDataChange}>
                    <option value={0}>General</option>
                    {allDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <h6 className="mt-3">Success Indicators (Targets + Measures)</h6>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Quantity</label>
                  <textarea name="task_desc" className="form-control" rows={5}
                    placeholder="Describe the measurable aspect of the output..."
                    onInput={(e) => {
                      handleDataChange(e);
                      setPastTense(e.target.value);
                    }} required />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Timeliness</label>
                    <select name="time_measurement" className="form-select" onChange={handleDataChange}>
                      {["minute","hour","day","week","month","semester","year"].map((t)=>(<option key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</option>))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Efficiency</label>
                    <select name="modification" className="form-select" onChange={handleDataChange}>
                      <option value="correction">Correction</option>
                      <option value="revision">Revision</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Require Supporting Document</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="requireDocToggle"
                        checked={requireDocument}
                        onChange={() => setRequireDocument(!requireDocument)}
                        style={{ cursor: "pointer", width: "3rem", height: "1.5rem" }}
                      />
                      <label className="form-check-label ms-2" htmlFor="requireDocToggle">
                        {requireDocument ? "Yes, required" : "No, optional"}
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer d-flex justify-content-between">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button type="button" className="btn btn-primary px-4" onClick={handleSubmission} disabled={submitting}>
                {submitting || translating ? (
                  <span className="material-symbols-outlined spin me-2 align-middle">progress_activity</span>
                ) : (
                  <span className="me-2 align-middle material-symbols-outlined">add_circle</span>
                )}
                {submitting ? "Processing..." : "Create Output"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryTasks;
// ...existing code...