import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getUserTaskAverage } from "../../services/tableServices";

export default function TaskUserAverageBar({ taskId }) {
  const [data, setData] = useState([]);

  async function loadUserAverages() {
    try {
      const res = await getUserTaskAverage(taskId);
      const users = res.data;

      // Format data for Recharts
      const formatted = users.map((u, i) => ({
        name: u.name || `User ${i + 1}`,
        average: u.overall_average,
      }));

      setData(formatted);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load user averages", "error");
    }
  }

  useEffect(() => {
    if (taskId) loadUserAverages();
  }, [taskId]);

  return (
    <div className="graph">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="horizontal" // ← makes it horizontal
        >
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis type="number" domain={[0, 5]}  />
          <XAxis dataKey="name" type="category" display={"none"} />
          <Tooltip />
          <Legend />
          <Bar dataKey="average" fill="#4f46e5" name="Overall Average" barSize={20}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
