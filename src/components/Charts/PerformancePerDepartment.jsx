import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getPerformancePerDepartment, getPopulationCount } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function PerformancePerDepartment() {
  const [data, setData] = useState(null)
  
    async function loadRatioDepartment() {
        var res = await getPerformancePerDepartment().then(data => data.data).catch(error => {
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
      loadRatioDepartment()
    }, [])

  return (
    <div className="graph" style={{gridTemplateColumns:" span 2"}}>
      <h4>Average Performance per Department</h4>
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data? data : []}
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="value" domain={[0, 5]}/>
          <YAxis type="category" dataKey="name"/>
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" name="Average Performance" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    
  );
}
