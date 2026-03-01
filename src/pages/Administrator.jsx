import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getCategoryCount,
  getTaskCount,
  getUserCount,
} from "../services/tableServices";
import {
  downloadMasterOPCR,
} from "../services/pcrServices";
import ActivityTrendChart from "../components/Charts/ActivityTrendChart";
import PopulationPerDepartment from "../components/Charts/PopulationPerDepartment";
import PerformancePerDepartment from "../components/Charts/PerformancePerDepartment";
import PerformanceSummaryPerDepartment from "../components/Charts/PerformanceSummaryPerDepartment";
import AllTaskAverages from "../components/Charts/AllTaskAverage";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonChart from "../components/SkeletonChart";

import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styles/dashboard.css";

function Administrator() {
  const [csCount, setCSCount] = useState(null);
  const [educCount, setEDCount] = useState(null);
  const [hmCount, setHMCount] = useState(null);
  const [otherCount, setOtherCount] = useState(null);
  const [allCount, setAllCount] = useState(null);
  const [taskCount, setTaskCount] = useState(null);
  const [categoryCount, setCategoryCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      const res = await downloadMasterOPCR();
      window.open(res.data.link, "_blank", "noopener,noreferrer");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "An error occurred.",
        icon: "error",
      });
    } finally {
      setDownloading(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [userRes, taskRes, categoryRes] = await Promise.all([
        getUserCount(),
        getTaskCount(),
        getCategoryCount(),
      ]);

      const userMsg = userRes.data.message;
      setCSCount(userMsg.cs);
      setEDCount(userMsg.educ);
      setHMCount(userMsg.hm);
      setOtherCount(userMsg.other);
      setAllCount(userMsg.all);

      setTaskCount(taskRes.data.message.count);
      setCategoryCount(categoryRes.data.message.count);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      Swal.fire("Error", "Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary">dashboard</span>
          Dashboard
        </h3>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={fetchData}
            disabled={loading || downloading}
          >
            <span className="material-symbols-outlined">
              {loading ? "sync" : "refresh"}
            </span>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={download}
            disabled={downloading || loading}
          >
            <span className="material-symbols-outlined">
              {downloading ? "sync" : "download"}
            </span>
            {downloading ? "Generating..." : "Download Master OPCR"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <span className="material-symbols-outlined">error</span>
          <div>
            <strong>Error:</strong> {error}
            <button className="btn btn-sm btn-link ms-2" onClick={fetchData}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Department User Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <h5 className="fw-semibold text-secondary mb-3">Department Statistics</h5>
        </div>
        {[
          { icon: "computer", label: "Computing Studies", count: csCount, color: "primary" },
          { icon: "auto_stories", label: "Education", count: educCount, color: "success" },
          { icon: "flights_and_hotels", label: "Hospitality Management", count: hmCount, color: "warning" },
          { icon: "format_ink_highlighter", label: "Administrative Offices", count: otherCount, color: "danger" },
        ].map((dept, idx) => (
          <div className="col-sm-6 col-lg-3" key={idx}>
            {loading ? (
              <SkeletonCard subtle={true} />
            ) : (
              <div className={`card text-center border-0 shadow-sm rounded-4 bg-${dept.color}-subtle`}>
                <div className="card-body">
                  <span className={`material-symbols-outlined text-${dept.color} fs-1 mb-2`}>
                    {dept.icon}
                  </span>
                  <h4 className="fw-bold mb-0">{dept.count ?? 0}</h4>
                  <small className="text-muted">{dept.label} Users</small>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <h5 className="fw-semibold text-secondary mb-3">Summary Statistics</h5>
        </div>
        {[
          { icon: "group", label: "Total Users", count: allCount, color: "primary" },
          { icon: "task", label: "Total Tasks", count: taskCount, color: "success" },
          { icon: "category", label: "Total KRA", count: categoryCount, color: "warning" },
        ].map((stat, idx) => (
          <div className="col-sm-6 col-lg-4" key={idx}>
            {loading ? (
              <SkeletonCard />
            ) : (
              <div className="card border text-center rounded-4 shadow-sm">
                <div className="card-body">
                  <span className={`material-symbols-outlined text-${stat.color} fs-1 mb-2`}>
                    {stat.icon}
                  </span>
                  <h4 className="fw-bold mb-0">{stat.count ?? 0}</h4>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Graphs Section */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <h5 className="fw-semibold text-secondary mb-3">Analytics & Charts</h5>
        </div>
        <div className="col-12">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="border rounded-4 p-3">
              <ActivityTrendChart></ActivityTrendChart>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="border rounded-4 p-3">
              <PopulationPerDepartment />
            </div>
          )}
        </div>

        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="border rounded-4 p-3">
              <PerformancePerDepartment />
            </div>
          )}
        </div>

        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="border rounded-4 p-3">
              <PerformanceSummaryPerDepartment />
            </div>
          )}
        </div>

        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="border rounded-4 p-3">
              <AllTaskAverages />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Administrator;
