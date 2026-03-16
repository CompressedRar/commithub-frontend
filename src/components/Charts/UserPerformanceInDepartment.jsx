import { useEffect, useState, } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import { 
  Box, Card, CardContent, Typography, Stack, 
  Skeleton, useTheme, Paper, Divider, Chip
} from "@mui/material";
import { 
  TrendingUp as UpIcon, 
  TrendingDown as DownIcon,
  Analytics as AnalyticsIcon
} from "@mui/icons-material";
import { getUserPerformanceInDepartment } from "../../services/tableServices";
import Swal from "sweetalert2";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={4} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, borderBottom: '1px solid', pb: 0.5, borderColor: 'divider' }}>
          {payload[0].payload.name}
        </Typography>
        <Stack direction="row" justifyContent="space-between" spacing={3}>
          <Typography variant="caption" color="text.secondary">Performance Rating:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{payload[0].value.toFixed(2)}</Typography>
        </Stack>
      </Paper>
    );
  }
  return null;
};

export default function TopUserPerformanceInDepartment({ dept_id }) {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({ top: null, average: 0, diff: 0 });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  async function loadUserPerformance() {
    setLoading(true);
    try {
      const res = await getUserPerformanceInDepartment(dept_id);
      const performanceData = res.data || [];
      
      // Sort data by value for a formal "Ranked" appearance
      const sortedData = [...performanceData].sort((a, b) => b.value - a.value);
      setData(sortedData);

      if (sortedData.length > 0) {
        const total = sortedData.reduce((sum, d) => sum + d.value, 0);
        const avg = total / sortedData.length;
        const highest = sortedData[0];
        const diffPercent = avg !== 0 ? ((highest.value - avg) / avg) * 100 : 0;

        setMetrics({
          top: highest,
          average: avg.toFixed(2),
          diff: diffPercent.toFixed(1)
        });
      }
    } catch (error) {
      Swal.fire("System Error", "Unable to retrieve analytical data.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUserPerformance(); }, [dept_id]);

  if (loading) return <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1, borderColor: 'divider', bgcolor: '#fff' }}>
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AnalyticsIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.primary' }}>
            Personnel Performance Analysis
          </Typography>
        </Stack>
      </Box>

      <CardContent sx={{ pt: 3 }}>
        {/* METRICS GRID */}
        <Stack direction="row" spacing={0} divider={<Divider orientation="vertical" flexItem />} sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>LEAD PERFORMANCE</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{metrics.top?.value.toFixed(2) || "0.00"}</Typography>
            <Chip label={metrics.top?.name || "N/A"} size="small" variant="outlined" sx={{ mt: 1, height: 20, fontSize: '0.65rem' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>DEPT. AVERAGE</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>{metrics.average}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>VARIANCE</Typography>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ color: metrics.diff >= 0 ? 'success.dark' : 'error.main' }}>
              {metrics.diff >= 0 ? <UpIcon fontSize="inherit" /> : <DownIcon fontSize="inherit" />}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{Math.abs(metrics.diff)}%</Typography>
            </Stack>
          </Box>
        </Stack>

        {/* CHART AREA */}
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 5, right: 35, left: 10, bottom: 5 }}>
              <CartesianGrid stroke={theme.palette.divider} horizontal={false} strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                domain={[0, 5]} 
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: theme.palette.text.primary, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              
              {/* Formal Reference Line for Average */}
              <ReferenceLine x={metrics.average} stroke="#666" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: '#666', fontSize: 10 }} />
              
              <Bar dataKey="value" barSize={14} radius={[0, 2, 2, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#1e3a8a' : '#94a3b8'} // Dark blue for top, slate for others
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}