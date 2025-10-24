import { useEffect, useState } from "react";
import "../assets/styles/CategoryAndTask.css";
import { getCategories, registerCategory } from "../services/categoryService";
import { objectToFormData } from "../components/api";
import CategoryTasks from "../components/CategoryAndTaskComponents/CategoryTasks";
import TaskInfo from "../components/CategoryAndTaskComponents/TaskInfo";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";

function CategoryAndTask() {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ category_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTaskID, setCurrentTaskID] = useState(null);

  async function loadCategories() {
    try {
      const res = await getCategories();
      setCategories(res.data);
      if (res.data.length > 0 && !currentCategory) {
        setCurrentCategory(res.data[0].id);
      }
      return res.data;
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to load categories", "error");
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmission = async () => {
    const convertedData = objectToFormData(formData);
    setSubmitting(true);
    try {
      const res = await registerCategory(convertedData);
      if (res.data.message === "Key Area Result created.") {
        Swal.fire("Success", res.data.message, "success");
      } else {
        Swal.fire("Error", res.data.message, "error");
      }

      const modalEl = document.getElementById("add-category");
      const modal = Modal.getOrCreateInstance(modalEl);
      modal.hide();

      // Cleanup leftover backdrop if any
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to create category", "error");
    } finally {
      setSubmitting(false);
      loadCategories();
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Create Category Modal */}
      <div
        className="modal fade"
        id="add-category"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="addCategoryLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title" id="addCategoryLabel">
                Create Key Result Area
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="category_name" className="form-label fw-semibold">
                  Key Result Area <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="category_name"
                  name="category_name"
                  className="form-control"
                  placeholder="Eg. Research Services"
                  onInput={handleDataChange}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleSubmission} disabled={submitting}>
                {submitting ? <span className="material-symbols-outlined spin">progress_activity</span> : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Info Modal */}
      <div
        className="modal fade"
        id="view-task-info"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="taskInfoLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title" id="taskInfoLabel">
                Output Information
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {currentTaskID && (
                <TaskInfo
                  id={currentTaskID}
                  key={currentTaskID}
                  backAfterArchive={() => setCurrentCategory(categories[0]?.id)}
                  backToPage={() => setCurrentCategory(currentCategory)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible */}
      <div className="d-lg-none mb-3">
        <button
          className="btn btn-primary w-100 d-flex justify-content-between align-items-center"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span>Key Result Areas</span>
          <span className="material-symbols-outlined">{mobileOpen ? "expand_less" : "expand_more"}</span>
        </button>

        {mobileOpen && (
          <div className="bg-white border rounded-3 mt-2 p-3">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`card mb-2 p-2 cursor-pointer ${currentCategory === cat.id ? "border-primary" : "border"}`}
                  onClick={() => {
                    setCurrentCategory(cat.id);
                    setMobileOpen(false);
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">checklist</span>
                    <span className="fw-semibold">{cat.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-2">No key result areas created yet.</div>
            )}
          </div>
        )}

        {currentCategory && (
          <div className="bg-white rounded-4 border p-4 mt-3">
            <CategoryTasks
              id={currentCategory}
              key={currentCategory}
              changeTaskID={(id) => setCurrentTaskID(id)}
              reloadAll={loadCategories}
              reloadCategory={(id) => setCurrentCategory(id)}
            />
          </div>
        )}
      </div>

      {/* Desktop 2-Column Layout */}
      <div className="row g-4 d-none d-lg-flex">
        <div className="col-4">
          <div className="bg-white rounded-4 border p-4 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-semibold mb-0">
                <span className="material-symbols-outlined align-middle me-2 text-primary">category</span>
                Key Result Areas
              </h4>
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-category">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`card mb-2 p-3 cursor-pointer ${currentCategory === cat.id ? "border-primary" : "border"}`}
                    onClick={() => setCurrentCategory(cat.id)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="material-symbols-outlined text-primary">checklist</span>
                      <span className="fw-semibold">{cat.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-5">No key result areas created yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-8">
          {currentCategory ? (
            <div className="bg-white rounded-4 border p-4 h-100">
              <CategoryTasks
                id={currentCategory}
                key={currentCategory}
                changeTaskID={(id) => setCurrentTaskID(id)}
                reloadAll={loadCategories}
                reloadCategory={(id) => setCurrentCategory(id)}
              />
            </div>
          ) : (
            <div className="bg-white rounded-4 border p-4 h-100 d-flex align-items-center justify-content-center text-muted">
              Select a key result area to view tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryAndTask;
