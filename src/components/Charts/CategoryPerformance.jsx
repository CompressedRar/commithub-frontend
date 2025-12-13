import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Swal from "sweetalert2";
import {
  getCategoryPerformance,
  getMainTaskPerformance,
  getTopPerformingDepartment,
} from "../../services/tableServices";
import { socket } from "../api";
import CHART_COLORS from "./chartColors";

// Utility: dynamic color based on rating value
function pickColor(value) {
  if (value >= 5) return "#0088FE";
  if (value >= 4) return "#33FE00";
  if (value >= 3) return "#FAFE00";
  if (value >= 2) return "#FF9F22";
  if (value >= 1) return "#FF3C22";
  return "#AC0000";
}

// Reusable Donut Chart
const DonutChart = ({ title, value }) => {
  const data = [
    { name: title, value },
    { name: "Remaining", value: Math.max(5 - value, 0) },
  ];

  return (
    <div style={{ width: "180px", height: "180px", textAlign: "center" }}>
      <h6 className="fw-semibold text-secondary mb-2">{title}</h6>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={75}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={i === 0 ? CHART_COLORS.AVERAGE : "#f3f3f3"} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(2)} / 5`} />
        </PieChart>
      </ResponsiveContainer>
      <p className="fw-bold mb-0">{value?.toFixed(2) ?? "0.00"}</p>
    </div>
  );
};

// Shared layout wrapper for any performance chart group
const PerformanceCard = ({ title, performance }) => {
  if (!performance) return <div>Loading...</div>;

  const metrics = [
    { name: "Quantity", value: performance.quantity },
    { name: "Efficiency", value: performance.efficiency },
    { name: "Timeliness", value: performance.timeliness },
    { name: "Overall Average", value: performance.overall_average },
  ];

  // Compute insights
  const avg =
    metrics.reduce((sum, m) => sum + (m.value || 0), 0) / metrics.length;
  const top = metrics.reduce((max, m) => (m.value > max.value ? m : max));
  const diff = ((top.value - avg) / avg) * 100;

  return (
    <div className="py-5 border-0" style={{ borderRadius: "1rem" }}>
      <div className="">
        {/* Header & Insights */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              Top Rating Metric
            </small>
            <h4 className="fw-bold mb-0">{top.name}</h4>
            <p className="mb-0 fs-5 fw-semibold text-secondary">
              {top.value.toFixed(2)} / 5 average
            </p>
          </div>

          <div className="text-end">
            <div
              className={`d-flex align-items-center justify-content-end ${
                diff >= 0 ? "text-success" : "text-danger"
              } fw-semibold`}
            >
              <span className="material-symbols-outlined me-1">
                {diff >= 0 ? "arrow_upward" : "arrow_downward"}
              </span>
              {Math.abs(diff).toFixed(2)}%
            </div>
            <small className="text-muted">vs overall avg</small>
          </div>
        </div>

        <h6 className="fw-semibold text-secondary mb-2">{title}</h6>
        <div className="d-flex justify-content-around flex-wrap gap-2">
          {metrics.map((m, i) => (
            <DonutChart key={i} title={m.name} value={m.value} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== Category Performance =====
const CategoryPerformanceCharts = ({ categoryId }) => {
  const [performance, setPerformance] = useState(null);

  async function loadData() {
    try {
      const res = await getCategoryPerformance(categoryId);
      setPerformance(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load category performance", "error");
    }
  }

  useEffect(() => {
    loadData();
    socket.on("ipcr", loadData);
  }, [categoryId]);

  return (
    <PerformanceCard
      title="Office Output Performance Summary"
      performance={performance}
    />
  );
};
export default CategoryPerformanceCharts
// ===== Main Task Performance =====
export const MainTaskPerformanceCharts = ({ mainTaskID }) => {
  const [performance, setPerformance] = useState(null);

  async function loadData() {
    try {
      const res = await getMainTaskPerformance(mainTaskID);
      setPerformance(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load main task performance", "error");
    }
  }

  useEffect(() => {
    loadData();
    socket.on("ipcr", loadData);
  }, [mainTaskID]);

  return (
    <PerformanceCard
      title="Main Task Performance Summary"
      performance={performance}
    />
  );
};

// ===== Top Performing Department =====
export const TopDepartmentCharts = () => {
  const [performance, setPerformance] = useState(null);

  async function loadData() {
    try {
      const res = await getTopPerformingDepartment();
      setPerformance(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load top performing department", "error");
    }
  }

  useEffect(() => {
    loadData();
    socket.on("ipcr", loadData);
  }, []);

  return (
    <PerformanceCard
      title={`Top Performing Department: ${
        performance?.department ?? "Loading..."
      }`}
      performance={performance}
    />
  );
};
