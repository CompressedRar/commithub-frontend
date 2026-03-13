import { useState, useEffect } from "react";
import { getSettings } from "../services/settingsService";

export const useSettings = () => {

    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null)

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await getSettings()
            const settingsData = res?.data?.data;
            setSettings(settingsData)
        } catch (error) {
            console.log("settings error", error);
        } finally {
            setLoading(false);
        }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { loading, settings };
};