import { useEffect, useState } from "react";
import { getLogs } from "../../services/logService";
import { getDepartments } from "../../services/departmentService";
import { useLogTable } from "../../hooks/useLogsTable";
import Logs from "./Logs";
import { LogFilters } from "./LogFilters";
import {LogPagination} from "./LogPagination"; 

import ActivityTrendChart from "../Charts/ActivityTrendChart";
import SystemLogsDistribution from "../Charts/SystemLogsDistribution";
import SystemLogsByDepartment from "../Charts/SystemLogsByDepartment";

const AVAILABLE_COLUMNS = [
  { key: "user", label: "User" },
  { key: "department", label: "Department" },
  { key: "action", label: "Action" },
  { key: "target", label: "Target" },
  { key: "timestamp", label: "Timestamp" },
  { key: "user_agent", label: "User Agent" },
];

function LogTable() {
  const [allLogs, setAllLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pageSize, setPageSize] = useState(() => Number(localStorage.getItem("audit_page_size")) || 10);
  
  // Custom Hook
  const {
    visibleLogs, filteredLogs, currentPage, setCurrentPage,
    totalPages, searchQuery, setSearchQuery, filters, setFilters,
    sortConfig, requestSort
  } = useLogTable(allLogs, pageSize);

  useEffect(() => {
    Promise.all([getLogs(), getDepartments()]).then(([logsRes, deptRes]) => {
      setAllLogs(logsRes.data);
      console.log("Fetched logs:", logsRes.data);
      setDepartments(deptRes.data);
    });
  }, []);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    localStorage.setItem("audit_page_size", size);
    setCurrentPage(1);
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <ActivityTrendChart />
        <SystemLogsDistribution></SystemLogsDistribution>
        <SystemLogsByDepartment></SystemLogsByDepartment>
      </div>

      <LogFilters 
        filters={filters} setFilters={setFilters} 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
        departments={departments} 
      />

      <div className="table-responsive bg-white shadow-sm rounded">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              {AVAILABLE_COLUMNS.map(col => (
                <th key={col.key} onClick={() => requestSort(col.key)} style={{ cursor: 'pointer' }}>
                  {col.label} {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleLogs.length > 0 ? (
              visibleLogs.map(log => <Logs key={log.id} log={log} columnsShown={AVAILABLE_COLUMNS.map(c => c.key)} />)
            ) : (
              <tr><td colSpan="5" className="text-center py-5">No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <select className="form-select w-auto" value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
          {[10, 25, 50].map(sz => <option key={sz} value={sz}>Show {sz}</option>)}
        </select>
        
        <LogPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}

export default LogTable;