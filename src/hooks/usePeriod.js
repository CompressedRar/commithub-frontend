import { useState, useEffect } from "react";
import { getSettings } from "../services/settingsService";

export const usePeriod = () => {
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      const data = res?.data?.data ?? {};

      // 1. Set the literal phase string (e.g., "monitoring")
      console.log(data)
      setCurrentPhase(data.current_phase);

      // 2. Logic to determine if the monitoring period is "Open"
      const now = new Date();
      const start = data.monitoring_start_date ? new Date(data.monitoring_start_date) : null;
      const end = data.monitoring_end_date ? new Date(data.monitoring_end_date) : null;

      let isOpen = false;
      if (start && end) {
        isOpen = now >= start && now <= end;
      } else if (start) {
        isOpen = now >= start;
      } else if (end) {
        isOpen = now <= end;
      }

      setIsPeriodOpen(isOpen);
    } catch (error) {
      console.error("Failed to load period settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { currentPhase, isPeriodOpen, loading, refreshSettings: fetchSettings };
};