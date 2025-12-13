import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { getPerformancePerDepartment } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

export default function PerformancePerDepartment() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadRatioDepartment() {
    try {
      const res = await getPerformancePerDepartment();
      const performanceData = res.data;
      setData(performanceData);

      if (performanceData && performanceData.length > 0) {
        // Calculate average and highest
        const total = performanceData.reduce((sum, d) => sum + d.value, 0);
        const avg = total / performanceData.length;
        const highest = performanceData.reduce((max, d) =>
          d.value > max.value ? d : max
        );
        const diffPercent = ((highest.value - avg) / avg) * 100;
        
        setStats({
          department: highest.name,
          value: parseFloat(highest.value).toFixed(2),
          diff: diffPercent.toFixed(2)
        });
      }
    } catch (error) {
      console.log(error.response?.data?.error || error.message);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load performance data",
        icon: "error"
      });
    }
  }

  useEffect(() => {
    loadRatioDepartment();
  }, []);

  return (
    <div className="card shadow-sm border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Top Performing Department
            </small>
            {stats ? (
              <>
                <h4 className="fw-bold mb-0">{stats.department}</h4>
                <p className="mb-0 fs-5 fw-semibold text-secondary">
                  {stats.value} / 5 average
                </p>
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
                  style={{ fontSize: "1rem", verticalAlign: "middle" }}
                >
                  {stats.diff >= 0 ? "arrow_upward" : "arrow_downward"}
                </span>
                {Math.abs(stats.diff)}%
              </div>
              <small className="text-muted">vs average</small>
            </div>
          )}
        </div>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={data}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis type="category" dataKey="name" fontSize={0.2} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill={CHART_COLORS.AVERAGE}
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
