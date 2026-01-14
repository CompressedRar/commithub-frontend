import { useEffect, useState } from "react";
import { getLogs } from "../../services/logService";
import { getDepartments } from "../../services/departmentService";
import Logs from "./Logs";
import Swal from "sweetalert2";
import ActivityTrendChart from "../Charts/ActivityTrendChart";
import SystemLogsDistribution from "../Charts/SystemLogsDistribution";
import SystemLogsByDepartment from "../Charts/SystemLogsByDepartment";

function LogTable() {
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [visibleLogs, setVisibleLogs] = useState([]);

  // pagination
  const [pages, setPages] = useState([]);
  const [pageSize, setPageSize] = useState(() => {
    const stored = localStorage.getItem("audit_page_size");
    return stored ? Number(stored) : 10;
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedTarget, setSelectedTarget] = useState("All");

  const [allDepartments, setAllDepartments] = useState([]);

  // columns configuration (persisted)
  const AVAILABLE_COLUMNS = [
    { key: "user", label: "User" },
    { key: "department", label: "Department" },
    { key: "action", label: "Action" },
    { key: "target", label: "Target" },
    { key: "ip_address", label: "IP Address" },
    { key: "timestamp", label: "Timestamp" },
    { key: "user_agent", label: "User Agent" },
  ];

  const [columnsShown, setColumnsShown] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("audit_columns_shown"));
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {
      // ignore
    }
    return AVAILABLE_COLUMNS.map((c) => c.key);
  });

  // 🔹 Fetch departments
  async function loadDepartments() {
    try {
      const res = await getDepartments();
      setAllDepartments(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Fetching Departments failed.", "error");
    }
  }

  // 🔹 Fetch logs
  async function loadAllLogs() {
    try {
      const res = await getLogs();
      console.log("LOG DATA", res.data)
      setAllLogs(res.data);
      setFilteredLogs(res.data);
      generatePagination(res.data);
      setVisibleLogs(res.data.slice(0, pageSize)); // ✅ immediately show logs
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Fetching Logs failed.", "error");
    }
  }

  // 🔹 Pagination utilities
  function loadLimited() {
    if (!filteredLogs) return;
    const start = (currentPage - 1) * pageSize;
    setVisibleLogs(filteredLogs.slice(start, start + pageSize));
  }

  function generatePagination(array) {
    const totalPages = Math.max(1, Math.ceil(array.length / pageSize));
    const newPages = Array.from({ length: totalPages }, (_, i) => ({ id: i + 1, page: i + 1 }));
    setPages(newPages);
  }

  // persist pageSize and adjust pagination when pageSize changes
  function changePageSize(size) {
    setPageSize(size);
    localStorage.setItem("audit_page_size", String(size));
    setCurrentPage(1);
    generatePagination(filteredLogs);
    setVisibleLogs(filteredLogs.slice(0, size));
  }

  // 🔹 Filter logic
  function applyFilters() {
    if (!allLogs || allLogs.length === 0) return; 

    let filtered = [...allLogs];

    if (selectedDepartment !== "All") {
      filtered = filtered.filter(
        (log) =>
          log.department === selectedDepartment ||
          log.department_name === selectedDepartment
      );
    }

    if (selectedAction !== "All") {
      filtered = filtered.filter((log) => log.action === selectedAction);
    }

    if (selectedTarget !== "All") {
      filtered = filtered.filter((log) => log.target === selectedTarget);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.full_name?.toLowerCase().includes(q) ||
          m.action?.toLowerCase().includes(q) ||
          String(m.id).includes(q) ||
          m.timestamp?.toLowerCase().includes(q) ||
          m.ip_address?.toLowerCase().includes(q) ||
          m.user_agent?.toLowerCase().includes(q) ||
          m.department?.toLowerCase().includes(q)
      );
    }

    setFilteredLogs(filtered);
    generatePagination(filtered);
    setCurrentPage(1);
    setVisibleLogs(filtered.slice(0, pageSize));
  }

  // 🔹 Hooks
  useEffect(() => {
    loadDepartments();
    loadAllLogs();
  }, []);

  useEffect(() => {
    loadLimited();
  }, [filteredLogs, currentPage, pageSize]);

  useEffect(() => {
    if (allLogs.length > 0) applyFilters(); // ✅ only after logs exist
  }, [selectedDepartment, selectedAction, selectedTarget, allLogs]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (allLogs.length > 0) applyFilters();
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // persist columnsShown
  useEffect(() => {
    localStorage.setItem("audit_columns_shown", JSON.stringify(columnsShown));
  }, [columnsShown]);

  return (
    <div className="container-fluid">
      {/* Header */}
      

      

      <div className="row">
        <ActivityTrendChart></ActivityTrendChart>
        
      </div>

      <div className="row">
        <div className="col-lg-6 col-md-12">
          <SystemLogsDistribution></SystemLogsDistribution>
        </div>
        <div className="col-lg-6 col-md-12">
          <SystemLogsByDepartment></SystemLogsByDepartment>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <h4 className="fw-bold text-primary mb-2 mb-md-0 d-flex align-items-center gap-2">
          <span className="material-symbols-outlined">history</span> System Logs
        </h4>

        <div className="d-flex gap-2 align-items-center mt-2 mt-md-0">
          {/* Columns dropdown */}
          

          {/* Page size */}
          
        </div>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-3">
          <select
            className="form-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            {allDepartments.map((dept) => (
              <option value={dept.name} key={dept.id}>
                {dept.name}
              </option>
            ))}
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </div>

        <div className="col-12 col-md-3">
          <select
            className="form-select"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            <option value="All">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="ARCHIVE">Archive</option>
            <option value="LOGIN">Login</option>
            <option value="SUBMIT">Submit</option>
            <option value="ASSIGN">Assign</option>
            <option value="UNASSIGN">Unassign</option>
            <option value="REMOVE">Remove</option>
          </select>
        </div>

        <div className="col-12 col-md-3">
          <select
            className="form-select"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
          >
            <option value="All">All Targets</option>
            <option value="DEPARTMENT">Department</option>
            <option value="CATEGORY">Category</option>
            <option value="TASK">Task</option>
            <option value="USER">User</option>
            <option value="IPCR">IPCR</option>
            <option value="OPCR">OPCR</option>
            <option value="RATING">Rating</option>
            <option value="SUPPORTING_DOCS">Supporting Documents</option>
          </select>
        </div>

        <div className="col-12 col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">Showing {filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length}</small>
            <div className="d-flex align-items-center gap-2">
            <label className="small text-muted mb-0">Rows</label>
            <select className="form-select form-select-sm" value={pageSize} onChange={(e) => changePageSize(Number(e.target.value))} style={{ width: 90 }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
      </div>
      

      <div className="table-responsive">
        <table className="table table-hover align-middle table-striped">
          <thead className="table-primary">
            <tr>
              {columnsShown.includes("user") && <th>User</th>}
              {columnsShown.includes("department") && <th>Department</th>}
              {columnsShown.includes("action") && <th>Action</th>}
              {columnsShown.includes("target") && <th>Target</th>}
              {columnsShown.includes("timestamp") && <th>Timestamp</th>}
              {columnsShown.includes("user_agent") && <th>User Agent</th>}
            </tr>
          </thead>
          <tbody>
            {visibleLogs && visibleLogs.length > 0 ? (
              visibleLogs.map((log) => <Logs key={log.id} log={log} columnsShown={columnsShown} />)
            ) : (
              <tr>
                <td colSpan={Math.max(1, columnsShown.length)} className="text-center py-5 text-muted">
                  <span className="material-symbols-outlined fs-1 d-block">
                    history_toggle_off
                  </span>
                  <small>No Logs Found</small>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages && pages.length > 0 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center flex-wrap">
            {/* Prev Button */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => {
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              >
                ‹ Prev
              </button>
            </li>

            {/* Dynamic page window */}
            {(() => {
              const totalPages = pages.length;
              const maxVisible = 5;
              let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
              let end = Math.min(start + maxVisible - 1, totalPages);
              if (end - start < maxVisible - 1) {
                start = Math.max(end - maxVisible + 1, 1);
              }

              const visiblePages = pages.slice(start - 1, end);

              return visiblePages.map((data) => (
                <li key={data.id} className={`page-item ${currentPage === data.page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(data.page)}>
                    {data.page}
                  </button>
                </li>
              ));
            })()}

            {/* Next Button */}
            <li className={`page-item ${currentPage >= pages.length ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => {
                  if (currentPage < pages.length) setCurrentPage(currentPage + 1);
                }}
              >
                Next ›
              </button>
            </li>
          </ul>
        </nav>
      )}
      
    </div>
  );
}

export default LogTable;
