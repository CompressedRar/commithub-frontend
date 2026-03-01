import api from "../components/api"

/**
 * Analytics Service
 * Handles all API calls for advanced analytics and performance tracking features
 */

// ==============================================================
// HISTORICAL PERFORMANCE ENDPOINTS
// ==============================================================

export async function getPerformanceHistory(
  departmentId,
  startDate,
  endDate,
  metricType = 'average'
) {
  try {
    const response = await api.get('/api/v1/chart/performance/history', {
      params: {
        department_id: departmentId,
        start_date: startDate,
        end_date: endDate,
        metric_type: metricType
      }
    })
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// TREND ANALYSIS ENDPOINTS
// ==============================================================

export async function getTrendAnalysis(departmentId, timeframe = 'monthly', periods = 12) {
  try {
    const response = await api.get('/api/v1/chart/performance/trends', {
      params: {
        department_id: departmentId,
        timeframe: timeframe,
        periods: periods
      }
    })
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// COMPARATIVE ANALYTICS ENDPOINTS
// ==============================================================

export async function getComparativeAnalytics(departmentIds, metricType = 'average', dateRange = null) {
  try {
    const response = await api.get('/api/v1/chart/performance/comparison', {
      params: {
        dept_ids: Array.isArray(departmentIds) ? departmentIds.join(',') : departmentIds,
        metric_type: metricType,
        date_range: dateRange
      }
    })
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// FORECAST ENDPOINTS
// ==============================================================

export async function getPerformanceForecast(departmentId, periodsAhead = 3) {
  try {
    const response = await api.get('/api/v1/chart/performance/forecast', {
      params: {
        department_id: departmentId,
        periods_ahead: periodsAhead
      }
    })
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// KPI STATUS ENDPOINTS
// ==============================================================

export async function getKPIStatus(departmentId) {
  try {
    const response = await api.get('/api/v1/chart/kpi/status', {
      params: {
        department_id: departmentId
      }
    })
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// USER PERFORMANCE HISTORY ENDPOINTS
// ==============================================================

export async function getUserPerformanceHistory(userId, startDate = null, endDate = null) {
  try {
    const response = await api.get('/api/v1/chart/user/performance-history', {
      params: {
        user_id: userId,
        start_date: startDate,
        end_date: endDate
      }
    })
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// ALERT CONFIGURATION ENDPOINTS
// ==============================================================

export async function getAlertConfig() {
  try {
    const response = await api.get('/api/v1/alerts/config')
    return response
  } catch (error) {
    throw error
  }
}

export async function updateAlertConfig(config) {
  try {
    const response = await api.patch('/api/v1/alerts/config', config)
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// KPI MANAGEMENT ENDPOINTS
// ==============================================================

export async function getDepartmentKPIs(departmentId) {
  try {
    const response = await api.get(`/api/v1/alerts/kpi/${departmentId}`)
    return response
  } catch (error) {
    throw error
  }
}

export async function createCustomKPI(departmentId, kpiData) {
  try {
    const response = await api.post(`/api/v1/alerts/kpi/${departmentId}`, kpiData)
    return response
  } catch (error) {
    throw error
  }
}

export async function updateCustomKPI(kpiId, kpiData) {
  try {
    const response = await api.patch(`/api/v1/alerts/kpi/${kpiId}`, kpiData)
    return response
  } catch (error) {
    throw error
  }
}

export async function updateKPIValue(kpiId, currentValue) {
  try {
    const response = await api.patch(`/api/v1/alerts/kpi/${kpiId}/value`, {
      current_value: currentValue
    })
    return response
  } catch (error) {
    throw error
  }
}

export async function deleteCustomKPI(kpiId) {
  try {
    const response = await api.delete(`/api/v1/alerts/kpi/${kpiId}`)
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// ALERT RETRIEVAL AND MANAGEMENT
// ==============================================================

export async function getActiveAlerts() {
  try {
    const response = await api.get('/api/v1/alerts/active')
    return response
  } catch (error) {
    throw error
  }
}

export async function getAlertHistory() {
  try {
    const response = await api.get('/api/v1/alerts/history')
    return response
  } catch (error) {
    throw error
  }
}

export async function markAlertAsRead(alertId) {
  try {
    const response = await api.patch(`/api/v1/alerts/${alertId}/read`)
    return response
  } catch (error) {
    throw error
  }
}

export async function markAllAlertsAsRead() {
  try {
    const response = await api.patch('/api/v1/alerts/mark-all-read')
    return response
  } catch (error) {
    throw error
  }
}

export async function deleteAlert(alertId) {
  try {
    const response = await api.delete(`/api/v1/alerts/${alertId}`)
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// MANUAL TRIGGER ENDPOINTS (Admin only)
// ==============================================================

export async function triggerManualAlertCheck() {
  try {
    const response = await api.post('/api/v1/alerts/check-now')
    return response
  } catch (error) {
    throw error
  }
}

export async function triggerKPICheck() {
  try {
    const response = await api.post('/api/v1/alerts/check-kpis')
    return response
  } catch (error) {
    throw error
  }
}

// ==============================================================
// UTILITY FUNCTIONS
// ==============================================================

/**
 * Format date for API calls (YYYY-MM-DD format)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
export function formatDateForAPI(date) {
  if (typeof date === 'string') return date
  if (!(date instanceof Date)) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Parse API date string to Date object
 * @param {string} dateString - Date string from API
 * @returns {Date} Date object
 */
export function parseDateFromAPI(dateString) {
  return new Date(dateString)
}

/**
 * Calculate date range (last N months)
 * @param {number} months - Number of months back
 * @returns {object} {startDate, endDate} with formatted strings
 */
export function getDateRangeLastMonths(months = 12) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate)
  }
}

/**
 * Calculate date range (last N quarters)
 * @param {number} quarters - Number of quarters back
 * @returns {object} {startDate, endDate} with formatted strings
 */
export function getDateRangeLastQuarters(quarters = 4) {
  const months = quarters * 3
  return getDateRangeLastMonths(months)
}

/**
 * Parse historical data into format suitable for charts
 * @param {array} rawData - Raw data from API
 * @returns {array} Formatted data for Recharts
 */
export function formatHistoricalDataForChart(rawData) {
  if (!Array.isArray(rawData)) return []

  return rawData.map(item => ({
    date: item.date || item.period || item.name,
    value: parseFloat(item.value) || 0,
    actual: parseFloat(item.actual) || 0,
    forecast: parseFloat(item.forecast) || 0,
    moving_avg_3: item.moving_avg_3 !== null ? parseFloat(item.moving_avg_3) : undefined,
    moving_avg_6: item.moving_avg_6 !== null ? parseFloat(item.moving_avg_6) : undefined
  }))
}

/**
 * Parse trend data with moving averages
 * @param {array} rawData - Raw trend data from API
 * @returns {array} Formatted data for charts
 */
export function formatTrendDataForChart(rawData) {
  if (!Array.isArray(rawData)) return []

  return rawData.map(item => ({
    period: item.period,
    actual: parseFloat(item.actual) || 0,
    moving_avg_3: item.moving_avg_3 !== null ? parseFloat(item.moving_avg_3) : null,
    moving_avg_6: item.moving_avg_6 !== null ? parseFloat(item.moving_avg_6) : null,
    forecast: parseFloat(item.forecast) || 0,
    trend: item.trend_direction || 'stable'
  }))
}

/**
 * Parse KPI data
 * @param {array} rawData - Raw KPI data
 * @returns {array} Formatted KPI array
 */
export function formatKPIData(rawData) {
  if (!Array.isArray(rawData)) return []

  return rawData.map(item => ({
    id: item.id,
    name: item.kpi_name,
    currentValue: parseFloat(item.current_value) || 0,
    targetValue: parseFloat(item.target_value) || 0,
    threshold: parseFloat(item.alert_threshold) || 0,
    variance: parseFloat(item.variance_pct) || 0,
    status: item.status || 'on_track',
    description: item.description
  }))
}

/**
 * Parse alert data
 * @param {array} rawData - Raw alert data
 * @returns {array} Formatted alert array
 */
export function formatAlertData(rawData) {
  if (!Array.isArray(rawData)) return []

  return rawData.map(item => ({
    id: item.id,
    userId: item.user_id,
    departmentId: item.department_id,
    metric: item.metric_type,
    currentValue: parseFloat(item.current_value) || 0,
    threshold: parseFloat(item.threshold) || 0,
    level: item.alert_level,
    message: item.message,
    read: item.read,
    createdAt: new Date(item.created_at),
    isNew: !item.read
  }))
}
