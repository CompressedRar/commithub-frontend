import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getOPCR,
  getPlannedOPCR,
  getMasterOPCR,
  downloadOPCR,
  downloadPlannedOPCR,
  downloadWeightedOPCR,
  downloadMasterOPCR,
  downloadAllDeptSummaries,
  downloadAllTaskSummaries,
  updateADept,
  computeOPCRRating,
} from "../services/pcrServices";
import { getAssignedTasksByDept } from "../services/pcrServices";
import { useSettings } from "./useSettings";

function calculateAverage(q, e, t) {
  return (q + e + t) / 3;
}


function computeStats(opcrInfo) {
  if (!opcrInfo) return { quantity: 0, efficiency: 0, timeliness: 0, average: 0 };

  let qSum = 0, eSum = 0, tSum = 0, allSum = 0, count = 0;

  opcrInfo.forEach((categoryObj) => {
    Object.entries(categoryObj).forEach(([, tasks]) => {
      tasks.forEach((task) => {
        const q = task.rating?.quantity ?? 0;
        const e = task.rating?.efficiency ?? 0;
        const t = task.rating?.timeliness ?? 0;
        qSum += q; eSum += e; tSum += t;
        allSum += calculateAverage(q, e, t);
        count++;
      });
    });
  });

  if (count === 0) return { quantity: 0, efficiency: 0, timeliness: 0, average: 0 };

  return {
    quantity: qSum / count,
    efficiency: eSum / count,
    timeliness: tSum / count,
    average: allSum / count,
  };
}

// ─── useOPCR ────────────────────────────────────────────────────────────────
// Used by OtherEditOPCR
export function useOPCR({ opcr_id, dept_id } = {}) {
  const [opcrInfo, setOPCRInfo] = useState(null);
  const [assignedData, setAssignedData] = useState(null);
  const [headData, setHeadData] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const [stats, setStats] = useState({ quantity: 0, efficiency: 0, timeliness: 0, average: 0 });
  const [downloading, setDownloading] = useState(false);
  const [mainTasks, setMainTasks] = useState(null);

  const [loading, setLoading] = useState("");
  const [ratingSave, setRatingSave] = useState(null); // {id, field, value} — always a new object ref

  const { settings, handleRemarks: settingsHandleRemarks, isRatingPhase, isMonitoringPhase, isPlanningPhase } = useSettings();

  const ratingThresholds = settings?.rating_thresholds
    ? (typeof settings.rating_thresholds === "string"
      ? JSON.parse(settings.rating_thresholds)
      : settings.rating_thresholds)
    : null;

  async function loadOPCR() {
    const res = await getOPCR(opcr_id)
      .then((d) => d.data)
      .catch((err) => {
        Swal.fire("Error", err.response?.data?.error || "Failed to load OPCR", "error");
        return null;
      });
    if (!res) return;
    setOPCRInfo(res.ipcr_data);
    setFormStatus(res.form_status?.toUpperCase());
    setAssignedData(res.assigned);
    setHeadData(res.admin_data);
  }

  async function loadMainTasks() {
    if (!dept_id) return;
    try {
      const res = await getAssignedTasksByDept(dept_id);
      setMainTasks(res?.data?.tasks);
    } catch (err) {
      console.error("Failed to load main tasks:", err);
    }
  }

  async function downloadStandard() {
    setDownloading(true);
    const link = await downloadOPCR(opcr_id)
      .then((d) => d.data.link)
      .catch((err) => { Swal.fire("Error", err.response?.data?.error || "Failed to download", "error"); return null; });
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setDownloading(false);
  }

  async function downloadPlanned() {
    setDownloading(true);
    const link = await downloadPlannedOPCR(dept_id)
      .then((d) => d.data.link)
      .catch((err) => { Swal.fire("Error", err.response?.data?.error || "Failed to download", "error"); return null; });
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setDownloading(false);
  }

  async function downloadWeighted() {
    setDownloading(true);
    const link = await downloadWeightedOPCR(opcr_id)
      .then((d) => d.data.link)
      .catch((err) => { Swal.fire("Error", err.response?.data?.error || "Failed to download", "error"); return null; });
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setDownloading(false);
  }

  function handleDownloadChange(event) {
    const action = event.target.value;
    if (action === "opcr") downloadStandard();
    if (action === "weighted") downloadWeighted();
    if (action === "planned") downloadPlanned();
  }

  function handleRemarks(rating) {
    return settingsHandleRemarks ? settingsHandleRemarks(rating) : _localHandleRemarks(rating, ratingThresholds);
  }

  // Always produces a new object reference so useEffect fires even when
  // field/value/id are identical to the previous save (e.g. user re-enters same number).
  function setRating(id, field, value) {
    setRatingSave({ id, field, value });
  }


  const handleCalculateRatings = useCallback(async () => {
    console.log("Caaling")
    const result = await Swal.fire({
      title: "Calculate Ratings?",
      text: "This will override the ratings for all tasks.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, calculate it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        const res = await computeOPCRRating(opcr_id);

        await Swal.fire({
          title: "Success!",
          text: "Ratings have been calculated successfully.",
          icon: "success",
          timer: 1000
        });

        await loadOPCR()


      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Calculation Failed",
          text: error.response?.data?.error || "An unexpected error occurred.",
          icon: "error"
        });
      } finally {
        setLoading(false);
      }
    }
  }, [])

  // Debounced rating update — depends on ratingSave object ref, not value primitives
  useEffect(() => {
    if (!ratingSave || ratingSave.value === "" || !ratingSave.id) return;
    const debounce = setTimeout(() => {
      updateADept(ratingSave.id, ratingSave.field, ratingSave.value).catch((err) =>
        console.error(err.response?.data?.error || err)
      );
    }, 500);
    return () => clearTimeout(debounce);
  }, [ratingSave]);

  // Recompute stats when opcrInfo changes
  useEffect(() => {
    if (!opcrInfo) return;
    setStats(computeStats(opcrInfo));
  }, [opcrInfo]);

  return {
    opcrInfo,
    assignedData,
    headData,
    formStatus,
    stats,
    downloading,
    mainTasks,
    ratingThresholds,
    setRating,
    loadOPCR,
    loadMainTasks,
    downloadStandard,
    downloadPlanned,
    downloadWeighted,
    handleDownloadChange,
    handleRemarks,
    isRatingPhase,
    isMonitoringPhase,
    isPlanningPhase,
    handleCalculateRatings,
    loading
  };
}

