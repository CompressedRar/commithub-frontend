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

  async function loadLogs() {
    try {
      const res = await getSystemLogsTrend();
      const logs = res.data;

      const aggregated = aggregateLogsByDepartment(logs);
      const actionTypes = getActionTypes(logs);

      setData(aggregated);
      setActions(actionTypes);
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
          Action Distribution per Department
        </h6>

        <div style={{ width: "100%", height: 320 }}>
          {!data || data.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <p className="text-muted">No audit logs by department available</p>
            </div>
          ) : (
          <ResponsiveContainer>
            <BarChart
              data={data}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" display={"none"}/>
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />

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
