import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
  { name: "Registrar", Quantity: 4, Efficiency: 5, Timeliness: 4, Average: 4 },
  { name: "IT Dept", Quantity: 3, Efficiency: 4, Timeliness: 2, Average: 3 },
  { name: "Comittee Chairmanship Assignment", Quantity: 4, Efficiency: 3, Timeliness: 4, Average: 4 },
];

export default function SubmissionsChart() {
  return (
    <div style={{width:"100%", height: "400px"}}>
        <ResponsiveContainer>
            <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Quantity" fill="#82ca9d" />
            <Bar dataKey="Efficiency" fill="#8884d8" />
            <Bar dataKey="Timeliness" fill="#cfd300ff" />
            <Bar dataKey="Average" fill="#1105f0ff" />
            </BarChart>
        </ResponsiveContainer>
    </div>
    
  );
}
