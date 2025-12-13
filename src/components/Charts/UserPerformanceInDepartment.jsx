import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getPopulationCount, getUserPerformanceInDepartment } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

export default function UserPerformanceInDepartment(props) {
  const [data, setData] = useState(null)
  
    async function loadPerformance() {
        var res = await getUserPerformanceInDepartment(props.dept_id).then(data => data.data).catch(error => {
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
    <div className="graph">
      <h4 className="text-xl font-semibold mb-4">
        Average User Performance in Department
      </h4>
        <ResponsiveContainer width="100%">
          <BarChart
            layout="horizontal"
            data={data ? data : []}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS.SECONDARY} name="Average Performance" />
          </BarChart>
        </ResponsiveContainer>


    </div>
    
  );
}
