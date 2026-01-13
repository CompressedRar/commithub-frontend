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
import CHART_COLORS from "./chartColors";

export default function PerformanceSummaryPerDepartment() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadPerformance() {
    try {
      const res = await getPerformanceSummary();
      const summaryData = res.data || [];

      // Normalize numeric fields to numbers
      const cleaned = summaryData.map((d) => ({
        ...d,
        name: d.name || d.department || "",
        Average: Number.parseFloat(d.Average) || 0,
        Quantity: Number.parseInt(d.Quantity) || 0,
        Efficiency: Number.parseFloat(d.Efficiency) || 0,
        Timeliness: Number.parseFloat(d.Timeliness) || 0,
      }));

      setData(cleaned);

      console.log("CHART PERFORMANCE SUMMARY DATA", cleaned);

      const hasMeaningful = cleaned.some((c) => c.Average > 0 || c.Quantity > 0 || c.Efficiency > 0 || c.Timeliness > 0);

      if (cleaned.length > 0 && hasMeaningful) {
        const totalAvg = cleaned.reduce((sum, d) => sum + d.Average, 0);
        const avgAll = totalAvg / cleaned.length;

        // Use departments with numeric averages to find the highest
        const withAvg = cleaned.filter((c) => typeof c.Average === "number");
        const highest = withAvg.reduce((max, d) => (d.Average > max.Average ? d : max), withAvg[0]);

        const diffPercent = avgAll === 0 ? 0 : ((highest.Average - avgAll) / avgAll) * 100;

        setStats({
          department: highest.name,
          value: Number(highest.Average),
          diff: Number(diffPercent),
        });
      } else {
        setStats({ noData: true });
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

  const hasData = data && data.length > 0 && data.some(item => item.Average > 0 || item.Quantity > 0 || item.Efficiency > 0 || item.Timeliness > 0);

  return (
    <div className="card border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header + Stats */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Top Performing Department
            </small>
            {stats ? (
              stats.noData ? (
                <p className="fw-bold mb-0">No data to display</p>
              ) : (
                <>
                  <h4 className="fw-bold mb-0">{stats.department}</h4>
                  <p className="mb-0 fs-5 fw-semibold text-secondary">
                    {parseFloat(stats.value).toFixed(2)} / 5 average
                  </p>
                </>
              )
            ) : (
              <p className="text-muted mb-0">Loading...</p>
            )} 
          </div>

          {stats && !stats.noData && (
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
                {(stats.diff >= 0 ? "+" : "-")}{Math.abs(stats.diff).toFixed(2)}%
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
          {hasData ? (
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
                <Bar dataKey="Quantity" fill={CHART_COLORS.QUANTITY} name="Quantity" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Efficiency" fill={CHART_COLORS.EFFICIENCY} name="Efficiency" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Timeliness" fill={CHART_COLORS.TIMELINESS} name="Timeliness" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Average" fill={CHART_COLORS.AVERAGE} name="Average" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
              <p className="text-muted">No data to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
