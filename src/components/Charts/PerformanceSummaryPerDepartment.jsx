import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getPerformanceSummary, getPopulationCount, getUserPerformanceInDepartment } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function PerformanceSummaryPerDepartment() {
  const [data, setData] = useState(null)
  
    async function loadPerformance() {
        var res = await getPerformanceSummary().then(data => data.data).catch(error => {
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

    useEffect(()=> {
      loadPerformance()
    }, [])

  return (
    <div className="graph" style={{gridColumn:"span 1.5"}}>
      <h4 className="text-xl font-semibold mb-4">
        Performance Summary Per Department
      </h4>
        <ResponsiveContainer>
        <BarChart
          data={data? data: []}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Quantity" fill="#82ca9d" />
          <Bar dataKey="Efficiency" fill="#8884d8" />
          <Bar dataKey="Timeliness" fill="#ffc658" />
          <Bar dataKey="Average" fill="#36a2eb" />
        </BarChart>
      </ResponsiveContainer>


    </div>
    
  );
}
