import { useState, useEffect, useCallback, useMemo } from "react";
import { getSettings } from "../services/settingsService";

export const useSettings = () => {

    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);

    const defaultThresholds = useMemo(() => ({
        outstanding: { min: 4.5 },
        very_satisfactory: { min: 3.5, max: 4.49 },
        satisfactory: { min: 2.5, max: 3.49 },
        unsatisfactory: { min: 1.5, max: 2.49 },
        poor: { max: 1.49 }
    }), [])


    const fetchSettings = useCallback(async () => {
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
    }, []);

    const handleRemarks = useCallback((rating) => {
        const r = parseFloat(rating)
        if (isNaN(r)) return "N/A";

        const thresholds = settings?.ratingThresholds || defaultThresholds;

        if (thresholds.outstanding && r >= (thresholds.outstanding.min ?? 4.5)) {
            return "OUTSTANDING"
        }
        if (
            thresholds.very_satisfactory &&
            r >= (thresholds.very_satisfactory.min ?? 3.5) &&
            r <= (thresholds.very_satisfactory.max ?? 4.49)
        ) {
            return "VERY SATISFACTORY"
        }
        if (
            thresholds.satisfactory &&
            r >= (thresholds.satisfactory.min ?? 2.5) &&
            r <= (thresholds.satisfactory.max ?? 3.49)
        ) {
            return "SATISFACTORY"
        }
        if (
            thresholds.unsatisfactory &&
            r >= (thresholds.unsatisfactory.min ?? 1.5) &&
            r <= (thresholds.unsatisfactory.max ?? 2.49)
        ) {
            return "UNSATISFACTORY"
        }
        if (thresholds.poor && r <= (thresholds.poor.max ?? 1.49)) {
            return "POOR"
        }

        return "UNKNOWN"
    }, [settings])

    function isPlanningPhase(currentPhase) {
        return Array.isArray(currentPhase) && currentPhase.includes("planning")
    }

    function isMonitoringPhase(currentPhase) {
        return Array.isArray(currentPhase) && currentPhase.includes("monitoring")
    }

    function isRatingPhase(currentPhase) {
        console.log(settings?.currentPhase)
        return Array.isArray(currentPhase) && currentPhase.includes("rating")
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    return { loading, settings, handleRemarks, isRatingPhase, isMonitoringPhase, isPlanningPhase };
};