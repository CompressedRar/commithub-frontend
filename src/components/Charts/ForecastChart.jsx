import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  Area,
  AreaChart,
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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import Swal from 'sweetalert2'
import {
  getPerformanceForecast,
} from '../../services/analyticsService'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Paper sx={{ p: 1.25, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="caption">
          <strong>{data.period}</strong>
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: '#1890ff' }}>
          Forecast: {data.forecasted_value.toFixed(2)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: '#faad14', fontSize: '11px' }}>
          Lower: {data.confidence_lower.toFixed(2)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: '#faad14', fontSize: '11px' }}>
          Upper: {data.confidence_upper.toFixed(2)}
        </Typography>
      </Paper>
    )
  }
  return null
}

export default function ForecastChart({ department, refreshTrigger }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [periodsAhead, setPeriodsAhead] = useState(3)
  const [forecastSummary, setForecastSummary] = useState(null)

  useEffect(() => {
    if (department?.id) {
      loadForecast()
    }
  }, [department?.id, periodsAhead, refreshTrigger])

  async function loadForecast() {
    setLoading(true)
    try {
      const res = await getPerformanceForecast(department.id, periodsAhead)
      const rawData = res.data?.data || []

      if (rawData.length === 0) {
        setData([])
        setForecastSummary(null)
        return
      }

      // Format data for display
      const formatted = rawData.map((item, idx) => ({
        period: `Period ${item.period}`,
        forecasted_value: item.forecasted_value,
        confidence_lower: item.confidence_lower,
        confidence_upper: item.confidence_upper,
        confidence_level: item.confidence_level,
      }))

      setData(formatted)

      // Create forecast summary
      if (formatted.length > 0) {
        const first = formatted[0]
        const last = formatted[formatted.length - 1]
        const change = last.forecasted_value - first.forecasted_value
        const changePercent = (change / first.forecasted_value * 100).toFixed(2)

        setForecastSummary({
          firstForecast: first.forecasted_value.toFixed(2),
          lastForecast: last.forecasted_value.toFixed(2),
          change: change.toFixed(2),
          changePercent,
          trend: change > 0 ? 'improving' : 'declining',
          confidence: (first.confidence_level * 100).toFixed(0),
        })
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setData([])
        setForecastSummary(null)
        Swal.fire({
          title: 'Insufficient Data',
          text: 'Not enough historical data available for forecasting. Please wait for more performance data to be recorded.',
          icon: 'info',
        })
      } else {
        Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  function handlePeriodsChange(e) {
    setPeriodsAhead(parseInt(e.target.value))
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Performance Forecast
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Forecast Periods
          </Typography>
          <Select
            fullWidth
            value={periodsAhead}
            onChange={handlePeriodsChange}
            size="small"
          >
            <MenuItem value={3}>3 Periods</MenuItem>
            <MenuItem value={6}>6 Periods</MenuItem>
            <MenuItem value={12}>12 Periods</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {forecastSummary && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            This forecast is based on historical trends with {forecastSummary.confidence}% confidence level. Actual performance may vary.
          </Alert>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 1.5,
                  backgroundColor: '#f0f2f5',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#666' }}>
                  First Forecast
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {forecastSummary.firstForecast}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 1.5,
                  backgroundColor: '#f0f2f5',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Last Forecast
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {forecastSummary.lastForecast}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 1.5,
                  backgroundColor: '#f0f2f5',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Total Change
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: forecastSummary.change > 0 ? '#52c41a' : '#f5222d',
                  }}
                >
                  {forecastSummary.change}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 1.5,
                  backgroundColor: '#f0f2f5',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Percent Change
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: forecastSummary.changePercent > 0 ? '#52c41a' : '#f5222d',
                  }}
                >
                  {forecastSummary.changePercent}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </>
      )}

      <Box sx={{ position: 'relative', minHeight: 350, mb: 3 }}>
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
              Forecasted Performance Trend
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="confidence_lower"
                  fill="#faad14"
                  stroke="none"
                  opacity={0.2}
                  name="Confidence Range"
                />
                <Area
                  type="monotone"
                  dataKey="confidence_upper"
                  fill="#faad14"
                  stroke="none"
                  opacity={0.2}
                />
                <Line
                  type="monotone"
                  dataKey="forecasted_value"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ fill: '#1890ff', r: 4 }}
                  name="Forecasted Value"
                />
              </AreaChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 3, p: 2, backgroundColor: '#fafafa', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                Forecast Details
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Forecast</TableCell>
                      <TableCell align="right">Lower Bound</TableCell>
                      <TableCell align="right">Upper Bound</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.period}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {row.forecasted_value.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#999' }}>
                          {row.confidence_lower.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#999' }}>
                          {row.confidence_upper.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="textSecondary">No forecast data available</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
