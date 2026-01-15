import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getActivityScatter } from "../../services/tableServices";
import CHART_COLORS from "./chartColors";


export default function ActivityScatter() {
  const [data, setData] = useState([]);

  async function loadScatterData() {
    try {
      const res = await getActivityScatter();
      const rawData = res.data;

      console.log(rawData)

      // Convert day names to numeric Y-axis positions
      const dayMapping = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
      };

      const formatted = rawData.map(d => ({
        x: d.hour,
        y: dayMapping[d.day],
        z: d.count,
        day: d.day
      }));

      setData(formatted);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load scatter data", "error");
    }
  }

  useEffect(() => {
    loadScatterData();
  }, []);

  const yLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!data || data.length === 0) {
    return (
      <div style={{ gridColumn: "span 2", height: "500px" }} className="graph d-flex align-items-center justify-content-center">
        <div className="text-center">
          <p className="text-muted mb-2">No activity data available</p>
          <small className="text-secondary">Charts will display when data is recorded</small>
        </div>
      </div>
    );
  }

  return (
    <div style={{ gridColumn:"span 2", height:"500px"}} className="graph">
      <ResponsiveContainer>
        <ScatterChart
        
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="Hour"
            domain={[0, 23]}
            ticks={[0, 3, 6, 9, 12, 15, 18, 21]}
            label={{ value: "Hour of Day", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Day"
            tickFormatter={(v) => yLabels[v]}
            domain={[0, 6]}
            label={{ value: "Day of Week", angle: -90, position: "insideLeft" }}
          />
          <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Log Count" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name, props) => {
              if (name === "z") return [`${value} logs`, "Count"];
              return value;
            }}
            labelFormatter={(label) => `Hour ${label}`}
          />
          <Scatter name="User Activity" data={data? data: []} fill={CHART_COLORS.SCATTER} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
