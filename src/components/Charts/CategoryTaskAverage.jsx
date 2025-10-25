import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Swal from "sweetalert2";
import { getCategoryTaskAverage } from "../../services/tableServices";
import { socket } from "../api";

export default function CategoryTaskAverages({ cat_id }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadData() {
    try {
      const res = await getCategoryTaskAverage(cat_id);
      const summaryData = res.data;
      setData(summaryData);
      console.log("category-task-average", summaryData);

      if (summaryData && summaryData.length > 0) {
        // Calculate overall and top task stats
        const totalAvg = summaryData.reduce((sum, d) => sum + d.overall_average, 0);
        const avgAll = totalAvg / summaryData.length;
        const highest = summaryData.reduce((max, d) =>
          d.overall_average > max.overall_average ? d : max
        );
        const diffPercent = ((highest.overall_average - avgAll) / avgAll) * 100;

        setStats({
          task: highest.task_name,
          value: parseFloat(highest.overall_average).toFixed(2),
          diff: diffPercent.toFixed(2),
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load category task averages", "error");
    }
  }

  useEffect(() => {
    loadData();
    socket.on("ipcr", () => loadData());
  }, []);

  return (
    <div className="border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header + Stats */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Top Rated Task in Category
            </small>
            {stats ? (
              <>
                <h4 className="fw-bold mb-0">{stats.task}</h4>
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
          Task Rating Summary per Category
        </h6>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              
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
              <Bar dataKey="average_quantity" fill="#36A2EB" name="Quantity" radius={[6, 6, 0, 0]} />
              <Bar dataKey="average_efficiency" fill="#FF6384" name="Efficiency" radius={[6, 6, 0, 0]} />
              <Bar dataKey="average_timeliness" fill="#FFCE56" name="Timeliness" radius={[6, 6, 0, 0]} />
              <Bar dataKey="overall_average" fill="#4CAF50" name="Overall Avg" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
