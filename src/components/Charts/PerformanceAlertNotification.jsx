import React, { useState, useEffect } from 'react'
import {
  Badge,
  Popover,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Stack,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
} from '@mui/material'
import { Notifications as BellIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material'
import Swal from 'sweetalert2'
import {
  getActiveAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  formatAlertData,
} from '../../services/analyticsService'

export default function PerformanceAlertNotification({ socket, refreshTrigger, onAlertsChange }) {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [detailsVisible, setDetailsVisible] = useState(false)

  const popoverOpen = Boolean(popoverAnchorEl)

  useEffect(() => {
    loadAlerts()

    // Set up Socket.IO listener for real-time alerts
    if (socket) {
      socket.on('performance_alert', (data) => {
        handleNewAlert(data)
      })

      return () => {
        socket.off('performance_alert', handleNewAlert)
      }
    }
  }, [socket, refreshTrigger])

  function handleNewAlert(alertData) {
    // Add new alert to the beginning of the list
    const newAlert = {
      id: alertData.alert_id,
      userId: alertData.user_id,
      departmentId: alertData.department_id,
      metric: alertData.metric_type,
      currentValue: alertData.current_value,
      threshold: alertData.threshold,
      level: alertData.alert_level,
      message: alertData.message,
      read: false,
      createdAt: new Date(alertData.created_at),
      isNew: true,
    }

    setAlerts(prev => [newAlert, ...prev])
    setUnreadCount(prev => prev + 1)

    // Show toast notification
    if (alertData.alert_level === 'critical') {
      Swal.fire({
        icon: 'error',
        title: 'Critical Alert',
        text: alertData.message,
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 5000,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Performance Alert',
        text: alertData.message,
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 5000,
      })
    }

    // Call parent callback
    if (onAlertsChange) {
      onAlertsChange(newAlert)
    }
  }

  async function loadAlerts() {
    setLoading(true)
    try {
      const res = await getActiveAlerts()
      const rawAlerts = res.data?.data || []
      const formatted = formatAlertData(rawAlerts)
      setAlerts(formatted)
      setUnreadCount(formatted.filter(a => a.isNew).length)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(alertId) {
    try {
      await markAlertAsRead(alertId)
      setAlerts(alerts.map(a =>
        a.id === alertId ? { ...a, read: true, isNew: false } : a
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAlertsAsRead()
      setAlerts(alerts.map(a => ({ ...a, read: true, isNew: false })))
      setUnreadCount(0)
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  async function handleDeleteAlert(alertId) {
    try {
      await deleteAlert(alertId)
      setAlerts(alerts.filter(a => a.id !== alertId))
      Swal.fire({ title: 'Success', text: 'Alert deleted', icon: 'success' })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' })
    }
  }

  function getAlertColor(level) {
    return level === 'critical' ? 'error' : 'warning'
  }

  function getAlertIcon(level) {
    return level === 'critical' ? '⚠️' : 'ℹ️'
  }

  const popoverContent = (
    <Box sx={{ width: '350px', maxHeight: '500px', overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Performance Alerts
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>

      {alerts.length > 0 ? (
        <List sx={{ p: 0 }}>
          {alerts.slice(0, 10).map((alert, idx) => (
            <Box key={alert.id}>
              <ListItem
                sx={{
                  py: 1,
                  px: 2,
                  backgroundColor: alert.isNew ? '#fef2f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: alert.isNew ? '#fef2f0' : '#f5f5f5',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <span>{getAlertIcon(alert.level)}</span>
                      <Chip
                        label={alert.level.toUpperCase()}
                        color={getAlertColor(alert.level)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="caption"
                        component="p"
                        sx={{ cursor: 'pointer', mt: 0.5 }}
                        onClick={() => {
                          setSelectedAlert(alert)
                          setDetailsVisible(true)
                          setPopoverAnchorEl(null)
                        }}
                      >
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {alert.createdAt.toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                  {!alert.read && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (window.confirm('Delete this alert?')) {
                        handleDeleteAlert(alert.id)
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </ListItem>
              {idx < Math.min(10, alerts.length) - 1 && <Divider />}
            </Box>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="textSecondary">No new alerts</Typography>
        </Box>
      )}

      {alerts.length > 10 && (
        <Box sx={{ textAlign: 'center', p: 1, fontSize: '12px', color: '#999', borderTop: 1, borderColor: 'divider' }}>
          +{alerts.length - 10} more alerts
        </Box>
      )}
    </Box>
  )

  return (
    <>
      <Box>
        <Badge badgeContent={unreadCount} color="error">
          <IconButton
            onClick={(e) => setPopoverAnchorEl(e.currentTarget)}
            sx={{ fontSize: '18px' }}
          >
            <BellIcon sx={{ fontSize: '24px' }} />
          </IconButton>
        </Badge>
      </Box>

      <Popover
        open={popoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={() => setPopoverAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {popoverContent}
      </Popover>

      <Dialog
        open={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAlert && (
            <>
              <Alert
                severity={selectedAlert.level === 'critical' ? 'error' : 'warning'}
                sx={{ mb: 2 }}
              >
                {selectedAlert.level.toUpperCase()} ALERT: {selectedAlert.message}
              </Alert>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Metric Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                    {selectedAlert.metric}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Alert Level
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedAlert.level.toUpperCase()}
                      color={getAlertColor(selectedAlert.level)}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Current Value
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                    {selectedAlert.currentValue.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Threshold
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                    {selectedAlert.threshold.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Created At
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                    {selectedAlert.createdAt.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                    {selectedAlert.read ? 'Read' : 'Unread'}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {selectedAlert && !selectedAlert.read && (
            <Button
              onClick={() => {
                handleMarkAsRead(selectedAlert.id)
                setDetailsVisible(false)
              }}
            >
              Mark as Read
            </Button>
          )}
          <Button
            color="error"
            onClick={() => {
              if (selectedAlert && window.confirm('Are you sure? This cannot be undone.')) {
                handleDeleteAlert(selectedAlert.id)
                setDetailsVisible(false)
              }
            }}
          >
            Delete
          </Button>
          <Button onClick={() => setDetailsVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