// ─── usePlannedOPCR ──────────────────────────────────────────────────────────
// Used by OtherDraftedOPCR
export function usePlannedOPCR({ dept_id } = {}) {
  const [opcrInfo, setOPCRInfo] = useState(null);
  const [assignedData, setAssignedData] = useState(null);
  const [headData, setHeadData] = useState(null);
  const [stats, setStats] = useState({ quantity: 0, efficiency: 0, timeliness: 0, average: 0 });
  const [downloading, setDownloading] = useState(false);
  const [ratingThresholds, setRatingThresholds] = useState(null);

  const { handleRemarks: settingsHandleRemarks, isRatingPhase, isMonitoringPhase, isPlanningPhase } = useSettings();

  async function loadOPCR() {
    const res = await getPlannedOPCR(dept_id)
      .then((d) => d.data)
      .catch((err) => {
        Swal.fire("Error", err.response?.data?.error || "Failed to load OPCR", "error");
        return null;
      });
    if (!res) return;
    setOPCRInfo(res.ipcr_data);
    setAssignedData(res.assigned);
    setHeadData(res.admin_data);
    if (res.rating_thresholds) {
      let rt = res.rating_thresholds;
      if (typeof rt === "string") rt = JSON.parse(rt);
      setRatingThresholds(rt);
    }
  }

  async function downloadPlanned() {
    setDownloading(true);
    const link = await downloadPlannedOPCR(dept_id)
      .then((d) => d.data.link)
      .catch((err) => { Swal.fire("Error", err.response?.data?.error || "Failed to download", "error"); return null; });
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setDownloading(false);
  }

  function handleRemarks(rating) {
    return settingsHandleRemarks
      ? settingsHandleRemarks(rating)
      : _localHandleRemarks(rating, ratingThresholds);
  }

  useEffect(() => {
    if (!opcrInfo) return;
    setStats(computeStats(opcrInfo));
  }, [opcrInfo]);

  return {
    opcrInfo,
    assignedData,
    headData,
    stats,
    downloading,
    ratingThresholds,
    loadOPCR,
    downloadPlanned,
    handleRemarks,
    isRatingPhase,
    isMonitoringPhase,
    isPlanningPhase,
  };
}

