import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getDepartmentTasks } from "../../services/departmentService";
import { socket } from "../api";
import DepartmentTask from "./DepartmentTask";
import DepartmentAssignTask from "./DepartmentAssignTask";
import AddDepartmentTask from "./AddDepartmentTask";

function DepartmentTasksTable({ id, admin_mode }) {
  const [allMembers, setAllMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [tenMembers, setTenMembers] = useState([]);
  const [pages, setPages] = useState([]);
  const [memberLimit, setMemberLimit] = useState({ offset: 0, limit: 10 });
  const [searchQuery, setQuery] = useState("");
  const [currentUserID, setCurrentUserID] = useState(0);

  // Load all tasks
  async function loadAllMembers() {
    try {
      const res = await getDepartmentTasks(id);
      setAllMembers(res.data);
      setFilteredMembers(res.data);
      generatePagination(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load tasks.",
        icon: "error",
      });
    }
  }

  // Pagination logic
  function loadLimited() {
    const sliced = filteredMembers.slice(memberLimit.offset, memberLimit.limit);
    setTenMembers(sliced);
  }

  // Search filter
  function loadSearchedData(query) {
    const matched = allMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.actual_accomplishment
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        member.target_accomplishment
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        member.category.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMembers(matched);
    generatePagination(matched);
    setMemberLimit({ offset: 0, limit: 10 });
  }

  // Create pagination buttons
  function generatePagination(array) {
    const totalPages = Math.ceil(array.length / 10);
    const newPages = Array.from({ length: totalPages }, (_, i) => ({
      id: i + 1,
      page: i + 1,
    }));
    setPages(newPages);
  }

  // --- EFFECTS ---
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      loadLimited();
      loadAllMembers();
      return;
    }
    const debounce = setTimeout(() => {
      loadSearchedData(searchQuery);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    loadLimited();
  }, [allMembers, memberLimit]);

  // Socket updates
  useEffect(() => {
    loadAllMembers();
    socket.on("user_created", loadAllMembers);
    socket.on("user_assigned", loadAllMembers);
    socket.on("user_unassigned", loadAllMembers);
    socket.on("task_modified", loadAllMembers);
    socket.on("department_assigned", loadAllMembers);

    return () => {
      socket.off("user_created");
      socket.off("user_assigned");
      socket.off("user_unassigned");
      socket.off("task_modified");
      socket.off("department_assigned");
      
    };
  }, []);

  return (
    <div className="container-fluid py-3 bg-white ">
      {/* === Add Task Modal === */}
      <div
        className="modal fade"
        id="add-user"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="addTaskModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl " style={{scale:"1.1"}}>
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="addTaskModalLabel">
                <i className="bi bi-plus-circle me-2"></i> Add Office Output
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body bg-light">
              <AddDepartmentTask dept_id={id} />
            </div>
          </div>
        </div>
      </div>

      {/* === Assign Member Modal === */}
      <div
        className="modal fade"
        id="user-profile"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="assignModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-secondary text-white">
              <h5 className="modal-title" id="assignModalLabel">
                <i className="bi bi-person-plus me-2"></i> Assign Members
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body bg-light">
              {currentUserID ? (
                <DepartmentAssignTask
                  key={currentUserID}
                  task_id={currentUserID}
                  dept_id={id}
                />
              ) : (
                <p className="text-center text-muted">
                  Select an output to assign members.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === Header Controls === */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h4 className="fw-semibold text-dark mb-0">Office Outputs</h4>
        <div className="d-flex align-items-center gap-2 m-2">
            {admin_mode? <button
                className="btn btn-primary d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#add-user"
                style={{ height: "38px", textWrap:"wrap" }}
                
            >
                <span className="material-symbols-outlined">add</span>
                <span className="" style={{textWrap:"nowrap" }}>Add Output</span>
            </button>: ""}

            <div className="input-group" style={{ width: "250px", height: "38px" }}>
                <span className="input-group-text bg-white">
                    <span className="material-symbols-outlined">search</span>
                </span>
                <input
                type="text"
                className="form-control shadow-none"
                placeholder="Search task..."
                onInput={(e) => setQuery(e.target.value)}
                style={{ height: "38px" }}
                />
            </div>
        </div>
      </div>

      {/* === Tasks Table === */}
      <div className="">
        {tenMembers.length > 0 ? (
              tenMembers.map((mems) => (
                <DepartmentTask
                  key={mems.id}
                  mems={mems}
                  switchMember={(id) => setCurrentUserID(id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  <i className="bi bi-file-earmark-x fs-4 d-block mb-2"></i>
                  No Office Outputs Found
                </td>
              </tr>
            )}
      </div>

      {/* === Pagination === */}
      {pages.length > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center mb-0">
            {pages.map((data) => (
              <li key={data.id} className="page-item">
                <button
                  className="page-link"
                  onClick={() =>
                    setMemberLimit({
                      offset: (data.page - 1) * 10,
                      limit: data.page * 10,
                    })
                  }
                >
                  {data.page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default DepartmentTasksTable;
