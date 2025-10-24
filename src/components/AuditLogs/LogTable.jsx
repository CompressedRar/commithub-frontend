import { useEffect, useState } from "react";
import { getLogs } from "../../services/logService";
import { getDepartments } from "../../services/departmentService";
import Logs from "./Logs";
import Swal from "sweetalert2";

function LogTable() {
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [pages, setPages] = useState([]);
  const [pageLimit, setPageLimit] = useState({ offset: 0, limit: 10 });
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedTarget, setSelectedTarget] = useState("All");

  const [allDepartments, setAllDepartments] = useState([]);

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
      setAllLogs(res.data);
      setFilteredLogs(res.data);
      generatePagination(res.data);
      setVisibleLogs(res.data.slice(0, 10)); // ✅ immediately show logs
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Fetching Logs failed.", "error");
    }
  }

  // 🔹 Pagination utilities
  function loadLimited() {
    if (!filteredLogs) return;
    const sliced = filteredLogs.slice(pageLimit.offset, pageLimit.limit);
    setVisibleLogs(sliced);
  }

  function generatePagination(array) {
    const totalPages = Math.ceil(array.length / 10);
    const newPages = Array.from({ length: totalPages }, (_, i) => ({
      id: i + 1,
      page: i + 1,
    }));
    setPages(newPages);
  }

  // 🔹 Filter logic
  function applyFilters() {
    if (!allLogs || allLogs.length === 0) return; // ✅ don't run before load

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
      filtered = filtered.filter((log) => log.target_type === selectedTarget);
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
    setPageLimit({ offset: 0, limit: 10 });
    setVisibleLogs(filtered.slice(0, 10)); // ✅ immediately display results
  }

  // 🔹 Hooks
  useEffect(() => {
    loadDepartments();
    loadAllLogs();
  }, []);

  useEffect(() => {
    loadLimited();
  }, [filteredLogs, pageLimit]);

  useEffect(() => {
    if (allLogs.length > 0) applyFilters(); // ✅ only after logs exist
  }, [selectedDepartment, selectedAction, selectedTarget, allLogs]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (allLogs.length > 0) applyFilters();
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <h4 className="fw-bold text-primary mb-2 mb-md-0 d-flex align-items-center gap-2">
          <span className="material-symbols-outlined">history</span> System Logs
        </h4>
      </div>

      {/* Filters */}
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
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="ARCHIVE">ARCHIVE</option>
            <option value="LOGIN">LOGIN</option>
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
      <div className="table-responsive">
        <table className="table table-hover align-middle table-striped">
          <thead className="table-primary">
            <tr>
              <th>User</th>
              <th>Department</th>
              <th>Action</th>
              <th>Target</th>
              <th>IP Address</th>
              <th>Timestamp</th>
              <th>User Agent</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs && visibleLogs.length > 0 ? (
              visibleLogs.map((log) => <Logs key={log.id} log={log} />)
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-5 text-muted">
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
            <li className={`page-item ${pageLimit.offset === 0 ? "disabled" : ""}`}>
                <button
                className="page-link"
                onClick={() => {
                    if (pageLimit.offset > 0) {
                    const newPage = pageLimit.offset / 10 - 1;
                    setPageLimit({
                        offset: newPage * 10,
                        limit: newPage * 10 + 10,
                    });
                    }
                }}
                >
                ‹ Prev
                </button>
            </li>

            {/* Dynamic page window */}
            {(() => {
                const currentPage = Math.floor(pageLimit.offset / 10) + 1;
                const totalPages = pages.length;
                const maxVisible = 5;
                let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
                let end = Math.min(start + maxVisible - 1, totalPages);
                if (end - start < maxVisible - 1) {
                start = Math.max(end - maxVisible + 1, 1);
                }

                const visiblePages = pages.slice(start - 1, end);

                return visiblePages.map((data) => (
                <li
                    key={data.id}
                    className={`page-item ${
                    pageLimit.offset / 10 + 1 === data.page ? "active" : ""
                    }`}
                >
                    <button
                    className="page-link"
                    onClick={() =>
                        setPageLimit({
                        offset: (data.page - 1) * 10,
                        limit: data.page * 10,
                        })
                    }
                    >
                    {data.page}
                    </button>
                </li>
                ));
            })()}

            {/* Next Button */}
            <li
                className={`page-item ${
                pageLimit.offset + 10 >= filteredLogs.length ? "disabled" : ""
                }`}
            >
                <button
                className="page-link"
                onClick={() => {
                    if (pageLimit.offset + 10 < filteredLogs.length) {
                    const newPage = pageLimit.offset / 10 + 1;
                    setPageLimit({
                        offset: newPage * 10,
                        limit: newPage * 10 + 10,
                    });
                    }
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
