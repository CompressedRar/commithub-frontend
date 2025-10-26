import { useEffect, useState } from "react";
import { getDepartment } from "../../services/departmentService";
import DepartmentMembers from "./DepartmentMembers";
import { socket } from "../api";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

function DepartmentMemberTable({ deptid }) {
  const [allMembers, setAllMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [tenMembers, setTenMembers] = useState([]);
  const [pages, setPages] = useState([]);
  const [memberLimit, setMemberLimit] = useState({ offset: 0, limit: 10 });
  const [searchQuery, setQuery] = useState("");

  async function loadAllMembers(id) {
    try {
      const res = await getDepartment(id).then((data) => data.data.users);
      setAllMembers(res);
      setFilteredMembers(res);
      generatePagination(res);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load members",
        icon: "error",
      });
    }
  }

  function loadLimited() {
    const sliced = filteredMembers.slice(memberLimit.offset, memberLimit.limit);
    setTenMembers(sliced);
  }

  function loadSearchedData(query) {
    const matched = allMembers.filter((m) =>
      [m.email, m.first_name, m.last_name, m.position.name, String(m.id)].some((field) =>
        field.toLowerCase().includes(query.toLowerCase())
      )
    );
    setFilteredMembers(matched);
    generatePagination(matched);
    setMemberLimit({ offset: 0, limit: 10 });
  }

  function generatePagination(array) {
    const pageCount = Math.ceil(array.length / 10);
    const newPages = Array.from({ length: pageCount }, (_, i) => ({ id: i + 1, page: i + 1 }));
    setPages(newPages);
  }

  // --- Load members initially ---
  useEffect(() => {
    loadAllMembers(deptid);

    socket.on("user_modified", () => loadAllMembers(deptid));
    socket.on("user_created", () => loadAllMembers(deptid));

    return () => {
      socket.off("user_created");
      socket.off("user_modified");
    };
  }, [deptid]);

  // --- Pagination updates ---
  useEffect(() => {
    loadLimited();
  }, [filteredMembers, memberLimit, allMembers]);

  // --- Search debounce ---
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredMembers(allMembers);
      generatePagination(allMembers);
      setMemberLimit({ offset: 0, limit: 10 });
      return;
    }

    const debounce = setTimeout(() => loadSearchedData(searchQuery), 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <h5 className="fw-bold text-primary mb-2 mb-md-0">Office Members</h5>

        <div className="input-group w-100 w-md-50" style={{ maxWidth: "300px" }}>
          <span className="input-group-text bg-light">
            <span className="material-symbols-outlined">search</span>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search member..."
            value={searchQuery}
            onInput={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle text-center">
          <thead className="table-primary">
            <tr>
              <th>FULL NAME</th>
              <th>PERFORMANCE</th>
              <th>EMAIL ADDRESS</th>
              <th>POSITION</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenMembers.length > 0 ? (
              tenMembers
                .filter((mems) => mems.account_status === 1)
                .map((mems) => <DepartmentMembers key={mems.id} mems={mems} />)
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-muted">
                  <div className="d-flex flex-column align-items-center">
                    <span className="material-symbols-outlined fs-1 text-secondary">no_accounts</span>
                    <small>No Members Found</small>
                  </div>
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages.length > 1 && (
        <nav className="d-flex justify-content-center mt-3">
          <ul className="pagination pagination-sm mb-0">
            {pages.map((data) => (
              <li key={data.id} className="page-item">
                <button
                  className={`page-link ${
                    memberLimit.offset / 10 + 1 === data.page ? "active bg-primary text-white" : ""
                  }`}
                  onClick={() =>
                    setMemberLimit({ offset: (data.page - 1) * 10, limit: data.page * 10 })
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

export default DepartmentMemberTable;
