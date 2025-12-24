import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import Swal from "sweetalert2";
import { getActivityTrend } from "../../services/tableServices";
import CHART_COLORS from "./chartColors";

export default function ActivityTrendChart() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadPerformance() {
    try {
      const res = await getActivityTrend();
      const cleanData = res.data.map(d => ({
        name: d.name,
        value: Number(d.value),
      }));

      setData(cleanData);
      computeStats(cleanData);
    } catch (error) {
      Swal.fire("Error", "Failed to load activity trend", "error");
    }
  }

  function computeStats(data) {
    if (!data.length) return;

    const values = data.map(d => d.value);
    const first = values[0];
    const last = values[values.length - 1];
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const peak = Math.max(...values);
    const change = first > 0
      ? (((last - first) / first) * 100).toFixed(0)
      : 0;

    setStats({
      current: last,
      avg,
      peak,
      change,
    });
  }

  useEffect(() => {
    loadPerformance();
  }, []);

  return (
    <div className="card border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              System Activity Trend
            </small>
            {stats ? (
              <>
                <h4 className="fw-bold mb-0">
                  {stats.current.toFixed(2)} Activity Score
                </h4>
                <small className="text-muted">
                  Avg: {stats.avg} | Peak: {stats.peak}
                </small>
              </>
            ) : (
              <p className="fw-bold mb-0">No Data</p>
            )}
          </div>

          {stats && (
            <div className="text-end">
              <div
                className={`fw-semibold ${
                  stats.change >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {stats.change >= 0 ? "↗" : "↘"} {Math.abs(stats.change)}%
              </div>
              <small className="text-muted">period change</small>
            </div>
          )}
        </div>

        {/* Chart */}
        <h6 className="fw-semibold text-secondary mb-2">
          Activity Performance Over Time
        </h6>

        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.LINE}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
