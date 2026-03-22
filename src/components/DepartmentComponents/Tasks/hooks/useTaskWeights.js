// hooks/useTaskWeights.js
import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { socket } from "../../../api";
import { getAssignedDepartmentTask, updateAssignedDepartmentTask } from "../../../../services/departmentService";

export const useTaskWeights = (dept_id) => {
  const [allTasks, setAllTasks] = useState([]);
  const [taskData, setTaskData] = useState({}); // Stores current input values
  const [initialData, setInitialData] = useState({}); // For dirty checking
  const [updating, setUpdating] = useState(false);

  const loadAssignedTasks = useCallback(async () => {
    try {
      const res = await getAssignedDepartmentTask(dept_id);
      const data = res.data || [];
      setAllTasks(data);

      const weights = data.reduce((acc, task) => {
        acc[task.id] = task.task_weight;
        return acc;
      }, {});

      setTaskData(weights);
      setInitialData(weights);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to fetch tasks.", "error");
    }
  }, [dept_id]);

  useEffect(() => {
    loadAssignedTasks();
    socket.on("weight", loadAssignedTasks);
    return () => socket.off("weight", loadAssignedTasks);
  }, [loadAssignedTasks]);

  // Computed Values
  const totalWeight = useMemo(() => {
    return Object.values(taskData).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  }, [taskData]);

  const isDirty = useMemo(() => {
    return JSON.stringify(taskData) !== JSON.stringify(initialData);
  }, [taskData, initialData]);

  // Handlers
  const updateWeights = async () => {
    setUpdating(true);
    try {
      const res = await updateAssignedDepartmentTask(taskData);
      Swal.fire("Success", res.data.message, "success");
      setInitialData(taskData); // Reset dirty state after success
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Update failed.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleWeightChange = (id, value) => {
    setTaskData(prev => ({ ...prev, [id]: value }));
  };

  return { allTasks, taskData, totalWeight, isDirty, updating, updateWeights, handleWeightChange };
};