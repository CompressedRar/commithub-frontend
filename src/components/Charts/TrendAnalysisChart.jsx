import React, { useState, useEffect } from 'react'
import {
  ComposedChart,
  Line,
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
} from '@mui/material'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'
import Swal from 'sweetalert2'
import {
  getTrendAnalysis,
  formatTrendDataForChart,
} from '../../services/analyticsService'

const TIMEFRAMES = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

const TREND_COLORS = {
  improving: { color: '#52c41a', icon: <ArrowUpward /> },
  declining: { color: '#f5222d', icon: <ArrowDownward /> },
  stable: { color: '#faad14', icon: '-' },
}

const CustomTooltip = (props) => {
  const { active, payload } = props
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Paper sx={{ p: 1.25, backgroundColor: '#fff', border: '1px solid #ccc' }}>
        <Typography variant="caption">Period: {data.period}</Typography>
        {data.actual !== undefined && (
          <Typography variant="caption" display="block">
            Actual: {data.actual.toFixed(2)}
          </Typography>
        )}
        {data.moving_avg_3 !== null && (
          <Typography variant="caption" display="block">
            MA3: {data.moving_avg_3.toFixed(2)}
          </Typography>
        )}
        {data.moving_avg_6 !== null && (
          <Typography variant="caption" display="block">
            MA6: {data.moving_avg_6.toFixed(2)}
          </Typography>
        )}
        {data.forecast && (
          <Typography variant="caption" display="block" sx={{ color: '#f5222d' }}>
            Forecast: {data.forecast}
          </Typography>
        )}
      </Paper>
    )
  }
  return null
}

export default function TrendAnalysisChart({ department, refreshTrigger }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [timeframe, setTimeframe] = useState('monthly')
  const [periods, setPeriods] = useState(12)
  const [trendSummary, setTrendSummary] = useState(null)

  useEffect(() => {
    if (department?.id) {
      loadTrendAnalysis()
    }
  }, [department?.id, timeframe, periods, refreshTrigger])

  async function loadTrendAnalysis() {
    setLoading(true)
    try {
      const res = await getTrendAnalysis(department.id, timeframe, periods)
      const rawData = res.data?.data || []

      if (rawData.length === 0) {
        setData([])
        setTrendSummary(null)
        return
      }

      const formatted = formatTrendDataForChart(rawData)
      setData(formatted)

      // Calculate trend summary
      const actualValues = formatted
        .filter(d => !d.forecast)
        .map(d => d.actual)

      if (actualValues.length > 0) {
        const firstValue = actualValues[0]
        const lastValue = actualValues[actualValues.length - 1]
        const growthRate = ((lastValue - firstValue) / firstValue) * 100

        let trend = 'stable'
        if (growthRate > 5) trend = 'improving'
        if (growthRate < -5) trend = 'declining'

        setTrendSummary({
          growthRate: growthRate.toFixed(2),
          trend,
          firstValue: firstValue.toFixed(2),
          lastValue: lastValue.toFixed(2),
          dataPoints: actualValues.length,
        })
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleTimeframeChange(value) {
    setTimeframe(value)
  }

  function handlePeriodsChange(value) {
    setPeriods(parseInt(value))
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Trend Analysis & Forecasting
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Timeframe
          </Typography>
          <Select
            fullWidth
            value={timeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            size="small"
          >
            {Object.entries(TIMEFRAMES).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Periods
          </Typography>
          <Select
            fullWidth
            value={periods.toString()}
            onChange={(e) => handlePeriodsChange(e.target.value)}
            size="small"
          >
            <MenuItem value="6">6 Periods</MenuItem>
            <MenuItem value="12">12 Periods</MenuItem>
            <MenuItem value="24">24 Periods</MenuItem>
            <MenuItem value="36">36 Periods</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {trendSummary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                p: 1.25,
                backgroundColor: '#f0f2f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: '#666' }}>
                Growth Rate
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {trendSummary.growthRate}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                p: 1.25,
                backgroundColor: '#f0f2f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: '#666' }}>
                Trend
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={trendSummary.trend.toUpperCase()}
                  color={
                    trendSummary.trend === 'improving'
                      ? 'success'
                      : trendSummary.trend === 'declining'
                      ? 'error'
                      : 'warning'
                  }
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                p: 1.25,
                backgroundColor: '#f0f2f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: '#666' }}>
                Start Value
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {trendSummary.firstValue}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                p: 1.25,
                backgroundColor: '#f0f2f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: '#666' }}>
                Latest Value
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {trendSummary.lastValue}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}

      <Box sx={{ position: 'relative', minHeight: 400 }}>
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
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="actual"
                fill="#1890ff"
                name="Actual Performance"
                opacity={0.7}
              />
              <Line
                type="monotone"
                dataKey="moving_avg_3"
                stroke="#52c41a"
                name="3-Period MA"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="moving_avg_6"
                stroke="#faad14"
                name="6-Period MA"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#f5222d"
                strokeDasharray="5 5"
                name="Forecast"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="textSecondary">No data available</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
