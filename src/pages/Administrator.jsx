import { useEffect, useState } from "react";
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
import OfficeOPCRChart from "../components/Charts/OfficeOPCRChart";

function Administrator() {
  const { stats, loading, downloading, error, fetchData, handleDownload } =
    useDashboardStats();

  const deptCards = [
    {
      icon: "computer",
      label: "Computing Studies",
      count: stats.departments.cs,
      color: "primary",
    },
    {
      icon: "auto_stories",
      label: "Education",
      count: stats.departments.educ,
      color: "success",
    },
    {
      icon: "flights_and_hotels",
      label: "Hospitality Management",
      count: stats.departments.hm,
      color: "warning",
    },
    {
      icon: "format_ink_highlighter",
      label: "Administrative Offices",
      count: stats.departments.other,
      color: "danger",
    },
  ];

  const summaryCards = [
    {
      icon: "group",
      label: "Total Users",
      count: stats.summary.totalUsers,
      color: "primary",
    },
    {
      icon: "task",
      label: "Total Tasks",
      count: stats.summary.totalTasks,
      color: "success",
    },
    {
      icon: "category",
      label: "Total KRA",
      count: stats.summary.totalKRA,
      color: "warning",
    },
  ];

  return (
    <div className="container-fluid px-4">

      {/* ── Header ── */}
      <DashboardHeader
        onRefresh={fetchData}
        onDownload={handleDownload}
        downloading={downloading}
        loading={loading}
      />

      {/* ── Error banner ── */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 mb-4"
          role="alert"
        >
          <span className="material-symbols-outlined">error</span>
          <div>
            <strong>Error:</strong> {error}
            <button className="btn btn-sm btn-link ms-2" onClick={fetchData}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Department headcount ── */}
      <p className="section-label">Department headcount</p>
      <section className="row g-3 mb-2">
        {deptCards.map((dept, i) => (
          <div className="col-6 col-lg-3" key={i}>
            {loading ? (
              <SkeletonCard subtle />
            ) : (
              <StatCard {...dept} isSubtle />
            )}
          </div>
        ))}
      </section>

      {/* ── Summary ── */}
      <p className="section-label mt-4">Summary</p>
      <section className="row g-3 mb-2">
        {summaryCards.map((stat, i) => (
          <div className="col-12 col-sm-4" key={i}>
            {loading ? <SkeletonCard /> : <StatCard {...stat} />}
          </div>
        ))}
      </section>

      {/* ── Charts ── */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="chart-card">
              <OfficeOPCRChart />
            </div>
          )}
        </div>


        {/* Population */}
        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="chart-card">
              <PopulationPerDepartment />
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="chart-card">
              <PerformancePerDepartment />
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="chart-card">
              <PerformanceSummaryPerDepartment />
            </div>
          )}
        </div>

        {/* All Task Averages */}
        <div className="col-12 col-lg-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="chart-card">
              <AllTaskAverages />
            </div>
          )}
        </div>

        {/* Office OPCR — full width */}
        

      </div>
    </div>
  );
}

export default Administrator;