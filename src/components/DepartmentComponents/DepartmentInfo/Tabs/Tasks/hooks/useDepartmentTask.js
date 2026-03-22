// hooks/useDepartmentTasks.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { getDepartmentTasks } from "../../../../../../services/departmentService";
import { socket } from "../../../../../api";
import Swal from "sweetalert2";

export const useDepartmentTasks = (id) => {
  const [allTasks, setAllTasks] = useState([]);
  const [searchQuery, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDepartmentTasks(id);
      setAllTasks(res.data || []);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to load tasks.", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTasks();
    const events = ["user_created", "user_assigned", "user_unassigned", "task_modified", "department_assigned"];
    events.forEach(event => socket.on(event, loadTasks));
    return () => events.forEach(event => socket.off(event, loadTasks));
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter(task =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allTasks]);

  return { tasks: filteredTasks, loading, searchQuery, setQuery, refresh: loadTasks };
};