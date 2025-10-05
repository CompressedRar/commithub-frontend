import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getPopulationCount } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function PopulationPerDepartment() {
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
          console.log(res)
    }
  
    useEffect(()=> {
      loadRatioDepartment()
    }, [])

  return (
    <div className="graph">
      <h4>Population Per Department</h4>
        <ResponsiveContainer>
            <BarChart data={data? data: []} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" name=" "/>
              <YAxis dataKey="value"/>
              <Tooltip />
              <Bar dataKey="value" fill="#3c70ffff" name = "Population"/>
            </BarChart>
        </ResponsiveContainer>
    </div>
    
  );
}
