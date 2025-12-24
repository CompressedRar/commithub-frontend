import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { getUserPerformanceInDepartment } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

export default function TopUserPerformanceInDepartment({ dept_id }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadUserPerformance() {
    try {
      const res = await getUserPerformanceInDepartment(dept_id);
      const performanceData = res.data;
      setData(performanceData);

      if (performanceData && performanceData.length > 0) {
        // Average
        const total = performanceData.reduce((sum, d) => sum + d.value, 0);
        const avg = total / performanceData.length;

        // Highest performer
        const highest = performanceData.reduce((max, d) =>
          d.value > max.value ? d : max
        );

        const diffPercent = ((highest.value - avg) / avg) * 100;

        setStats({
          user: highest.name,
          value: parseFloat(highest.value).toFixed(2),
          diff: diffPercent.toFixed(2)
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load user performance",
        icon: "error"
      });
    }
  }

  useEffect(() => {
    loadUserPerformance();
  }, [dept_id]);

  return (
    <div className="card border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* ===== Header Stats ===== */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Top Performing User
            </small>

            {stats ? (
              <>
                {stats.value != 0 ? <>
                  <h4 className="fw-bold mb-0">{stats.department}</h4>
                  <p className="mb-0 fs-5 fw-semibold text-secondary">
                    {stats.value} / 5 average
                  </p>
                </> : <p className="fw-bold mb-0">No Data Loaded</p>}
              </>
            ) : (
              <p className="text-muted mb-0">Loading...</p>
            )}
          </div>

          {stats && (
            <div className="text-end">
              <div
                className={`d-flex align-items-center justify-content-end ${
                  stats.diff >= 0 ? "text-success" : "text-danger"
                } fw-semibold`}
              >
                <span
                  className="material-symbols-outlined me-1"
                  style={{ fontSize: "1rem" }}
                >
                  {stats.diff >= 0 ? "arrow_upward" : "arrow_downward"}
                </span>
                {Math.abs(stats.diff)}%
              </div>
              <small className="text-muted">vs department average</small>
            </div>
          )}
        </div>

        {/* ===== Chart ===== */}
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                fontSize={12}
              />
              <Tooltip />
              <Bar
                dataKey="value"
                fill={CHART_COLORS.SECONDARY}
                name="Average Performance"
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
