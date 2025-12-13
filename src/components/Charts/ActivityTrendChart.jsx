import { useEffect, useState } from "react";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";
import Swal from "sweetalert2";
import { getActivityTrend } from "../../services/tableServices";
import CHART_COLORS from "./chartColors";

export default function ActivityTrendChart() {
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");

  async function loadPerformance() {
    try {
      const res = await getActivityTrend();
      setData(res.data);
      calculateInsight(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error.response?.data?.error || error.message);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Something went wrong",
        icon: "error",
      });
    }
  }

  // Calculate numerical insights
  function calculateInsight(data) {
    if (!data.length) {
      setInsight("No activity data available.");
      return;
    }

    const values = data.map((d) => d.value);
    const first = values[0];
    const last = values[values.length - 1];
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const change = (((last - first) / first) * 100).toFixed(2);

    setInsight(
      `Change: ${change > 0 ? "+" : ""}${change}% | Max: ${max} | Min: ${min} | Avg: ${avg}`
    );
  }

  useEffect(() => {
    loadPerformance();
  }, []);

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title text-primary">System Activity Over Time</h5>
        <div style={{ width: "100%", height: "250px" }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              {/* Grid removed */}
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.LINE}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-muted fst-italic">{insight}</p>
      </div>
    </div>
  );
}
