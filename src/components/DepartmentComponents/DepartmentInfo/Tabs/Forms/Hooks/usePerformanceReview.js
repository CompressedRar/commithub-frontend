import { useState, useEffect, useCallback } from "react";
import { getDepartmentIPCR, getDepartmentOPCR } from "../../../../../../services/departmentService";
import { createOPCR } from "../../../../../../services/pcrServices";
import { getSettings } from "../../../../../../services/settingsService";
import { socket } from "../../../../../api";
import Swal from "sweetalert2";

export function usePerformanceData(deptId) {
    const [allIPCR, setAllIPCR] = useState(null);
    const [allOPCR, setAllOPCR] = useState(null);
    const [filteredID, setFilteredID] = useState([]);
    const [consolidating, setConsolidating] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(null);

    // Fetch System Phase
    const loadCurrentPhase = useCallback(async () => {
        try {
            const res = await getSettings();
            setCurrentPhase(res?.data?.data?.current_phase || null);
        } catch (error) {
            console.error("Failed to load current phase:", error);
        }
    }, []);

    // Fetch IPCRs
    const loadIPCR = useCallback(async () => {
        try {
            const response = await getDepartmentIPCR(deptId);
            const data = response.data || [];

            // Filter for internal state logic
            const filtered = data.filter(item => 
                item.ipcr?.status === 1 && 
                item.ipcr?.form_status === "submitted" && 
                item.member?.account_status == 1
            );
            
            setFilteredID(filtered.map(i => i.ipcr.id));
            setAllIPCR(data.filter(item => item.member?.account_status == 1));
        } catch (error) {
            Swal.fire("Error", error.response?.data?.error || "Failed to load IPCRs", "error");
        }
    }, [deptId]);

    // Fetch OPCRs
    const loadOPCR = useCallback(async () => {
        try {
            const response = await getDepartmentOPCR(deptId);
            const data = response.data || [];
            setAllOPCR(data.filter(opcr => opcr.status == 1));
        } catch (error) {
            console.error("Failed to load OPCR", error);
        }
    }, [deptId]);

    // Consolidation Logic
    const handleConsolidate = async () => {
        if (filteredID.length === 0) {
            return Swal.fire("Error", "The office must have at least one submitted IPCR.", "error");
        }

        const result = await Swal.fire({
            title: "Create OPCR",
            text: "Do you want to consolidate all submitted IPCRs?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
        });

        if (result.isConfirmed) {
            setConsolidating(true);
            try {
                await createOPCR(deptId, { ipcr_ids: filteredID });
                await loadOPCR(); // Refresh OPCR list after creation
            } catch (error) {
                Swal.fire("Error", error.response?.data?.error || "Failed to create OPCR", "error");
            } finally {
                setConsolidating(false);
            }
        }
    };

    // Socket Initialization
    useEffect(() => {
        loadIPCR();
        loadCurrentPhase();

        const refreshEvents = ["ipcr_create", "ipcr", "assign"];
        refreshEvents.forEach(event => socket.on(event, loadIPCR));

        return () => refreshEvents.forEach(event => socket.off(event));
    }, [loadIPCR, loadCurrentPhase]);

    // Auto-load OPCR when IDs change (Logic from your original code)
    useEffect(() => {
        if (filteredID.length > 0) loadOPCR();
    }, [filteredID, loadOPCR]);

    return {
        allIPCR,
        allOPCR,
        consolidating,
        currentPhase,
        handleConsolidate,
        phases: {
            isMonitoring: currentPhase?.includes("monitoring"),
            isRating: currentPhase?.includes("rating"),
            isPlanning: currentPhase?.includes("planning"),
        }
    };
}