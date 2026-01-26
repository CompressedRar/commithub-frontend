// ...existing code...
import { useEffect, useMemo, useState } from "react";
import "../assets/styles/CategoryAndTask.css";
import { getCategories, registerCategory, updateCategoryOrder } from "../services/categoryService";
import { objectToFormData, socket } from "../components/api";
import CategoryTasks from "../components/CategoryAndTaskComponents/CategoryTasks";
import TaskInfo from "../components/CategoryAndTaskComponents/TaskInfo";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import CategoryPerformanceCharts from "../components/Charts/CategoryPerformance";
import CategoryTaskAverages from "../components/Charts/CategoryTaskAverage";
import CategorySummaryPerDepartment from "../components/Charts/CategorySummaryPerDepartment";

export default function CategoryAndTask() {
  const [allCategory, setAllCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category_name: "",
    category_type: "Core Function",
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRightTab, setActiveRightTab] = useState("items"); // items | info
  const [currentTaskID, setCurrentTaskID] = useState(null);

  // Load categories
  async function loadCategories() {
    setLoading(true);
    try {
      const res = await getCategories();
      const data = res?.data ?? [];
      setAllCategory(data);
      if (!selectedCategoryId && data.length > 0) setSelectedCategoryId(data[0].id);
      if (data.length === 0) setSelectedCategoryId(null);

    } catch (error) {
      console.error(error);
      Swal.fire("Error", error?.response?.data?.error || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCategoryOrder(e){
    if (e.target.value == 0 || e.target.value == "") return;

    try {
      var res = await updateCategoryOrder(selectedCategoryId, e.target.value)

      Swal.fire("Success", res.data.message, "success");
    }
    catch(error){
      Swal.fire("Error", error?.response?.data?.error || "Updating Priority No. Failed", "error");
    }
  }

  useEffect(() => {
    loadCategories();
    socket.on("category", loadCategories);
    return () => socket.off("category", loadCategories);
  }, []);

  // Search + filtered list (memoized)
  const filteredCategories = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
    if (!q) return allCategory;
    return allCategory.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [allCategory, searchQuery]);

  // Create category handlers
  const handleDataChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmission = async () => {
    if (!formData.category_name || formData.category_name.trim() === "") {
      return Swal.fire("Validation", "KRA name is required", "warning");
    }
    setSubmitting(true);
    try {
      const payload = objectToFormData(formData);
      const res = await registerCategory(payload);
      if (res?.data?.message) {
        Swal.fire("Success", "KRA created successfully.", "success");
        loadCategories();
        // close modal
        const el = document.getElementById("add-category");
        const m = Modal.getInstance(el);
        if (m) m.hide();
      } else {
        Swal.fire("Error", res?.data?.message || "Failed to create KRA", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error?.response?.data?.error || "Request failed", "error");
    } finally {
      setSubmitting(false);
      setFormData({ category_name: "", category_type: "Core Function" });
    }
  };

  // UX helpers
  function openCreateModal() {
    const el = document.getElementById("add-category");
    const m = new Modal(el);
    m.show();
  }

  // When categories change, ensure selected id stays valid
  useEffect(() => {
    if (selectedCategoryId && !allCategory.find((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(allCategory.length ? allCategory[0].id : null);
    }
  }, [allCategory, selectedCategoryId]);

  return (
    <div className="container-fluid py-4">
      <div className="row g-3">
        <div className="col-12 col-md-12 col-lg-5 col-xl-4">
          <div className="card shadow-sm sticky-top" style={{ top: "1rem" }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="mb-0 fw-bold">Key Result Areas</h5>
                  <small className="text-muted">Select KRA to manage tasks</small>
                </div>
                <button className="btn btn-sm btn-primary d-flex gap-2 align-items-center" onClick={openCreateModal} title="Create category">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <div className="mb-3">
                <input
                  className="form-control form-control-sm"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="list-group list-group-flush">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center text-muted py-3">No KRAs found</div>
                ) : (
                  filteredCategories.map((cat) => {
                    const active = cat.id === selectedCategoryId;
                    return (
                      <button
                        key={cat.id}
                        className={`list-group-item list-group-item-action p-2 d-flex justify-content-between align-items-center ${active ? "active" : ""}`}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setActiveRightTab("items");
                        }}
                        title={cat.name}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="material-symbols-outlined">folder</span>
                          <div className="text-start">
                            <div className="fw-semibold small mb-0 text-truncate" style={{ maxWidth: 180 }}>{cat.name}</div>
                          </div>
                        </div>
                        <span className="badge bg-light text-dark">{cat.task_count ?? 0}</span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-3 text-muted small">Showing {filteredCategories.length} Key Result Areas</div>
            </div>
          </div>
        </div>

        {/* RIGHT: content with tabs */}
        <div className="col-12 col-md-12 col-lg-7 col-xl-8">
          <div className="p-3 border roundedshadow-sm rounded">
            <div className="header d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3 align-items-center">
                <h5 className="mb-0 fw-semibold">
                  {allCategory.find((c) => c.id === selectedCategoryId)?.name ?? "Select a category"}
                </h5>
                <small className="text">{allCategory.find((c) => c.id === selectedCategoryId)?.category_type}</small>
              </div>

              <div className="btn-group" role="tablist">
                <button className={`btn btn-sm ${activeRightTab === "items" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveRightTab("items")}>Items</button>
                <button className={`btn btn-sm ${activeRightTab === "info" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveRightTab("info")}>Info</button>
              </div>
            </div>

            <div className="body">
              {selectedCategoryId ? (
                activeRightTab === "items" ? (
                  <CategoryTasks
                    id={selectedCategoryId}
                    key={selectedCategoryId}
                    changeTaskID={(id) => {
                      setCurrentTaskID(id);
                      // open detail modal
                      const el = document.getElementById("view-task-info");
                      const m = new Modal(el);
                      m.show();
                    }}
                    reloadAll={() => loadCategories()}
                    reloadCategory={(id) => setSelectedCategoryId(id)}
                  />
                ) : (
                  <div className="row p-4">
                    <div className="col-12 col-lg-6">
                      <div className="mb-3">
                        <h6 className="fw-semibold">Task Details</h6>
                        <p className="text-muted small mb-1">{allCategory.find((c) => c.id === selectedCategoryId)?.description ?? "No description"}</p>
                        <div className="d-flex gap-2 mt-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setActiveRightTab("items")}>
                            Manage Items
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-12">
                              <div className="p-3 bg-white border rounded-3 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div>
                                    <h6 className="mb-0 fw-semibold">KRA Summary</h6>
                                    <small className="text-muted">Quick metrics</small>
                                  </div>
                                </div>
                    
                                <div className="d-flex gap-2 mt-3 flex-wrap">

                                  <div className="p-3 bg-light rounded-2 text-center" style={{ minWidth: 100 }}>
                                    <input type="number" onInput={handleCategoryOrder} min={0} defaultValue={allCategory.find((c) => c.id === selectedCategoryId)?.priority_order} className="form-control no-spinner"/>
                                    <small className="text-muted d-block">Priority No.</small>
                                  </div>

                                  <div className="p-3 bg-light rounded-2 text-center" style={{ minWidth: 100 }}>
                                    <div className="fw-bold">{allCategory.find((c) => c.id === selectedCategoryId)?.task_count ?? 0}</div>
                                    <small className="text-muted d-block">Tasks</small>
                                  </div>
                    
                                  <div className="p-3 bg-light rounded-2 text-center" style={{ minWidth: 100 }}>
                                    <div className="fw-bold">{parseFloat(allCategory.find((c) => c.id === selectedCategoryId)?.average_rating).toFixed(2) ?? 0}</div>
                                    <small className="text-muted d-block">Avg Rating</small>
                                  </div>
                                </div>

                                <div className="mt-2">
                                  <CategoryPerformanceCharts categoryId={selectedCategoryId} />
                                </div>
                    
                                <div className="mt-3">
                                  <CategoryTaskAverages cat_id={selectedCategoryId} />
                                </div>

                                <div className="">
                                  <CategorySummaryPerDepartment category_id={selectedCategoryId}></CategorySummaryPerDepartment>
                                </div>
                              </div>
                      </div>

                  </div>
                )
              ) : (
                <div className="text-center py-5 text-muted">
                  <div className="mb-3"><span className="material-symbols-outlined fs-1">folder_open</span></div>
                  <div className="fw-semibold mb-1">No KRA selected</div>
                  <div className="mb-3">Create or select a KRA from the left panel.</div>
                  <div>
                      <button className="btn btn-primary " onClick={openCreateModal}>
                        <span className = "d-flex">
                          <span className="material-symbols-outlined me-1">add</span>
                          Create KRA
                        </span>
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      <div className="modal fade" id="add-category" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="addCategoryLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3 shadow-sm">
            <div className="modal-header bg-primary text-white ">
              <h5 className="modal-title  d-flex gap-2 align-items-center" id="addCategoryLabel"><span className="material-symbols-outlined me-2">add</span>Create Key Result Area</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Key Result Area <span className="text-danger">*</span></label>
                <input name="category_name" className="form-control" value={formData.category_name} onChange={handleDataChange} placeholder="Eg. Research Services" />
              </div>

              <div className="mb-3 d-none">
                <label className="form-label">Function <span className="text-danger">*</span></label>
                <select name="category_type" className="form-select" value={formData.category_type} onChange={handleDataChange}>
                  <option value="Core Function">Core Function</option>
                  <option value="Strategic Function">Strategic Function</option>
                  <option value="Support Function">Support Function</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea rows={5} name="description" className="form-control" value={formData.description} onChange={handleDataChange} placeholder="Describe this key result area..." />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button className="btn btn-primary d-flex gap-2 align-items-center" onClick={handleSubmission} disabled={submitting || !formData.category_name}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <span className="material-symbols-outlined me-2">check</span>}
                {submitting ? "Creating..." : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Task Info Modal */}
      <div className="modal fade" id="view-task-info" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="taskInfoLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content rounded-3 shadow-sm">
            <div className="modal-header bg-primary text-white ">
              <h5 className="modal-title" id="taskInfoLabel">Task Information</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <TaskInfo id={currentTaskID} key={currentTaskID} backAfterArchive={() => { loadCategories(); }} backToPage={() => { setActiveRightTab("items"); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}