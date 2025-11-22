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

import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styles/dashboard.css";

function Administrator() {
  const [csCount, setCSCount] = useState(0);
  const [educCount, setEDCount] = useState(0);
  const [hmCount, setHMCount] = useState(0);
  const [otherCount, setOtherCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
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

  useEffect(() => {
    getUserCount()
      .then((data) => {
        const msg = data.data.message;
        setCSCount(msg.cs);
        setEDCount(msg.educ);
        setHMCount(msg.hm);
        setOtherCount(msg.other);
        setAllCount(msg.all);
      })
      .catch(() => {
        Swal.fire("Error", "An error occurred while fetching user count.", "error");
      });

    getTaskCount()
      .then((data) => setTaskCount(data.data.message.count))
      .catch(() => {
        Swal.fire("Error", "An error occurred while fetching task count.", "error");
      });

    getCategoryCount()
      .then((data) => setCategoryCount(data.data.message.count))
      .catch(() => {
        Swal.fire("Error", "An error occurred while fetching category count.", "error");
      });
  }, []);

  return (
    <div className="container-fluid bg-light">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary">dashboard</span>
          Administrator Dashboard
        </h3>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={download}
          disabled={downloading}
        >
          <span className="material-symbols-outlined">
            {downloading ? "sync" : "download"}
          </span>
          {downloading ? "Generating..." : "Download Master OPCR"}
        </button>
      </div>

      {/* Department User Stats */}
      <div className="row g-3 mb-4">
        {[
          { icon: "computer", label: "Computing Studies", count: csCount, color: "primary" },
          { icon: "auto_stories", label: "Education", count: educCount, color: "success" },
          { icon: "flights_and_hotels", label: "Hospitality Management", count: hmCount, color: "warning" },
          { icon: "format_ink_highlighter", label: "Administrative Offices", count: otherCount, color: "danger" },
        ].map((dept, idx) => (
          <div className="col-md-3" key={idx}>
            <div className={`card text-center border-0 shadow-sm rounded-4 bg-${dept.color}-subtle`}>
              <div className="card-body">
                <span className={`material-symbols-outlined text-${dept.color} fs-1 mb-2`}>
                  {dept.icon}
                </span>
                <h4 className="fw-bold mb-0">{dept.count}</h4>
                <small className="text-muted">{dept.label} Users</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        {[
          { icon: "group", label: "Total Users", count: allCount, color: "primary" },
          { icon: "task", label: "Total Outputs", count: taskCount, color: "success" },
          { icon: "category", label: "Total Major Final Outputs", count: categoryCount, color: "warning" },
        ].map((stat, idx) => (
          <div className="col-md-4" key={idx}>
            <div className="card border-0 shadow-sm text-center rounded-4">
              <div className="card-body">
                <span className={`material-symbols-outlined text-${stat.color} fs-1 mb-2`}>
                  {stat.icon}
                </span>
                <h4 className="fw-bold mb-0">{stat.count}</h4>
                <small className="text-muted">{stat.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="d-flex flex-wrap gap-3 mb-5">
        {[
          { href: "/admin/users", icon: "manage_accounts", label: "Manage Accounts" },
          { href: "/admin/department", icon: "apartment", label: "Manage Offices" },
          { href: "/admin/tasks", icon: "admin_panel_settings", label: "Manage Outputs" },
        ].map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-4 px-4 py-2 shadow-sm"
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>

      {/* Graphs Section */}
      <div className="row g-4">
        
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <PopulationPerDepartment />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <PerformancePerDepartment />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <PerformanceSummaryPerDepartment />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <AllTaskAverages />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Administrator;
