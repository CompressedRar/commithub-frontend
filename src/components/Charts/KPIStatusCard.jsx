import React, { useState, useEffect } from 'react'
import {
  Paper,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography,
  Chip,
  LinearProgress,
  Stack,
} from '@mui/material'
import { Edit, Delete, Add, Save } from '@mui/icons-material'
import Swal from 'sweetalert2'
import {
  getKPIStatus,
  getDepartmentKPIs,
  createCustomKPI,
  updateCustomKPI,
  updateKPIValue,
  deleteCustomKPI,
} from '../../services/analyticsService'

const STATUS_COLORS = {
  on_track: { color: 'success', text: 'On Track' },
  at_risk: { color: 'warning', text: 'At Risk' },
  critical: { color: 'error', text: 'Critical' },
}

export default function KPIStatusCard({ department, refreshTrigger, onRefresh }) {
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingKPI, setEditingKPI] = useState(null)
  const [formData, setFormData] = useState({
    kpi_name: '',
    description: '',
    target_value: '',
    alert_threshold: '',
  })

  useEffect(() => {
    if (department?.id) {
      loadKPIs()
    }
  }, [department?.id, refreshTrigger])

  async function loadKPIs() {
    setLoading(true)
    try {
      const res = await getDepartmentKPIs(department.id)
      setKpis(res.data?.data || [])
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteKPI(kpiId) {
    try {
      await deleteCustomKPI(kpiId)
      setKpis(kpis.filter(k => k.id !== kpiId))
      Swal.fire({ title: 'Success', text: 'KPI deleted successfully', icon: 'success' })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  async function handleUpdateKPIValue(kpiId, newValue) {
    try {
      const res = await updateKPIValue(kpiId, newValue)
      loadKPIs()
      Swal.fire({
        title: 'Success',
        text: `KPI updated. ${res.data.alerts_generated} alerts generated.`,
        icon: 'success',
      })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  function openCreateModal() {
    setEditingKPI(null)
    setFormData({
      kpi_name: '',
      description: '',
      target_value: '',
      alert_threshold: '',
    })
    setModalVisible(true)
  }

  function openEditModal(kpi) {
    setEditingKPI(kpi)
    setFormData({
      kpi_name: kpi.kpi_name,
      description: kpi.description,
      target_value: kpi.target_value.toString(),
      alert_threshold: kpi.alert_threshold.toString(),
    })
    setModalVisible(true)
  }

  async function handleModalSubmit() {
    try {
      if (!formData.kpi_name || !formData.target_value || !formData.alert_threshold) {
        Swal.fire({ title: 'Error', text: 'Please fill in all required fields', icon: 'error' })
        return
      }

      const values = {
        kpi_name: formData.kpi_name,
        description: formData.description,
        target_value: parseFloat(formData.target_value),
        alert_threshold: parseFloat(formData.alert_threshold),
      }

      if (editingKPI) {
        await updateCustomKPI(editingKPI.id, values)
        Swal.fire({ title: 'Success', text: 'KPI updated successfully', icon: 'success' })
      } else {
        await createCustomKPI(department.id, values)
        Swal.fire({ title: 'Success', text: 'KPI created successfully', icon: 'success' })
      }

      setModalVisible(false)
      loadKPIs()
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  function getStatusColor(status) {
    return STATUS_COLORS[status] || STATUS_COLORS.on_track
  }

  function getProgressColor(status) {
    if (status === 'on_track') return '#52c41a'
    if (status === 'at_risk') return '#faad14'
    return '#f5222d'
  }

  function calculateProgress(current, target) {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Custom KPIs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={openCreateModal}
          size="small"
        >
          New KPI
        </Button>
      </Box>

      <CircularProgress
        sx={{
          display: loading ? 'flex' : 'none',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {kpis.length > 0 ? (
        <Grid container spacing={2}>
          {kpis.map(kpi => {
            const progress = calculateProgress(kpi.current_value, kpi.target_value)
            const statusColor = getStatusColor(kpi.status)
            const progressColor = getProgressColor(kpi.status)

            return (
              <Grid item xs={12} sm={6} md={4} key={kpi.id}>
                <Paper
                  sx={{
                    p: 2,
                    borderLeft: `4px solid ${progressColor}`,
                    height: '100%',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                  elevation={1}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1, mr: 1 }}>
                      {kpi.kpi_name}
                    </Typography>
                    <Chip
                      label={statusColor.text}
                      color={statusColor.color}
                      size="small"
                    />
                  </Box>

                  {kpi.description && (
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                      {kpi.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '12px' }}>
                      <span>Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progressColor,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f0f2f5', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '12px' }}>
                      <span style={{ color: '#666' }}>Current:</span>
                      <span style={{ fontWeight: 'bold' }}>{kpi.current_value.toFixed(2)}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '12px' }}>
                      <span style={{ color: '#666' }}>Target:</span>
                      <span style={{ fontWeight: 'bold' }}>{kpi.target_value.toFixed(2)}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#666' }}>Variance:</span>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: kpi.variance_pct > 0 ? '#f5222d' : '#52c41a',
                        }}
                      >
                        {kpi.variance_pct.toFixed(1)}%
                      </span>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, p: 1, backgroundColor: '#fff7e6', borderRadius: 1, fontSize: '12px' }}>
                    Alert Threshold: <strong>{kpi.alert_threshold.toFixed(2)}</strong>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Save />}
                      fullWidth
                      onClick={() => {
                        const newValue = prompt('Enter new value:', kpi.current_value.toString())
                        if (newValue !== null) {
                          handleUpdateKPIValue(kpi.id, parseFloat(newValue))
                        }
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      fullWidth
                      onClick={() => openEditModal(kpi)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      fullWidth
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this KPI?')) {
                          handleDeleteKPI(kpi.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="textSecondary">
            No KPIs defined for this department
          </Typography>
        </Box>
      )}

      <Dialog
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingKPI ? 'Edit KPI' : 'Create New KPI'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="KPI Name"
            placeholder="e.g., Customer Satisfaction Score"
            value={formData.kpi_name}
            onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Target Value"
            placeholder="Target value"
            type="number"
            value={formData.target_value}
            onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
            margin="normal"
            required
            inputProps={{ step: 0.1 }}
          />
          <TextField
            fullWidth
            label="Alert Threshold"
            placeholder="Value below which alerts are triggered"
            type="number"
            value={formData.alert_threshold}
            onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
            margin="normal"
            required
            inputProps={{ step: 0.1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalVisible(false)}>Cancel</Button>
          <Button onClick={handleModalSubmit} variant="contained" color="primary">
            {editingKPI ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
