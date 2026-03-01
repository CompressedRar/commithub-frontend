import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Paper,
  Grid,
  Box,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import Swal from 'sweetalert2'
import {
  getComparativeAnalytics,
} from '../../services/analyticsService'

const METRIC_TYPES = {
  quantity: 'Quantity',
  efficiency: 'Efficiency',
  timeliness: 'Timeliness',
  average: 'Overall Average',
}

const METRIC_COLORS = {
  quantity: '#52c41a',
  efficiency: '#faad14',
  timeliness: '#f5222d',
  average: '#1890ff',
}

export default function ComparativeAnalyticsChart({ departments, refreshTrigger }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('average')
  const [selectedDepartments, setSelectedDepartments] = useState(
    departments.slice(0, Math.min(3, departments.length)).map(d => d.id)
  )

  useEffect(() => {
    if (selectedDepartments.length > 0) {
      loadComparativeAnalytics()
    }
  }, [selectedDepartments, selectedMetric, refreshTrigger])

  async function loadComparativeAnalytics() {
    setLoading(true)
    try {
      const res = await getComparativeAnalytics(selectedDepartments, selectedMetric, 'last_year')
      const rawData = res.data?.data || []

      if (rawData.length === 0) {
        setData([])
        return
      }

      setData(rawData)
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleDepartmentChange(e) {
    setSelectedDepartments(e.target.value)
  }

  function handleMetricChange(e) {
    setSelectedMetric(e.target.value)
  }

  // Sort data for ranking
  const sortedData = [...data].sort((a, b) => b[selectedMetric] - a[selectedMetric])
  const topPerformer = sortedData[0]
  const bottomPerformer = sortedData[sortedData.length - 1]
  const avgPerformance = data.length > 0
    ? (data.reduce((sum, d) => sum + d[selectedMetric], 0) / data.length).toFixed(2)
    : 0

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Comparative Analytics - Peer Benchmarking
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Select Departments
          </Typography>
          <Select
            multiple
            fullWidth
            value={selectedDepartments}
            onChange={handleDepartmentChange}
            size="small"
          >
            {departments.map(d => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Metric
          </Typography>
          <Select
            fullWidth
            value={selectedMetric}
            onChange={handleMetricChange}
            size="small"
          >
            {Object.entries(METRIC_TYPES).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {data.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: '#666' }}>
                Top Performer
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#52c41a', mt: 0.5 }}>
                {topPerformer?.department}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {topPerformer?.[selectedMetric].toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: '#666' }}>
                Average
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1890ff', mt: 0.5 }}>
                {METRIC_TYPES[selectedMetric]}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {avgPerformance}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                backgroundColor: '#fff1f0',
                border: '1px solid #ffa39e',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: '#666' }}>
                Bottom Performer
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#f5222d', mt: 0.5 }}>
                {bottomPerformer?.department}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {bottomPerformer?.[selectedMetric].toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}

      <Box sx={{ position: 'relative', minHeight: 300, mb: 3 }}>
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {data.length > 0 ? (
          <>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Performance Ranking by {METRIC_TYPES[selectedMetric]}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey={selectedMetric}
                  fill={METRIC_COLORS[selectedMetric]}
                  name={METRIC_TYPES[selectedMetric]}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="textSecondary">No data available</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Detailed Metrics
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Department</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Efficiency</TableCell>
                <TableCell align="right">Timeliness</TableCell>
                <TableCell align="right">Average</TableCell>
                <TableCell align="right">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow key={row.department_id}>
                  <TableCell>{row.department}</TableCell>
                  <TableCell align="right">{row.quantity.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.efficiency.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.timeliness.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {row.average.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={row.trend}
                      color={row.trend === 'improving' ? 'success' : row.trend === 'declining' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {data.length > 0 && (
        <Box sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            Percentile Ranking
          </Typography>
          {sortedData.map((dept, idx) => {
            const percentile = ((data.length - idx - 1) / data.length * 100).toFixed(0)
            return (
              <Box
                key={dept.department_id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: '1px solid #eee',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <span>{dept.department}</span>
                <span style={{ fontWeight: 'bold' }}>{percentile}th percentile</span>
              </Box>
            )
          })}
        </Box>
      )}
    </Paper>
  )
}
