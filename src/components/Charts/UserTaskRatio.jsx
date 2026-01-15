import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { getUserTaskRatio } from "../../services/tableServices";
import CHART_COLORS from "./chartColors";

const COLORS = CHART_COLORS.PIE_PALETTE;

const DepartmentChart = ({ mainTaskId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from your backend API
    const fetchData = async () => {
      try {
        const response = await getUserTaskRatio(mainTaskId);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching department stats:", error);
      }
    };

    fetchData();
  }, [mainTaskId]);

  if (!data || data.length === 0) {
    return (
      <div className="graph d-flex align-items-center justify-content-center">
        <p className="text-muted">No user task ratio data available</p>
      </div>
    );
  }

  return (
    <div className="graph">
      <ResponsiveContainer width="100%" height="100%">
        {/* PIE CHART */}
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend></Legend>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentChart;
