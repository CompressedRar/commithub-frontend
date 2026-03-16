
import { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { removeTask } from "../../../../../../services/departmentService";
import { getSettings } from "../../../../../../services/settingsService";
import { socket } from "../../../../../api";

export const useTaskLogic = (mems, dept_id) => {
  const [settings, setSettings] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);

  const assignedUsers = useMemo(() => {
    const seen = new Set();
    return (mems.users || []).filter((user) => {
      if (seen.has(user.id)) return false;
      seen.add(user.id);
      return true;
    });
  }, [mems.users]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await getSettings();
      const data = res?.data?.data;
      setSettings(data);
      setCurrentPhase(data?.current_phase || []);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const events = ["user_assigned", "user_unassigned", "task_modified", "department_assigned"];
    events.forEach(ev => socket.on(ev, loadSettings));
    return () => events.forEach(ev => socket.off(ev, loadSettings));
  }, [loadSettings]);

  const isPlanningPhase = useMemo(() => 
    Array.isArray(currentPhase) && currentPhase.includes("planning"), 
  [currentPhase]);

  const handleRemove = async () => {
    const result = await Swal.fire({
      title: "Remove this task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
    });

    if (result.isConfirmed) {
      try {
        const res = await removeTask(mems.id, dept_id);
        Swal.fire("Deleted!", res.data.message, "success");
      } catch (error) {
        Swal.fire("Error", error.response?.data?.error || "Failed to remove.", "error");
      }
    }
  };

  return { assignedUsers, settings, isPlanningPhase, handleRemove };
};