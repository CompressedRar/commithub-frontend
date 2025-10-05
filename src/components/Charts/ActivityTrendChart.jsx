import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Swal from "sweetalert2";
import { getActivityTrend } from "../../services/tableServices";

export default function ActivityTrendChart() {
    const [data, setData] = useState([]);

    async function loadPerformance() {
            var res = await getActivityTrend().then(data => data.data).catch(error => {
                  console.log(error.response.data.error)
                  Swal.fire({
                      title: "Error",
                      text: error.response.data.error,
                      icon: "error"
                  })
              })
      
              setData(res)
              console.log(res)
        }

  useEffect(() => {
    loadPerformance()

  }, []);

  return (
    <div style={{gridColumn:"span 2", height:"200px"}} className="graph">
      <h4 className="text-lg font-semibold mb-4 text-gray-700">System Activity Over Time</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data? data: []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#36a2eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
