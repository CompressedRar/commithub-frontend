import  { useEffect, useState, useMemo, useCallback } from "react";
import { socket } from "../api";
import Swal from "sweetalert2";
import { useDepartment } from "../../hooks/useDepartment";
import { useMembers } from "../../hooks/useMembers";

// Sub-components
import MemberFilters from "./MemberFilters";
import MemberListTable from "./MemberListTable";
import MemberPagination from "./MemberPagination";
import UserModals from "./UserModals";

const ITEMS_PER_PAGE = 10;

export default function MemberTable() {
  const [allMembers, setAllMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentUserID, setCurrentUserID] = useState(null);
  
  // Filter/Sort State
  const [searchQuery, setQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const { fetchDepartments } = useDepartment();
  const { fetchMembers } = useMembers();

  // --- Data Fetching ---
  const loadInitialData = useCallback(async () => {
    try {
      const [depts, members] = await Promise.all([fetchDepartments(), fetchMembers()]);
      setDepartments(depts);
      setAllMembers(members);
    } catch (error) {
      Swal.fire("Error", "Failed to load system data.", "error");
    }
  }, [fetchDepartments, fetchMembers]);

  useEffect(() => {
    loadInitialData();
    socket.on("user_created", loadInitialData);
    socket.on("user_modified", loadInitialData);
    return () => {
      socket.off("user_created", loadInitialData);
      socket.off("user_modified", loadInitialData);
    };
  }, [loadInitialData]);

  // --- Logic: Filtering & Sorting (The Brains) ---
  const processedMembers = useMemo(() => {
    let result = [...allMembers];

    // 1. Filter
    if (selectedDepartment !== "All") {
      result = result.filter(m => m.department?.id === parseInt(selectedDepartment));
    }
    if (selectedRole !== "All") {
      result = result.filter(m => m.role.toLowerCase() === selectedRole.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        `${m.first_name} ${m.last_name} ${m.email} ${m.position?.name} ${m.role}`
          .toLowerCase().includes(q)
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';
      
      // Handle nested objects if necessary (e.g., position.name)
      if (sortConfig.key === 'position') {
        valA = a.position?.name || '';
        valB = b.position?.name || '';
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allMembers, selectedDepartment, selectedRole, searchQuery, sortConfig]);

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(processedMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [processedMembers, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => setCurrentPage(1), [searchQuery, selectedDepartment, selectedRole]);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
          <span className="material-symbols-outlined">group</span> 
          Accounts <span className="badge bg-light text-primary border">{processedMembers.length}</span>
        </h4>
        <button data-bs-toggle="modal" data-bs-target="#add-user" className="btn btn-primary shadow-sm">
          Create Account
        </button>
      </div>

      <MemberFilters 
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        searchQuery={searchQuery}
        setQuery={setQuery}
      />

      <MemberListTable 
        members={paginatedMembers} 
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        onViewProfile={setCurrentUserID} 
      />

      <MemberPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      <UserModals currentUserID={currentUserID} />
    </div>
  );
}