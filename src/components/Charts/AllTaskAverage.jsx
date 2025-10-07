import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Swal from "sweetalert2";
import { getAllTaskAverage} from "../../services/tableServices";
import { socket } from "../api";


export default function AllTaskAverages() {
  const [data, setData] = useState([]);

  async function loadData() {
    try {
      const res = await getAllTaskAverage(); // your API call
      setData(res.data);
      console.log("all-task-average", res.data)
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load all task averages", "error");
    }
  }

  useEffect(() => {
    loadData();

    socket.on("ipcr", ()=> {
        loadData()
    })
  }, []);

  return (
    <div className="graph" style={{ height: "450px", gridColumn:"span 2" }}>
      <h3 className="text-center mb-4 font-semibold">All Task Rating Summary </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="task_name"
            angle={-30}
            textAnchor="end"
            interval={0}
            display={"none"}
          />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="average_quantity" fill="#36A2EB" name="Quantity" />
          <Bar dataKey="average_efficiency" fill="#FF6384" name="Efficiency" />
          <Bar dataKey="average_timeliness" fill="#FFCE56" name="Timeliness" />
          <Bar dataKey="overall_average" fill="#4CAF50" name="Overall Avg" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
