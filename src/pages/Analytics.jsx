import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Typography,
} from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'
import Swal from 'sweetalert2'
import HistoricalPerformanceChart from '../components/Charts/HistoricalPerformanceChart'
import ComparativeAnalyticsChart from '../components/Charts/ComparativeAnalyticsChart'
import { getDepartments } from '../services/departmentService'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Analytics() {
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    loadDepartments()
  }, [])

  async function loadDepartments() {
    setLoading(true)
    try {
      const res = await getDepartments()
      const deptsList = res.data || []
      setDepartments(deptsList)
      if (deptsList.length > 0) {
        setSelectedDepartment(deptsList[0])
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleDepartmentChange(e) {
    const selected = departments.find(d => d.id === e.target.value)
    setSelectedDepartment(selected)
  }

  function handleRefresh() {
    setRefreshTrigger(prev => prev + 1)
    Swal.fire({ title: 'Refreshed', text: 'All charts have been refreshed', icon: 'success', timer: 2000 })
  }

  function handleTabChange(event, newValue) {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Performance Analytics
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Historical analysis and comparative benchmarking
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Department Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Select Department
            </Typography>
            <Select
              fullWidth
              value={selectedDepartment?.id || ''}
              onChange={handleDepartmentChange}
              size="small"
              disabled={loading}
            >
              {departments.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : departments.length > 0 ? (
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Historical Performance" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Comparative Analytics" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {selectedDepartment && (
              <HistoricalPerformanceChart department={selectedDepartment} refreshTrigger={refreshTrigger} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {departments.length > 0 && (
              <ComparativeAnalyticsChart departments={departments} refreshTrigger={refreshTrigger} />
            )}
          </TabPanel>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No departments available</Typography>
        </Paper>
      )}
    </Box>
  )
}
