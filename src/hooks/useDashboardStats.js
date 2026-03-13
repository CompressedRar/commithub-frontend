import { useState, useEffect } from "react";
import { getUserCount, getTaskCount, getCategoryCount } from "../services/tableServices";
import { downloadMasterOPCR } from "../services/pcrServices";
import Swal from "sweetalert2";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    departments: { cs: 0, educ: 0, hm: 0, other: 0 },
    summary: { totalUsers: 0, totalTasks: 0, totalKRA: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, taskRes, categoryRes] = await Promise.all([
        getUserCount(),
        getTaskCount(),
        getCategoryCount(),
      ]);

      const userMsg = userRes.data.message;
      setStats({
        departments: {
          cs: userMsg.cs,
          educ: userMsg.educ,
          hm: userMsg.hm,
          other: userMsg.other,
        },
        summary: {
          totalUsers: userMsg.all,
          totalTasks: taskRes.data.message.count,
          totalKRA: categoryRes.data.message.count,
        }
      });
    } catch (err) {
      setError("Failed to load dashboard data.");
      Swal.fire("Error", "Could not fetch stats.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadMasterOPCR();
      window.open(res.data.link, "_blank", "noopener,noreferrer");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Download failed.", "error");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { stats, loading, downloading, error, fetchData, handleDownload };
};