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
import { getCategoryPerformanceByDept } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

export default function CategorySummaryPerDepartment({ category_id }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadPerformance() {
    try {
      const res = await getCategoryPerformanceByDept(category_id);
      const summaryData = res.data || [];
      setData(summaryData);

      if (summaryData.length > 0) {
        const totalAvg = summaryData.reduce(
          (sum, d) => sum + (d.average || 0),
          0
        );
        const avgAll = totalAvg / summaryData.length;

        const highest = summaryData.reduce((max, d) =>
          d.average > max.average ? d : max
        );

        const diffPercent =
          avgAll > 0 ? ((highest.average - avgAll) / avgAll) * 100 : 0;

        setStats({
          department: highest.name,
          value: highest.average.toFixed(2),
          diff: diffPercent.toFixed(2),
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load performance data",
        icon: "error",
      });
    }
  }

  useEffect(() => {
    loadPerformance();
  }, [category_id]);

  return (
    <div className="border-0 m-3" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header + Stats */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Average Performance Per Department
            </small>

            {stats ? (
              stats.value !== "0.00" ? (
                <>
                  <h4 className="fw-bold mb-0">{stats.department}</h4>
                  <p className="mb-0 fs-5 fw-semibold text-secondary">
                    {stats.value} / 5 average
                  </p>
                </>
              ) : (
                <p className="fw-bold mb-0">No Data Loaded</p>
              )
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
              <small className="text-muted">vs overall avg</small>
            </div>
          )}
        </div>

        {/* Chart */}
        <h6 className="fw-semibold text-secondary mb-2">
          Performance Summary per Department
        </h6>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />

              <Bar
                dataKey="quantity"
                fill={CHART_COLORS.QUANTITY}
                name="Quantity"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="efficiency"
                fill={CHART_COLORS.EFFICIENCY}
                name="Efficiency"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="timeliness"
                fill={CHART_COLORS.TIMELINESS}
                name="Timeliness"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="average"
                fill={CHART_COLORS.AVERAGE}
                name="Average"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
