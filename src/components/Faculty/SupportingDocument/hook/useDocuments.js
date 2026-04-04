import { useState, useEffect, useCallback, useMemo } from "react";
import {
  archiveDocument,
  getDeptSupportingDocuments,
  getSupportingDocuments,
  approveDocument, rejectDocument
} from "../../../../services/pcrServices";
import Swal from "sweetalert2";
import { socket } from "../../../api";

/**
 * Handles ONLY document loading, filtering, and removal.
 * Upload state lives in UploadPanel to prevent cross-contamination.
 */
export function useDocuments({ mode, ipcr_id, dept_id }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(false);

  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTask, setFilterTask] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        mode === "dept"
          ? await getDeptSupportingDocuments(dept_id)
          : await getSupportingDocuments(ipcr_id);
      setDocuments(mode === "dept" ? (res.data.message ?? []) : (res.data ?? []));
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load documents.", "error");
    } finally {
      setLoading(false);
    }
  }, [mode, ipcr_id, dept_id]);

  useEffect(() => {
    loadDocuments();
    socket.on("document", loadDocuments);
    socket.on(`document-${ipcr_id}`, loadDocuments);

  }, []);

  // ── Remove ──────────────────────────────────────────────────────────────────
  const removeDocument = useCallback((document_id) => {
    Swal.fire({
      title: "Remove Document",
      text: "Are you sure you want to remove this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await archiveDocument(document_id);
        Swal.fire("Removed", res.data.message, "success");
        loadDocuments();
        socket.emit("document");
      } catch (err) {
        Swal.fire("Error", err.response?.data?.error || "Failed to remove.", "error");
      }
    });
  }, [loadDocuments]);

  const handleApproveDocument = useCallback((document_id) => {
    Swal.fire({
      title: "Approve Document",
      text: "Are you sure you want to approve this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#28a745",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await approveDocument(document_id);
        Swal.fire("Approved", "Document approved successfully.", "success");
        loadDocuments();
        socket.emit(`document-${ipcr_id}`);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to approve.", "error");
      }
    });
  }, [loadDocuments]);


  const handleRejectDocument = useCallback((document_id) => {
    Swal.fire({
      title: "Reject Document",
      text: "Are you sure you want to reject this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#dc3545",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await rejectDocument(document_id);
        Swal.fire("Rejected", res.data.message, "success");
        loadDocuments();
        socket.emit(`document-${ipcr_id}`);
      } catch (err) {
        Swal.fire("Error", "Failed to reject.", "error");
      }
    });
  }, [loadDocuments]);


  // ── Derived ─────────────────────────────────────────────────────────────────
  const activeDocuments = useMemo(
    () => documents.filter((d) => d.status === 1),
    [documents]
  );

  const validDocuments = useMemo(
    () => documents.filter((d) => d.status === 1 && d.isApproved === "approved"),
    [documents]
  );

  const pendingDocuments = useMemo(
    () => documents.filter((d) => d.status === 1 && d.isApproved === "pending"),
    [documents]
  );

  const rejectedDocuments = useMemo(
    () => documents.filter((d) => d.status === 1 && d.isApproved === "rejected"),
    [documents]
  );

  const fileTypes = useMemo(
    () => [...new Set(activeDocuments.map((d) => d.file_type).filter(Boolean))],
    [activeDocuments]
  );

  const taskNames = useMemo(
    () => [...new Set(activeDocuments.map((d) => d.task_name).filter(Boolean))],
    [activeDocuments]
  );

  const filteredDocuments = useMemo(() => {
    const q = search.toLowerCase();
    return activeDocuments.filter((doc) => {
      const matchSearch =
        !q ||
        doc.title?.toLowerCase().includes(q) ||
        doc.file_name?.toLowerCase().includes(q) ||
        doc.task_name?.toLowerCase().includes(q) ||
        doc.user_name?.toLowerCase().includes(q) ||
        doc.desc?.toLowerCase().includes(q);
      const matchType = filterType === "all" || doc.file_type === filterType;
      const matchTask = filterTask === "all" || doc.task_name === filterTask;
      const matchStatus = filterStatus === "all" || doc.isApproved === filterStatus;
      return matchSearch && matchType && matchTask && matchStatus;
    });
  }, [activeDocuments, search, filterType, filterTask, filterStatus]);

  const groupedDocuments = useMemo(() => {
    const g = {};
    filteredDocuments.forEach((doc) => {
      const task = doc.task_name || "Unassigned Task";
      const user = doc.user_name || "Unknown User";
      if (!g[task]) g[task] = {};
      if (!g[task][user]) g[task][user] = [];
      g[task][user].push(doc);
    });
    return g;
  }, [filteredDocuments]);

  return {
    activeDocuments, validDocuments, pendingDocuments, rejectedDocuments,
    filteredDocuments,
    groupedDocuments,
    loading,
    removeDocument,
    loadDocuments,
    search,     setSearch,
    filterType, setFilterType,
    filterTask, setFilterTask,
    filterStatus, setFilterStatus,
    fileTypes,
    taskNames,
    handleApproveDocument,
    handleRejectDocument
  };
}