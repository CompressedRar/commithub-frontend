import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getPopulationCount } from "../../services/tableServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import CHART_COLORS from "./chartColors";

export default function PopulationPerDepartment() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  async function loadRatioDepartment() {
    try {
      const res = await getPopulationCount();
      const populationData = res.data;
      setData(populationData);

      if (populationData && populationData.length > 0) {
        const total = populationData.reduce((sum, d) => sum + d.value, 0);
        const avg = total / populationData.length;
        const highest = populationData.reduce((max, d) => (d.value > max.value ? d : max));
        const diffPercent = ((highest.value - avg) / avg) * 100;

        setStats({
          department: highest.name,
          value: highest.value,
          diff: diffPercent.toFixed(2),
        });
      }
    } catch (error) {
      console.log(error.response?.data?.error || error.message);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load population data",
        icon: "error",
      });
    }
  }

  useEffect(() => {
    loadRatioDepartment();
  }, []);

  return (
    <div className="card border-0" style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted text-uppercase fw-semibold">Highest Department</small>
            {stats ? (
              <>
                <h4 className="fw-bold mb-0">{stats.department}</h4>
                <p className="mb-0 fs-5 fw-semibold text-secondary">
                  {stats.value.toLocaleString()} population
                </p>
              </>
            ) : (
              <p className="text-muted mb-0">Loading...</p>
            )}
          </div>

          {stats && (
            <div className="text-end">
              <div
                className={`d-flex align-items-center justify-content-end ${
                  stats.diff >= 0 ? "text-success" : "text-danger"
                } fw-semibold`}
              >
                <span
                  className="material-symbols-outlined me-1"
                  style={{ fontSize: "1rem", verticalAlign: "middle" }}
                >
                  {stats.diff >= 0 ? "arrow_upward" : "arrow_downward"}
                </span>
                {Math.abs(stats.diff)}%
              </div>
              <small className="text-muted">vs average</small>
            </div>
          )}
        </div>

        <div style={{ width: "100%", height: 300 }}>
          {!data || data.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <p className="text-muted">No population data available</p>
            </div>
          ) : (
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={CHART_COLORS.PRIMARY} name="Population" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
