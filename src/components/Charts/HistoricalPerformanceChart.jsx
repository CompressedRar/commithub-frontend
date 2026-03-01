import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Paper,
  Box,
  Grid,
  Button,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material'
import { FileDownload as FileDownloadIcon } from '@mui/icons-material'
import Swal from 'sweetalert2'
import {
  getPerformanceHistory,
  formatDateForAPI,
  formatHistoricalDataForChart,
  getDateRangeLastMonths,
} from '../../services/analyticsService'

const METRIC_TYPES = {
  average: { label: 'Overall Average', color: '#1890ff' },
  quantity: { label: 'Quantity', color: '#52c41a' },
  efficiency: { label: 'Efficiency', color: '#faad14' },
  timeliness: { label: 'Timeliness', color: '#f5222d' },
}

export default function HistoricalPerformanceChart({ department, refreshTrigger }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [metricType, setMetricType] = useState('average')
  const [startDate, setStartDate] = useState(() => {
    const range = getDateRangeLastMonths(12)
    return range.startDate.split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const range = getDateRangeLastMonths(12)
    return range.endDate.split('T')[0]
  })

  useEffect(() => {
    if (department?.id) {
      loadPerformanceHistory()
    }
  }, [department?.id, refreshTrigger])

  async function loadPerformanceHistory() {
    if (!startDate || !endDate) {
      Swal.fire({ title: 'Error', text: 'Please select a valid date range', icon: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await getPerformanceHistory(department.id, startDate, endDate, metricType)
      const rawData = res.data?.data || []

      if (rawData.length === 0) {
        setData([])
        setStats(null)
        return
      }

      const formatted = formatHistoricalDataForChart(rawData)
      setData(formatted)

      // Calculate statistics
      const values = formatted.map(d => d.value)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)
      const trend = values[values.length - 1] > values[0] ? 'improving' : 'declining'

      setStats({
        average: avg.toFixed(2),
        max,
        min,
        trend,
        count: values.length,
      })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleMetricChange(e) {
    setMetricType(e.target.value)
  }

  function handleStartDateChange(e) {
    setStartDate(e.target.value)
  }

  function handleEndDateChange(e) {
    setEndDate(e.target.value)
  }

  function exportToCSV() {
    if (!data || data.length === 0) {
      Swal.fire({ title: 'Warning', text: 'No data to export', icon: 'warning' })
      return
    }

    const headers = ['Date', 'Value']
    const csvContent = [
      headers.join(','),
      ...data.map(row => `${row.date},${row.value}`),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `performance-history-${department.id}-${Date.now()}.csv`)
    link.click()
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Historical Performance Analysis</Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={exportToCSV}
        >
          Export CSV
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Select
            fullWidth
            value={metricType}
            onChange={handleMetricChange}
            size="small"
          >
            {Object.entries(METRIC_TYPES).map(([key, val]) => (
              <MenuItem key={key} value={key}>
                {val.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={loadPerformanceHistory}
          >
            Load
          </Button>
        </Grid>
      </Grid>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Average
              </Typography>
              <Typography variant="h6">{stats.average}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Maximum
              </Typography>
              <Typography variant="h6">{stats.max.toFixed(2)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Minimum
              </Typography>
              <Typography variant="h6">{stats.min.toFixed(2)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Trend
              </Typography>
              <Typography variant="h6" sx={{ color: stats.trend === 'improving' ? 'green' : 'red' }}>
                {stats.trend}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={METRIC_TYPES[metricType].color}
                dot={false}
                name={METRIC_TYPES[metricType].label}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : !loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">No data available</Typography>
          </Box>
        ) : null}
      </Box>
    </Paper>
  )
}
