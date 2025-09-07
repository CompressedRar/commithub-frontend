import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Registrar", IPCR: 30, OPCR: 20 },
  { name: "IT Dept", IPCR: 40, OPCR: 35 },
  { name: "Finance", IPCR: 20, OPCR: 15 },
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
            <Bar dataKey="IPCR" fill="#82ca9d" />
            <Bar dataKey="OPCR" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    </div>
    
  );
}
