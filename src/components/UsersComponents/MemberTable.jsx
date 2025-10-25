import { useEffect, useState } from "react";
import { getAccounts } from "../../services/userService";
import { getDepartments } from "../../services/departmentService";
import Members from "./Members";
import MemberProfile from "./MemberProfile";
import { socket } from "../api";
import Swal from "sweetalert2";
import { auto } from "@popperjs/core";

function MemberTable() {
  const [allMembers, setAllMembers] = useState(null);
  const [filteredMembers, setFilteredMembers] = useState(null);
  const [tenMembers, setTenMembers] = useState(null);
  const [pages, setPages] = useState(null);
  const [memberLimit, setMemberLimit] = useState({ offset: 0, limit: 10 });
  const [searchQuery, setQuery] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");

  const [currentUserID, setCurrentUserID] = useState(0);
  const [allDepartments, setAllDepartments] = useState(null);

  // Fetch departments
  async function loadDepartments() {
    try {
      const res = await getDepartments();
      setAllDepartments(res.data);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Fetching Departments failed.", "error");
    }
  }

  // Fetch all members
  async function loadAllMembers() {
    try {
      const res = await getAccounts();
      setAllMembers(res.data);
      setFilteredMembers(res.data);
      generatePagination(res.data);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", error.response?.data?.error || "Fetching accounts failed.", "error");
    }
  }

  // Pagination
  function loadLimited() {
    if (!filteredMembers) return;
    const slicedMembers = filteredMembers.slice(memberLimit.offset, memberLimit.limit);
    setTenMembers(slicedMembers);
  }

  function generatePagination(array) {
    const totalPages = Math.ceil(array.length / 10);
    const newPages = Array.from({ length: totalPages }, (_, i) => ({
      id: i + 1,
      page: i + 1,
    }));
    setPages(newPages);
  }

  // Filter logic
  function applyFilters() {
    if (!allMembers) return;
    let filtered = [...allMembers];

    if (selectedDepartment !== "All") {
      filtered = filtered.filter(
        (m) => m.department && m.department.id === parseInt(selectedDepartment)
      );
    }

    if (selectedRole !== "All") {
      filtered = filtered.filter(
        (m) => m.role.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.email.toLowerCase().includes(query) ||
          m.first_name.toLowerCase().includes(query) ||
          m.last_name.toLowerCase().includes(query) ||
          m.position.name.toLowerCase().includes(query) ||
          String(m.id).includes(query) ||
          m.created_at.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
    generatePagination(filtered);
    setMemberLimit({ offset: 0, limit: 10 });
  }

  // Reactivity
  useEffect(() => loadLimited(), [filteredMembers, memberLimit]);
  useEffect(() => applyFilters(), [selectedDepartment, selectedRole]);

  useEffect(() => {
    const debounce = setTimeout(() => applyFilters(), 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      await loadAllMembers();
      await loadDepartments();
    })();

    socket.on("user_created", loadAllMembers);
    socket.on("user_modified", loadAllMembers);

  }, []);

  return (
    <div className="container-fluid" style={{overflow:"auto"}}>
      {/* 🔹 Add User Modal */}
      <div
        className="modal fade"
        id="add-user"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Create Account</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-0">
              <iframe
                className="w-100 border-0"
                style={{ height: "90vh" }}
                src="/create"
                title="Create Account"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 User Profile Modal */}
      <div
        className="modal fade"
        id="user-profile"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Profile Page</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {currentUserID ? <MemberProfile key={currentUserID} id={currentUserID} /> : ""}
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Header and Filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <h4 className="fw-bold text-primary mb-2 mb-md-0 d-flex align-items-center gap-2">
          <span className="material-symbols-outlined">group</span> Accounts
        </h4>

        <button
          data-bs-toggle="modal"
          data-bs-target="#add-user"
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span> Create Account
        </button>
      </div>

      {/* 🔹 Filters Section */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            {allDepartments &&
              allDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
          </select>
        </div>

        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="President">College President</option>
            <option value="Head">Head</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>

        <div className="col-12 col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search user..."
            value={searchQuery}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 🔹 Table Section */}
      <div className="table-responsive">
        <table className="table table-hover align-middle table-striped">
          <thead className="table-primary">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Office</th>
              <th>Position</th>
              <th>Role</th>
              <th className="text-center">Status</th>
              <th>Date Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenMembers && tenMembers.length > 0 ? (
              tenMembers.map((mems) => (
                <Members
                  key={mems.id}
                  mems={mems}
                  switchMember={(id) => setCurrentUserID(id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">
                  <span className="material-symbols-outlined fs-1 d-block">no_accounts</span>
                  <small>No Users Found</small>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Pagination */}
      {pages && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center flex-wrap">
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

export default MemberTable;
