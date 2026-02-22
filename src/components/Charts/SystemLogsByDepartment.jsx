import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getSystemLogsTrend } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

export default function SystemLogsByDepartment() {
  const [data, setData] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [allLogs, setAllLogs] = useState([]);

  async function loadLogs() {
    try {
      const res = await getSystemLogsTrend();
      const logs = res.data;

      const aggregated = aggregateLogsByDepartment(logs);
      const actionTypes = getActionTypes(logs);

      setData(aggregated);
      setActions(actionTypes);
      setAllLogs(logs);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to load audit logs",
        icon: "error",
      });
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="card border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        <small className="text-muted text-uppercase fw-semibold">
          Audit Logs by Department
        </small>

        <h6 className="fw-semibold text-secondary mb-3">
          {selectedDepartment ? `${selectedDepartment} - Action Breakdown` : "Action Distribution per Department"}
        </h6>

        {selectedDepartment && (
          <button 
            className="btn btn-sm btn-outline-secondary mb-3"
            onClick={() => setSelectedDepartment(null)}
          >
            ← Back to Overview
          </button>
        )}

        <div style={{ width: "100%", height: 320 }}>
          {!data || data.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <p className="text-muted">No audit logs by department available</p>
            </div>
          ) : selectedDepartment ? (
            <DetailedDepartmentView 
              department={selectedDepartment}
              logs={allLogs}
              actions={actions}
            />
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5 }}
              onClick={(state) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  setSelectedDepartment(data[state.activeTooltipIndex].department);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="department" type="category" width={190} />
              <Tooltip />

              {actions.map((action, index) => (
                <Bar
                  key={action}
                  dataKey={action}
                  stackId="logs"
                  fill={
                    CHART_COLORS.AUDIT_ACTIONS[action] ||
                    CHART_COLORS.AUDIT_FALLBACK[index % CHART_COLORS.AUDIT_FALLBACK.length]
                  }
                  name={action}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helpers */

function DetailedDepartmentView({ department, logs, actions }) {
  const filteredLogs = logs.filter(log => {
    const dept = ["UNKNOWN", "NONR"].includes(log.department)
      ? "System / Unassigned"
      : log.department;
    return dept === department;
  });

  const detailedData = [];
  actions.forEach(action => {
    const count = filteredLogs.filter(log => log.type === action).length;
    if (count > 0) {
      detailedData.push({ action, count });
    }
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={detailedData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis dataKey="action" type="category" width={140} />
        <Tooltip />
        <Bar 
          dataKey="count" 
          fill={CHART_COLORS.AUDIT_ACTIONS["default"] || "#8884d8"}
          name="Count"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function aggregateLogsByDepartment(logs) {
  const map = {};

  logs.forEach(log => {
    const dept =
      ["UNKNOWN", "NONR"].includes(log.department)
        ? "System / Unassigned"
        : log.department;

    if (!map[dept]) {
      map[dept] = { department: dept, total: 0 };
    }

    map[dept][log.type] = (map[dept][log.type] || 0) + 1;
    map[dept].total += 1;
  });

  return Object.values(map).sort((a, b) => b.total - a.total);
}


function getActionTypes(logs) {
  return [...new Set(logs.map(log => log.type))];
}
