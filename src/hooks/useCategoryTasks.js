import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { socket } from "../components/api";
import { archiveCategory, getCategory, updateCategory } from "../services/categoryService";
import { getDepartments } from "../services/departmentService";

const EMPTY_FORM = (id) => ({
  task_name: "",
  department: [],
  task_desc: "",
  time_measurement: "minute",
  modification: "correction",
  accomplishment_editable: 0,
  time_editable: 0,
  modification_editable: 0,
  target_quantity: 0,
  target_efficiency: 0,
  target_deadline: "",
  target_timeframe: 0,
  timeliness_mode: "timeframe",
  id,
});

export function useCategoryTasks(categoryId, onReloadAll) {
  const [categoryInfo, setCategoryInfo]   = useState(null);
  const [categoryTasks, setCategoryTasks] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [taskForm, setTaskForm]           = useState(EMPTY_FORM(categoryId));

  // ── loaders ──────────────────────────────────────────────────────────────

  const loadDepartments = useCallback(async () => {
    try {
      const { data } = await getDepartments();
      setAllDepartments(data ?? []);
    } catch (err) {
      console.error("loadDepartments:", err);
    }
  }, []);

  const loadCategory = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const { data } = await getCategory(categoryId);
      setCategoryInfo(data);
      setCategoryTasks(data.main_tasks ?? []);
      setTaskForm(EMPTY_FORM(categoryId));
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load category", "error");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // ── effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    loadCategory();
    loadDepartments();

    socket.on("category", loadCategory);
    socket.on("main_task", loadCategory);

    return () => {
      socket.off("category", loadCategory);
      socket.off("main_task", loadCategory);
    };
  }, [loadCategory, loadDepartments]);

  // ── task form helpers ─────────────────────────────────────────────────────

  const setTaskField = useCallback((name, value) => {
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleDepartment = useCallback((deptId, checked) => {
    setTaskForm((prev) => ({
      ...prev,
      department: checked
        ? [...prev.department, deptId]
        : prev.department.filter((d) => d !== deptId),
    }));
  }, []);

  const resetTaskForm = useCallback(() => {
    setTaskForm(EMPTY_FORM(categoryId));
  }, [categoryId]);

  // ── category actions ──────────────────────────────────────────────────────

  const archiveCategoryAction = useCallback(() => {
    Swal.fire({
      title: "Archive this Key Result Area?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      try {
        const { data } = await archiveCategory(categoryId);
        Swal.fire("Success", data.message, "success");
        onReloadAll?.();
      } catch (err) {
        Swal.fire("Error", err.response?.data?.error || "Archive failed", "error");
      }
    });
  }, [categoryId, onReloadAll]);

  const updateCategoryTitle = useCallback(async (title) => {
    try {
      const { data } = await updateCategory({ id: categoryId, title });
      Swal.fire("Success", data.message, "success");
      onReloadAll?.();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Update failed", "error");
    }
  }, [categoryId, onReloadAll]);

  return {
    categoryInfo,
    categoryTasks,
    allDepartments,
    loading,
    taskForm,
    setTaskField,
    toggleDepartment,
    resetTaskForm,
    loadCategory,
    archiveCategoryAction,
    updateCategoryTitle,
  };
}
