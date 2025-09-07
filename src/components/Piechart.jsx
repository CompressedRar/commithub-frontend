import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Faculty", value: 50 },
  { name: "Admin Staff", value: 20 },
  { name: "Heads", value: 10 },
  { name: "Deans", value: 5 },
  { name: "President", value: 1 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1"];

export default function UsersPieChart() {
  return (
    <div style={{ width: "100%", height: "100%"}}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={data}
                    
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
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
