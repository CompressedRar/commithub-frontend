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
  Tabs,
  Tab,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material'
import { Save, Refresh, Edit, Delete, Add } from '@mui/icons-material'
import Swal from 'sweetalert2'
import {
  getAlertConfig,
  updateAlertConfig,
  getDepartmentKPIs,
  createCustomKPI,
  updateCustomKPI,
  deleteCustomKPI,
  triggerManualAlertCheck,
  triggerKPICheck,
} from '../services/analyticsService'
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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AlertSettings() {
  const [alertConfig, setAlertConfig] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [departmentKPIs, setDepartmentKPIs] = useState([])
  const [kpiModalVisible, setKpiModalVisible] = useState(false)
  const [editingKPI, setEditingKPI] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [configFormData, setConfigFormData] = useState({
    quantity_warning: '',
    quantity_critical: '',
    efficiency_warning: '',
    efficiency_critical: '',
    timeliness_warning: '',
    timeliness_critical: '',
    alert_to_roles: [],
    daily_check_time: '',
  })
  const [kpiFormData, setKpiFormData] = useState({
    kpi_name: '',
    description: '',
    target_value: '',
    alert_threshold: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedDepartment) {
      loadDepartmentKPIs(selectedDepartment)
    }
  }, [selectedDepartment])

  async function loadData() {
    setLoading(true)
    try {
      const [configRes, deptsRes] = await Promise.all([
        getAlertConfig(),
        getDepartments()
      ])
      setAlertConfig(configRes.data || {})
      setDepartments(deptsRes.data || [])
      if (deptsRes.data?.data?.length > 0) {
        setSelectedDepartment(deptsRes.data.data[0].id)
      }

      const thresholds = configRes.data?.data?.alert_thresholds || {}
      setConfigFormData({
        quantity_warning: thresholds.quantity_warning || '',
        quantity_critical: thresholds.quantity_critical || '',
        efficiency_warning: thresholds.efficiency_warning || '',
        efficiency_critical: thresholds.efficiency_critical || '',
        timeliness_warning: thresholds.timeliness_warning || '',
        timeliness_critical: thresholds.timeliness_critical || '',
        alert_to_roles: thresholds.alert_to_roles || [],
        daily_check_time: thresholds.daily_check_time || '',
      })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function loadDepartmentKPIs(deptId) {
    try {
      const res = await getDepartmentKPIs(deptId)
      setDepartmentKPIs(res.data?.data || [])
    } catch (error) {
      console.error('Error loading KPIs:', error)
    }
  }

  async function handleSaveConfig() {
    setSavingConfig(true)
    try {
      await updateAlertConfig({
        alert_thresholds: configFormData,
        kpi_definitions: alertConfig?.kpi_definitions || {}
      })
      Swal.fire({ title: 'Success', text: 'Alert configuration saved', icon: 'success' })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    } finally {
      setSavingConfig(false)
    }
  }

  function openKPIModal(kpi = null) {
    setEditingKPI(kpi)
    if (kpi) {
      setKpiFormData({
        kpi_name: kpi.kpi_name,
        description: kpi.description,
        target_value: kpi.target_value.toString(),
        alert_threshold: kpi.alert_threshold.toString(),
      })
    } else {
      setKpiFormData({
        kpi_name: '',
        description: '',
        target_value: '',
        alert_threshold: '',
      })
    }
    setKpiModalVisible(true)
  }

  async function handleSaveKPI() {
    try {
      if (!kpiFormData.kpi_name || !kpiFormData.target_value || !kpiFormData.alert_threshold) {
        Swal.fire({ title: 'Error', text: 'Please fill in required fields', icon: 'error' })
        return
      }

      const values = {
        kpi_name: kpiFormData.kpi_name,
        description: kpiFormData.description,
        target_value: parseFloat(kpiFormData.target_value),
        alert_threshold: parseFloat(kpiFormData.alert_threshold),
      }

      if (editingKPI) {
        await updateCustomKPI(editingKPI.id, values)
        Swal.fire({ title: 'Success', text: 'KPI updated', icon: 'success' })
      } else {
        await createCustomKPI(selectedDepartment, values)
        Swal.fire({ title: 'Success', text: 'KPI created', icon: 'success' })
      }
      loadDepartmentKPIs(selectedDepartment)
      setKpiModalVisible(false)
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  async function handleDeleteKPI(kpiId) {
    try {
      await deleteCustomKPI(kpiId)
      Swal.fire({ title: 'Success', text: 'KPI deleted', icon: 'success' })
      loadDepartmentKPIs(selectedDepartment)
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  async function handleManualCheck() {
    try {
      const res = await triggerManualAlertCheck()
      Swal.fire({
        title: 'Alert Check Completed',
        html: `<div style="text-align: left;">
          <p><strong>Quantity Alerts:</strong> ${res.data.alerts_generated?.quantity || 0}</p>
          <p><strong>Efficiency Alerts:</strong> ${res.data.alerts_generated?.efficiency || 0}</p>
          <p><strong>Timeliness Alerts:</strong> ${res.data.alerts_generated?.timeliness || 0}</p>
          <p><strong>Total:</strong> ${res.data.alerts_generated?.total || 0}</p>
        </div>`,
        icon: 'success'
      })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  async function handleKPICheck() {
    try {
      const res = await triggerKPICheck()
      Swal.fire({
        title: 'KPI Check Completed',
        html: `<div style="text-align: left;">
          <p><strong>Critical KPIs Found:</strong> ${res.data.critical_kpis_checked || 0}</p>
          <p><strong>Alerts Generated:</strong> ${res.data.alerts_generated || 0}</p>
        </div>`,
        icon: 'success'
      })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Alert Configuration & KPI Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Configure alert thresholds and manage custom KPIs
        </Typography>
      </Paper>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          aria-label="alert settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Alert Thresholds" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Office KPIs" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <CircularProgress
            sx={{
              display: loading ? 'flex' : 'none',
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: 1,
            }}
          />

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Configure Alert Thresholds
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Set the warning and critical thresholds for performance metrics. Values below warning level trigger warnings, below critical level trigger critical alerts.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#f0f2f5' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Quantity Thresholds
                  </Typography>
                  <TextField
                    fullWidth
                    label="Warning Level"
                    type="number"
                    value={configFormData.quantity_warning}
                    onChange={(e) => setConfigFormData({ ...configFormData, quantity_warning: e.target.value })}
                    margin="normal"
                    inputProps={{ step: 0.1 }}
                  />
                  <TextField
                    fullWidth
                    label="Critical Level"
                    type="number"
                    value={configFormData.quantity_critical}
                    onChange={(e) => setConfigFormData({ ...configFormData, quantity_critical: e.target.value })}
                    margin="normal"
                    inputProps={{ step: 0.1 }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#fef2f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Efficiency Thresholds
                  </Typography>
                  <TextField
                    fullWidth
                    label="Warning Level"
                    type="number"
                    value={configFormData.efficiency_warning}
                    onChange={(e) => setConfigFormData({ ...configFormData, efficiency_warning: e.target.value })}
                    margin="normal"
                    inputProps={{ step: 0.1 }}
                  />
                  <TextField
                    fullWidth
                    label="Critical Level"
                    type="number"
                    value={configFormData.efficiency_critical}
                    onChange={(e) => setConfigFormData({ ...configFormData, efficiency_critical: e.target.value })}
                    margin="normal"
                    inputProps={{ step: 0.1 }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#f6ffed' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Timeliness Thresholds
                  </Typography>
                  <TextField
                    fullWidth
                    label="Warning Level"
                    type="number"
                    value={configFormData.timeliness_warning}
                    onChange={(e) => setConfigFormData({ ...configFormData, timeliness_warning: e.target.value })}
                    margin="normal"
                    inputProps={{ step: 0.1 }}
                  />
                  <TextField
                    fullWidth
                    label="Critical Level"
                    type="number"
                    value={configFormData.timeliness_critical}
                    onChange={(e) => setConfigFormData({ ...configFormData, timeliness_critical: e.target.value })}
                    margin="normal"
                    inputProps={{ step: 0.1 }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#e6f7ff' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Alert Recipients
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Roles to Notify
                    </Typography>
                    <Select
                      multiple
                      fullWidth
                      value={configFormData.alert_to_roles}
                      onChange={(e) => setConfigFormData({ ...configFormData, alert_to_roles: e.target.value })}
                      size="small"
                    >
                      <MenuItem value="administrator">Super Admin</MenuItem>
                      <MenuItem value="head">Office Head</MenuItem>
                      <MenuItem value="president">Admin</MenuItem>
                    </Select>
                  </Box>
                  <TextField
                    fullWidth
                    label="Daily Check Time"
                    type="time"
                    value={configFormData.daily_check_time}
                    onChange={(e) => setConfigFormData({ ...configFormData, daily_check_time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Paper>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSaveConfig}
                disabled={savingConfig}
              >
                {savingConfig ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => loadData()}
              >
                Reset
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Manual Alert Checks
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleManualCheck}
                  sx={{ py: 1.5 }}
                >
                  Run Metric Alert Check
                </Button>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                  Checks all Office performance metrics against thresholds
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleKPICheck}
                  sx={{ py: 1.5 }}
                >
                  Run KPI Check
                </Button>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                  Checks all custom KPIs for critical status
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CircularProgress
            sx={{
              display: loading ? 'flex' : 'none',
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: 1,
            }}
          />

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Manage Custom KPIs
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => openKPIModal()}
                size="small"
              >
                New KPI
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Select Office
              </Typography>
              <Select
                fullWidth
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                size="small"
              >
                {departments.map(d => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>KPI Name</TableCell>
                    <TableCell align="right">Target</TableCell>
                    <TableCell align="right">Current</TableCell>
                    <TableCell align="right">Alert Threshold</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentKPIs.map((kpi) => (
                    <TableRow key={kpi.id}>
                      <TableCell>{kpi.kpi_name}</TableCell>
                      <TableCell align="right">{Number(kpi.target_value).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(kpi.current_value).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(kpi.alert_threshold).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            type="text"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => openKPIModal(kpi)}
                            variant="text"
                          >
                            Edit
                          </Button>
                          <Button
                            type="text"
                            danger
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => {
                              if (window.confirm('Are you sure?')) {
                                handleDeleteKPI(kpi.id)
                              }
                            }}
                            variant="text"
                            color="error"
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Dialog
            open={kpiModalVisible}
            onClose={() => setKpiModalVisible(false)}
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
                placeholder="e.g., Customer Satisfaction"
                value={kpiFormData.kpi_name}
                onChange={(e) => setKpiFormData({ ...kpiFormData, kpi_name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                placeholder="Optional description"
                value={kpiFormData.description}
                onChange={(e) => setKpiFormData({ ...kpiFormData, description: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Target Value"
                type="number"
                value={kpiFormData.target_value}
                onChange={(e) => setKpiFormData({ ...kpiFormData, target_value: e.target.value })}
                margin="normal"
                required
                inputProps={{ step: 0.1 }}
              />
              <TextField
                fullWidth
                label="Alert Threshold"
                type="number"
                value={kpiFormData.alert_threshold}
                onChange={(e) => setKpiFormData({ ...kpiFormData, alert_threshold: e.target.value })}
                margin="normal"
                required
                inputProps={{ step: 0.1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setKpiModalVisible(false)}>Cancel</Button>
              <Button onClick={handleSaveKPI} variant="contained" color="primary">
                {editingKPI ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
      </Paper>
    </Box>
  )
}
