import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSystemLogsTrend } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

export default function SystemLogsDistribution() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadLogs() {
    try {
      const res = await getSystemLogsTrend();
      const rawLogs = res.data;

      console.log(rawLogs)

      // Aggregate logs by action type
      const aggregated = aggregateLogsByType(rawLogs);
      setData(aggregated);

      if (aggregated.length > 0) {
        const total = aggregated.reduce((sum, d) => sum + d.value, 0);
        const top = aggregated.reduce((max, d) =>
          d.value > max.value ? d : max
        );

        const percent = ((top.value / total) * 100).toFixed(1);

        setStats({
          action: top.name,
          count: top.value,
          percent,
        });
      }
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
        {/* Header + Insight */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Most Frequent Action
            </small>
            {stats ? (
              <>
                <h4 className="fw-bold mb-0">{stats.action}</h4>
                <p className="mb-0 fs-6 text-secondary">
                  {stats.count} logs ({stats.percent}% of total)
                </p>
              </>
            ) : (
              <p className="text-muted mb-0">Loading...</p>
            )}
          </div>
        </div>

        {/* Chart */}
        <h6 className="fw-semibold text-secondary mb-2">
          Audit Logs Distribution by Action
        </h6>

        <div style={{ width: "100%", height: 280 }}>
          {!data || data.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <p className="text-muted">No audit log distribution data available</p>
            </div>
          ) : (
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                name="Log Count"
                fill={CHART_COLORS.SECONDARY}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helper */
function aggregateLogsByType(logs) {
  const map = {};

  logs.forEach(log => {
    map[log.type] = (map[log.type] || 0) + 1;
  });

  return Object.entries(map).map(([type, count]) => ({
    name: type,
    value: count,
  }));
}
