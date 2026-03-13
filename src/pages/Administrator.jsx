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

import { useDashboardStats } from "../hooks/useDashboardStats";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import StatCard from "../components/Dashboard/StatCard";

function Administrator() {

  const { stats, loading, downloading, error, fetchData, handleDownload } = useDashboardStats();


  const deptCards = [
    { icon: "computer", label: "Computing Studies", count: stats.departments.cs, color: "primary" },
    { icon: "auto_stories", label: "Education", count: stats.departments.educ, color: "success" },
    { icon: "flights_and_hotels", label: "Hospitality Management", count: stats.departments.hm, color: "warning" },
    { icon: "format_ink_highlighter", label: "Administrative Offices", count: stats.departments.other, color: "danger" },
  ];

  const summaryCards = [
    { icon: "group", label: "Total Users", count: stats.summary.totalUsers, color: "primary" },
    { icon: "task", label: "Total Tasks", count: stats.summary.totalTasks, color: "success" },
    { icon: "category", label: "Total KRA", count: stats.summary.totalKRA, color: "warning" },
  ];

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <DashboardHeader></DashboardHeader>
      

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

      <section className="row g-3 mb-4">
        <h5 className="fw-semibold text-secondary mb-3">Department Statistics</h5>
        {deptCards.map((dept, i) => (
          <div className="col-sm-6 col-lg-3" key={i}>
            {loading ? <SkeletonCard subtle /> : <StatCard {...dept} isSubtle />}
          </div>
        ))}
      </section>

      <section className="row g-3 mb-4">
        <h5 className="fw-semibold text-secondary mb-3">Summary Statistics</h5>
        {summaryCards.map((stat, i) => (
          <div className="col-sm-6 col-lg-4" key={i}>
            {loading ? <SkeletonCard /> : <StatCard {...stat} />}
          </div>
        ))}
      </section>

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
