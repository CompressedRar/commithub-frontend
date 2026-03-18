import { useState, useMemo } from "react";

export function useLogTable(allLogs, pageSize, setPageSize) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });
  
  const [filters, setFilters] = useState({
    department: "All",
    action: "All",
    target: "All",
  });

  // 1. Apply Filtering
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      const matchDept = filters.department === "All" || 
        log.department === filters.department || log.department_name === filters.department;
      const matchAction = filters.action === "All" || log.action === filters.action;
      const matchTarget = filters.target === "All" || log.target === filters.target;
      
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || [
        log.full_name, log.action, log.id, log.timestamp, log.ip_address, log.department
      ].some(field => String(field).toLowerCase().includes(q));

      return matchDept && matchAction && matchTarget && matchSearch;
    });
  }, [allLogs, filters, searchQuery]);

  // 2. Apply Sorting
  const sortedLogs = useMemo(() => {
    const items = [...filteredLogs];
    if (sortConfig.key) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredLogs, sortConfig]);

  // 3. Apply Pagination
  const totalPages = Math.ceil(sortedLogs.length / pageSize);
  const visibleLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  return {
    visibleLogs,
    filteredLogs,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortConfig,
    requestSort,
  };
}