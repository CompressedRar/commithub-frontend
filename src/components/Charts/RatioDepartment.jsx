import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getPopulationCount } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

const COLORS = CHART_COLORS.PIE_PALETTE;

export default function RatioDepartment() {

  const [data, setData] = useState(null)

  async function loadRatioDepartment() {
      var res = await getPopulationCount().then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        setData(res)
  }

  useEffect(()=> {
    loadRatioDepartment()
  }, [])
  
  
  if (!data || data.length === 0) {
    return (
      <div style={{ width: "100%", height: "400px" }} className="d-flex align-items-center justify-content-center">
        <div className="text-center">
          <p className="text-muted">No department data available</p>
          <small className="text-secondary">Chart will display when departments are assigned</small>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "400px"}}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={data? data: []}             
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >

                    {data && data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                    <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
}
