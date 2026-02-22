import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import Swal from "sweetalert2";
import { getActivityTrend } from "../../services/tableServices";
import CHART_COLORS from "./chartColors";

export default function ActivityTrendChart() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly');
  const [rawData, setRawData] = useState([]);
  const timeframes = ['daily', 'weekly', 'monthly', 'yearly'];

  async function loadPerformance() {
    try {
      const res = await getActivityTrend();
      const cleanData = res.data.map(d => ({
        name: d.name,
        value: Number(d.value),
      }));

      setRawData(cleanData);
      processDataByTimeframe(cleanData, timeframe);
    } catch (error) {
      Swal.fire("Error", "Failed to load activity trend", "error");
    }
  }

  function processDataByTimeframe(allData, frame) {
    let processed = [];
    
    if (frame === 'all') {
      processed = allData;
    } else if (frame === 'daily') {
      processed = groupByDay(allData);
    } else if (frame === 'weekly') {
      processed = groupByWeek(allData);
    } else if (frame === 'monthly') {
      processed = groupByMonth(allData);
    } else if (frame === 'yearly') {
      processed = groupByYear(allData);
    }

    setData(processed);
    computeStats(processed);
  }

  function parseDate(dateString) {
    // Try to parse various date formats
    const date = new Date(dateString);
    if (!isNaN(date)) return date;
    
    // Fallback for other formats
    return new Date(dateString);
  }

  function groupByDay(data) {
    const grouped = {};
    
    data.forEach(item => {
      const date = parseDate(item.name);
      const dayKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = { values: [], key: dayKey };
      }
      grouped[dayKey].values.push(item.value);
    });

    return Object.values(grouped).map(group => ({
      name: group.key,
      value: Math.round(group.values.reduce((a, b) => a + b, 0) / group.values.length),
    }));
  }

  function groupByWeek(data) {
    const grouped = {};
    
    data.forEach(item => {
      const date = parseDate(item.name);
      const year = date.getFullYear();
      const weekNum = getWeekNumber(date);
      const weekKey = `${year} W${weekNum}`;
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = { values: [], key: weekKey };
      }
      grouped[weekKey].values.push(item.value);
    });

    return Object.values(grouped).map(group => ({
      name: group.key,
      value: Math.round(group.values.reduce((a, b) => a + b, 0) / group.values.length),
    }));
  }

  function groupByMonth(data) {
    const grouped = {};
    
    data.forEach(item => {
      const date = parseDate(item.name);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = { values: [], key: monthKey };
      }
      grouped[monthKey].values.push(item.value);
    });

    return Object.values(grouped).map(group => ({
      name: group.key,
      value: Math.round(group.values.reduce((a, b) => a + b, 0) / group.values.length),
    }));
  }

  function groupByYear(data) {
    const grouped = {};
    
    data.forEach(item => {
      const date = parseDate(item.name);
      const yearKey = date.getFullYear().toString();
      
      if (!grouped[yearKey]) {
        grouped[yearKey] = { values: [], key: yearKey };
      }
      grouped[yearKey].values.push(item.value);
    });

    return Object.values(grouped).map(group => ({
      name: group.key,
      value: Math.round(group.values.reduce((a, b) => a + b, 0) / group.values.length),
    }));
  }

  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  function computeStats(data) {
    if (!data.length) return;

    const values = data.map(d => d.value);
    const first = values[0];
    const last = values[values.length - 1];
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const peak = Math.max(...values);
    const change = first > 0
      ? (((last - first) / first) * 100).toFixed(0)
      : 0;

    setStats({
      current: last,
      avg,
      peak,
      change,
    });
  }

  useEffect(() => {
    loadPerformance();
  }, []);

  useEffect(() => {
    if (rawData.length > 0) {
      processDataByTimeframe(rawData, timeframe);
    }
  }, [timeframe]);

  return (
    <div className="card border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">
              System Activity Trend ({timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})
            </small>
            {stats ? (
              <>
                <h4 className="fw-bold mb-0">
                  {stats.current.toFixed(2)} Activity Score
                </h4>
                <small className="text-muted">
                  Avg: {stats.avg} | Peak: {stats.peak}
                </small>
              </>
            ) : (
              <p className="fw-bold mb-0">No Data</p>
            )}
          </div>

          {stats && (
            <div className="text-end">
              <div
                className={`fw-semibold ${
                  stats.change >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {stats.change >= 0 ? "↗" : "↘"} {Math.abs(stats.change)}%
              </div>
              <small className="text-muted">period change</small>
            </div>
          )}
        </div>

        {/* Timeframe Filters */}
        <div className="d-flex gap-2 mb-3">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={`btn btn-sm ${
                timeframe === tf
                  ? 'btn-secondary'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>

        {/* Chart */}
        <h6 className="fw-semibold text-secondary mb-2">
          Activity Performance Over Time
        </h6>

        <div style={{ width: "100%", height: 280 }}>
          {!data || data.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <p className="text-muted">No activity trend data available</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.LINE}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