// ─── useMasterOPCR ───────────────────────────────────────────────────────────
// Used by MasterOPCR
export function useMasterOPCR() {
  const [opcrInfo, setOPCRInfo] = useState(null);
  const [assignedData, setAssignedData] = useState(null);
  const [headData, setHeadData] = useState(null);
  const [stats, setStats] = useState({ quantity: 0, efficiency: 0, timeliness: 0, average: 0 });
  const [downloading, setDownloading] = useState(false);
  const [ratingThresholds, setRatingThresholds] = useState(null);

  const { handleRemarks: settingsHandleRemarks } = useSettings();

  async function loadOPCR() {
    try {
      const res = await getMasterOPCR().then((d) => d.data);
      setOPCRInfo(res.ipcr_data);
      setAssignedData(res.assigned);
      setHeadData(res.admin_data);
      if (res.rating_thresholds) {
        let rt = res.rating_thresholds;
        if (typeof rt === "string") rt = JSON.parse(rt);
        setRatingThresholds(rt);
      }
    } catch (err) {
      console.error("Failed to load Master OPCR:", err);
    }
  }

  async function downloadMaster() {
    setDownloading(true);
    const link = await downloadMasterOPCR()
      .then((d) => d.data.link)
      .catch((err) => { Swal.fire("Error", err.response?.data?.error || "Failed to download", "error"); return null; });
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setDownloading(false);
  }

  async function downloadDeptSummaries() {
    setDownloading(true);
    const link = await downloadAllDeptSummaries()
      .then((d) => d.data.download_url)
      .catch((err) => { Swal.fire("Error", err.response?.data?.error || "Failed to download", "error"); return null; });
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setDownloading(false);
  }

  async function downloadTaskSummary() {
    setDownloading(true);
    const link = await downloadAllTaskSummaries()
      .then((d) => d.data.download_url)
      .catch((err) => { Swal.fire("Error", err.response?.data?.error || "Failed to download", "error"); return null; });
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setDownloading(false);
  }

  function handleDownloadChange(event) {
    const action = event.target.value;
    if (action === "master") downloadMaster();
    if (action === "dept") downloadDeptSummaries();
    if (action === "task") downloadTaskSummary();
  }

  function handleRemarks(rating) {
    return settingsHandleRemarks
      ? settingsHandleRemarks(rating)
      : _localHandleRemarks(rating, ratingThresholds);
  }

  useEffect(() => {
    if (!opcrInfo) return;
    setStats(computeStats(opcrInfo));
  }, [opcrInfo]);

  return {
    opcrInfo,
    assignedData,
    headData,
    stats,
    downloading,
    ratingThresholds,
    loadOPCR,
    downloadMaster,
    downloadDeptSummaries,
    downloadTaskSummary,
    handleDownloadChange,
    handleRemarks,
  };
}

// ─── Local fallback handleRemarks (if useSettings doesn't expose it) ─────────
function _localHandleRemarks(rating, thresholds) {
  const r = parseFloat(rating);
  const thresh = thresholds || {
    outstanding: { min: 4.5 },
    very_satisfactory: { min: 3.5, max: 4.49 },
    satisfactory: { min: 2.5, max: 3.49 },
    unsatisfactory: { min: 1.5, max: 2.49 },
    poor: { max: 1.49 },
  };
  if (thresh.outstanding && r >= (thresh.outstanding.min ?? 4.5)) return "OUTSTANDING";
  if (thresh.very_satisfactory && r >= (thresh.very_satisfactory.min ?? 3.5) && r <= (thresh.very_satisfactory.max ?? 4.49)) return "VERY SATISFACTORY";
  if (thresh.satisfactory && r >= (thresh.satisfactory.min ?? 2.5) && r <= (thresh.satisfactory.max ?? 3.49)) return "SATISFACTORY";
  if (thresh.unsatisfactory && r >= (thresh.unsatisfactory.min ?? 1.5) && r <= (thresh.unsatisfactory.max ?? 2.49)) return "UNSATISFACTORY";
  if (thresh.poor && r <= (thresh.poor.max ?? 1.49)) return "POOR";
  return "UNKNOWN";
}
