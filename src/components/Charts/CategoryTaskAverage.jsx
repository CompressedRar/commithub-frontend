import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Swal from "sweetalert2";
import { getCategoryTaskAverage } from "../../services/tableServices";
import { socket } from "../api";
import CHART_COLORS from "./chartColors";

export default function CategoryTaskAverages({ cat_id }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadData() {
    try {
      const res = await getCategoryTaskAverage(cat_id);
      const summaryData = res.data || [];
      console.log("category-task-average beofre", summaryData);
      // Normalize numeric fields
      const cleaned = summaryData.map((d) => ({
        ...d,
        task_name: d.task_name || d.task || "",
        overall_average: Number.parseFloat(parseFloat((d.average_quantity + d.average_efficiency + d.average_timeliness) / 3).toFixed(2)) || 0,
        average_quantity: Number.parseFloat(d.average_quantity) || 0,
        average_efficiency: Number.parseFloat(d.average_efficiency) || 0,
        average_timeliness: Number.parseFloat(d.average_timeliness) || 0,
      }));

      setData(cleaned);
      console.log("category-task-average", cleaned);

      const hasMeaningful = cleaned.some((c) => c.overall_average > 0 || c.average_quantity > 0 || c.average_efficiency > 0 || c.average_timeliness > 0);

      if (cleaned.length > 0 && hasMeaningful) {
        // Calculate overall and top task stats
        const totalAvg = cleaned.reduce((sum, d) => sum + d.overall_average, 0);
        const avgAll = totalAvg / cleaned.length;
        const withAvg = cleaned.filter((c) => typeof c.overall_average === "number");
        const highest = withAvg.reduce((max, d) => (d.overall_average > max.overall_average ? d : max), withAvg[0]);
        const diffPercent = avgAll === 0 ? 0 : ((highest.overall_average - avgAll) / avgAll) * 100;

        setStats({
          task: highest.task_name,
          value: Number(highest.overall_average),
          diff: Number(diffPercent),
        });
      } else {
        setStats({ noData: true });
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load category task averages", "error");
    }
  }

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    socket.on("ipcr", handler);
    return () => {
      socket.off("ipcr", handler);
    };
  }, [cat_id]);

  return (
    <div className="border-0 m-3" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header + Stats */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Top Rated Task in Category
            </small>
            {stats ? (
              stats.noData ? (
                <p className="fw-bold mb-0">No data to display</p>
              ) : (
                <>
                  <h4 className="fw-bold mb-0">{stats.task}</h4>
                  <p className="mb-0 fs-5 fw-semibold text-secondary">
                    {stats.value.toFixed(2)} / 5 average
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
          Tasks Rating Summary
        </h6>
        <div style={{ width: "100%", height: 300 }}>
          {data && data.length > 0 && data.some(item => item.overall_average > 0 || item.average_quantity > 0 || item.average_efficiency > 0 || item.average_timeliness > 0) ? (
            <ResponsiveContainer>
              <BarChart
                data={data}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey={"task_name"}></XAxis>
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "13px",
                    paddingTop: "10px",
                  }}
                />
                <Bar dataKey="average_quantity" fill={CHART_COLORS.QUANTITY} name="Quantity" radius={[6, 6, 0, 0]} />
                <Bar dataKey="average_efficiency" fill={CHART_COLORS.EFFICIENCY} name="Efficiency" radius={[6, 6, 0, 0]} />
                <Bar dataKey="average_timeliness" fill={CHART_COLORS.TIMELINESS} name="Timeliness" radius={[6, 6, 0, 0]} />
                <Bar dataKey="overall_average" fill={CHART_COLORS.AVERAGE} name="Overall Avg" radius={[6, 6, 0, 0]} />
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
