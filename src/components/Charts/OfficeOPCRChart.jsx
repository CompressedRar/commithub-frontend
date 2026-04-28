import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell
} from 'recharts'
import { getDepartmentsOPCR } from '../../services/analyticsService'
import { Card, CardHeader, CardContent, Box, Typography, IconButton, Button, CircularProgress } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'white', border: '1px solid #ddd', padding: 8 }}>
      <div style={{ fontWeight: 700 }}>{d.department_name}</div>
      <div>Days spent: {d.days_spent === null ? 'N/A' : d.days_spent}</div>
      <div>OPCR created: {d.opcr_created_at || 'N/A'}</div>
      <div>OPCR id: {d.opcr_id || 'N/A'}</div>
    </div>
  )
}

export default function OfficeOPCRChart({ height = 320 }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const res = await getDepartmentsOPCR()
      const payload = res && res.data ? res.data.data || res.data : res
      if (!Array.isArray(payload)) {
        setData([])
      } else {
        const mapped = payload.map(item => ({
          department_id: item.department_id,
          department_name: item.department_name,
          opcr_id: item.opcr_id,
          opcr_created_at: item.opcr_created_at,
          days_spent: item.days_spent === null || item.days_spent === undefined ? null : Number(item.days_spent)
        }))
        // sort by days_spent descending (nulls last)
        mapped.sort((a, b) => {
          if (a.days_spent === null) return 1
          if (b.days_spent === null) return -1
          return b.days_spent - a.days_spent
        })
        setData(mapped)
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    if (mounted) loadData()
    return () => {
      mounted = false
    }
  }, [])

  const handleRefresh = () => {
    loadData()
  }

  // compute fastest office (smallest non-null days_spent)
  const fastest = data.filter(d => d.days_spent !== null && !isNaN(d.days_spent)).reduce((min, cur) => {
    if (!min) return cur
    return cur.days_spent < min.days_spent ? cur : min
  }, null)

  if (loading) {
    return (
      <Card>
        <CardHeader title="OPCR Planning — Days to create OPCR" action={<IconButton onClick={handleRefresh}><RefreshIcon /></IconButton>} />
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" style={{ height }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="OPCR Planning — Days to create OPCR" action={<IconButton onClick={handleRefresh}><RefreshIcon /></IconButton>} />
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader title="OPCR Planning — Days to create OPCR" action={<IconButton onClick={handleRefresh}><RefreshIcon /></IconButton>} />
        <CardContent>
          <Typography>No OPCR data available.</Typography>
        </CardContent>
      </Card>
    )
  }

  const maxDays = Math.max(...data.map(d => (d.days_spent === null ? 0 : d.days_spent)))

  return (
    <Card>
      <CardHeader
        title="OPCR Planning — Days to create OPCR"
        subheader={
          fastest ? `Fastest: ${fastest.department_name} — ${fastest.days_spent} day(s)` : 'No completed OPCRs yet'
        }
        action={<IconButton onClick={handleRefresh}><RefreshIcon /></IconButton>}
      />
      <CardContent>
        <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">Departments: {data.length}</Typography>
            {fastest && (
              <Box mt={0.5}>
                <Typography variant="body2">Fastest office to create OPCR:</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">{fastest.department_name}</Typography>
                  <Typography color="textSecondary">{fastest.days_spent} day(s)</Typography>
                  <Button size="small" variant="outlined" disabled={!fastest.opcr_id}
                    onClick={() => {
                      const currentUrl = new URL(window.location.href);

                      const parentUrl = new URL('./', currentUrl).href;

                      console.log(parentUrl + `opcr/${fastest.opcr_id}`)
                      window.location.replace(parentUrl + `opcr/${fastest.opcr_id}`); 
                    }} rel="noopener noreferrer">
                    View OPCR
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 20, right: 20, left: 80, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, Math.max(maxDays, 10)]} />
              <YAxis dataKey="department_name" type="category" width={180} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="days_spent" isAnimationActive={false}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.days_spent === null ? '#eee' : entry.days_spent === 0 ? '#f6c23e' : '#4e73df'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
