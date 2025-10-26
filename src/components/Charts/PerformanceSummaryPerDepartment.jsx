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
import { getPerformanceSummary } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function PerformanceSummaryPerDepartment() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadPerformance() {
    try {
      const res = await getPerformanceSummary();
      const summaryData = res.data;
      setData(summaryData);

      if (summaryData && summaryData.length > 0) {
        // Compute which department has the highest average
        const totalAvg = summaryData.reduce((sum, d) => sum + d.Average, 0);
        const avgAll = totalAvg / summaryData.length;
        const highest = summaryData.reduce((max, d) =>
          d.Average > max.Average ? d : max
        );
        const diffPercent = ((highest.Average - avgAll) / avgAll) * 100;

        setStats({
          department: highest.name,
          value: parseFloat(highest.Average).toFixed(2),
          diff: diffPercent.toFixed(2),
        });
      }
    } catch (error) {
      console.log(error.response?.data?.error || error.message);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load performance data",
        icon: "error",
      });
    }
  }

  useEffect(() => {
    loadPerformance();
  }, []);

  return (
    <div className="card shadow-sm border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header + Stats */}
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
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={0} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Quantity" fill="#82ca9d" name="Quantity" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Efficiency" fill="#8884d8" name="Efficiency" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Timeliness" fill="#ffc658" name="Timeliness" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Average" fill="#36a2eb" name="Average" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
