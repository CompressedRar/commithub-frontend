import { useEffect, useState } from "react";
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
import Swal from "sweetalert2";
import { getAllTaskAverage } from "../../services/tableServices";
import { socket } from "../api";

export default function AllTaskAverages() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadData() {
    try {
      const res = await getAllTaskAverage();
      const chartData = res.data;
      setData(chartData);

      if (chartData && chartData.length > 0) {
        // Compute the task with the highest overall average
        const totalAvg = chartData.reduce(
          (sum, t) => sum + t.overall_average,
          0
        );
        const avgAll = totalAvg / chartData.length;
        const highest = chartData.reduce((max, t) =>
          t.overall_average > max.overall_average ? t : max
        );
        const diffPercent =
          ((highest.overall_average - avgAll) / avgAll) * 100;

        setStats({
          task: highest.task_name,
          value: highest.overall_average.toFixed(2),
          diff: diffPercent.toFixed(2),
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load all task averages", "error");
    }
  }

  useEffect(() => {
    loadData();
    socket.on("ipcr", () => {
      loadData();
    });
  }, []);

  return (
    <div className="card shadow-sm border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header + Stats */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Top Rated Task
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
          All Task Rating Summary
        </h6>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="task_name"
                angle={-25}
                fontSize={0}
                textAnchor="end"
                interval={0}
              />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="average_quantity"
                fill="#36A2EB"
                name="Quantity"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="average_efficiency"
                fill="#FF6384"
                name="Efficiency"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="average_timeliness"
                fill="#FFCE56"
                name="Timeliness"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="overall_average"
                fill="#4CAF50"
                name="Overall Avg"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
