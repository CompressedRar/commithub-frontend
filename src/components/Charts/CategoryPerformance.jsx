import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { getCategoryPerformance, getMainTaskPerformance } from "../../services/tableServices";
import { socket } from "../api";

// Colors for donut charts
const COLORS = ["#0088FE", "#f3f3f3ff"];

function pickColor(value){
    console.log("vale", value)
    if(value == 5){
        return "#0088FE"
    }
    else if (value < 5 && value >= 4){
        return "#33fe00ff"
    }
    else if (value <= 3.99 && value >= 3){
        return "#fafe00ff"
    }
    else if (value <= 2.99 && value >= 2){
        return "#ff9f22ff"
    }
    else if (value <= 1.99 && value >= 1){
        return "#ff3c22ff"
    }
    else {
        return "#ac0000ff"
    }
}

const DonutChart = ({ title, value }) => {
  const data = [
    { name: title, value },
    { name: "Remaining", value: 5 - value } // assuming max rating is 5
  ];

  return (
    <div style={{ width: "200px", height: "200px", textAlign: "center" }}>
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            paddingAngle={5}
            
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index == 0? pickColor(entry.value):COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const CategoryPerformanceCharts = ({ categoryId }) => {
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCategoryPerformance(categoryId)
        setPerformance(response.data);
        console.log(categoryId)
      } catch (error) {
        console.error("Error fetching category performance:", error);
      }
    };

    fetchData();

    socket.on("ipcr", ()=>{
        fetchData()
    })
  }, [categoryId]);

  if (!performance) return <div>Loading...</div>;

  return (
    <div className="summary-performance">
      <DonutChart title="Quantity" value={performance.quantity} />
      <DonutChart title="Efficiency" value={performance.efficiency} />
      <DonutChart title="Timeliness" value={performance.timeliness} />
      <DonutChart title="Overall Average" value={performance.overall_average} />
    </div>
  );
};

export const MainTaskPerformanceCharts = ({ mainTaskID }) => {
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMainTaskPerformance(mainTaskID)
        setPerformance(response.data);
        console.log(categoryId)
      } catch (error) {
        console.error("Error fetching category performance:", error);
      }
    };

    fetchData();

    socket.on("ipcr", ()=>{
        fetchData()
    })
  }, [mainTaskID]);

  if (!performance) return <div>Loading...</div>;

  return (
    <div className="summary-performance" style={{height:"500px"}}>
      <DonutChart title="Quantity" value={performance.quantity} />
      <DonutChart title="Efficiency" value={performance.efficiency} />
      <DonutChart title="Timeliness" value={performance.timeliness} />
      <DonutChart title="Overall Average" value={performance.overall_average} />
    </div>
  );
};

export default CategoryPerformanceCharts;
