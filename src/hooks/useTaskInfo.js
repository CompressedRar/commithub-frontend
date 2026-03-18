import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { getMainTask, updateMainTaskInfo, archiveMainTask } from "../services/taskService";
import { getDepartments } from "../services/departmentService";
import { objectToFormData } from "../components/api";




export function useTaskInfo(taskId, { onArchived } = {}) {
  const [taskInfo, setTaskInfo]           = useState({});
  const [formData, setFormData]           = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [isDirty, setIsDirty]             = useState(false);
  const [loading, setLoading]             = useState(false);

  // ── loaders ───────────────────────────────────────────────────────────────

  const loadDepartments = useCallback(async () => {
    try {
      const { data } = await getDepartments();
      setAllDepartments(data ?? []);
    } catch (err) {
      console.error("loadDepartments:", err);
    }
  }, []);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const { data } = await getMainTask(taskId);
      setTaskInfo(data);
      setFormData({ ...data, timeliness_mode: "timeframe" });
      setIsDirty(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load task.", "error");
    }
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    loadTask();
    loadDepartments();
  }, [taskId, loadTask, loadDepartments]);

  // ── form helpers ──────────────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty((prev) => prev || taskInfo[name] !== value);
  }, [taskInfo]);

  const handleCheckbox = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setIsDirty((prev) => prev || taskInfo[name] !== checked);
  }, [taskInfo]);

  const toggleDepartment = useCallback((deptId, checked) => {
    setFormData((prev) => ({
      ...prev,
      department: checked
        ? [...(prev.department ?? []), deptId]
        : (prev.department ?? []).filter((d) => d !== deptId),
    }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ ...taskInfo, timeliness_mode: "timeframe" });
    setIsDirty(false);
  }, [taskInfo]);

  // ── actions ───────────────────────────────────────────────────────────────

  const handleUpdate = useCallback(async () => {
    if (!formData.name?.trim()) {
      Swal.fire("Validation", "Task name is required.", "warning");
      return;
    }

    setLoading(true);
    try {
      const { data } = await updateMainTaskInfo(objectToFormData(formData));
      Swal.fire("Success", data.message || "Task updated.", "success");
      setIsDirty(false);
      loadTask();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Update failed.", "error");
    } finally {
      setLoading(false);
    }
  }, [formData, loadTask]);

  const handleArchive = useCallback(() => {
    Swal.fire({
      title: "Archive this task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it",
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      try {
        const { data } = await archiveMainTask(taskId);
        Swal.fire("Archived!", data.message, "success");
        onArchived?.();
      } catch (err) {
        Swal.fire("Error", err.response?.data?.error, "error");
      }
    });
  }, [taskId, onArchived]);

  return {
    formData,
    allDepartments,
    isDirty,
    loading,
    handleChange,
    handleCheckbox,
    toggleDepartment,
    resetForm,
    handleUpdate,
    handleArchive,
  };
}
