import { useEffect, useState } from "react"
import { updateSubTask } from "../../services/pcrServices"
import { socket } from "../api"
import Swal from "sweetalert2"
import ManageTaskSupportingDocuments from "./SupportingDocument/ManageTaskSupportingDocuments"

import { useSettings } from "../../hooks/useSettings"
import { useIPCR } from "../../hooks/useIPCR"
import SignaturesSection from "./IPCR/SignatureSection"
import FinalRatingsSection from "./IPCR/FinalRatingSection"

import OathSection from "./IPCR/OathSection"
import MonitoringIndicator from "./IPCR/Header/MonitoringIndicator"
import HeaderSection from "./IPCR/Header/HeaderSection"
import DownloadIPCRButton from "./IPCR/Header/DownloadIPCRButton"
import SupportingDocumentButton from "./IPCR/Header/SupportingDocumentButton"
import { TaskSection } from "./IPCR/Task/TaskSection"
import PlanningIndicator from "./IPCR/Header/PlanningIndicator"
import RatingIndicator from "./IPCR/Header/RatingIndicator"
import { Chip, Divider, Stack } from "@mui/material"
import SubmitIPCRButton from "./IPCR/Header/SubmitIPCR"


function EditIPCR({ mode, ipcr_id, switchPage }) {
    const [field, setField] = useState("")
    const [value, setValue] = useState(0)
    const [subTaskID, setSubTaskID] = useState(0)

    const [ratingThresholds, setRatingThresholds] = useState(null);
    
    const [currentPhase, setCurrentPhase] = useState(null)


    const { settings, handleRemarks, isMonitoringPhase, isPlanningPhase, isRatingPhase } = useSettings();

    const { downloading, downloadStandard, downloadWeighted, downloadPlanned, stats, ipcrInfo, categoryTypes, arrangedSubTasks, loadIPCR, handleSubmit, loading } = useIPCR();

    const handleChange = (event) => {
        const action = event.target.value;
        if (action === 'ipcr') downloadStandard(ipcr_id);
        if (action === 'weighted') downloadWeighted(ipcr_id);
        if (action === 'planned') downloadPlanned(ipcr_id);
    };

    function handleDataChange(e) {
        setField(e.target.name)
        setValue(e.target.value)
    }

    function handleSpanChange(e) {
        setField(e.target.className)
        setValue(e.target.textContent)
    }

    async function loadRatingThresholds() {
        try {
            if (settings?.rating_thresholds) {
                let rt = settings.rating_thresholds;
                if (typeof rt === "string") {
                    rt = JSON.parse(rt);
                }
                setRatingThresholds(rt);
            }
        } catch (error) {
            console.error("Failed to load rating thresholds:", error);
        }
    }

    async function loadCurrentPhase() {
        try {
            const phase = settings?.current_phase
            setCurrentPhase(phase)
        } catch (error) {
            console.error("Failed to load current phase:", error)
        }
    }

    useEffect(() => {
        loadCurrentPhase()
    }, [settings])

    useEffect(() => {
        loadIPCR(ipcr_id)
        loadRatingThresholds()


        socket.on(`ipcr-${ipcr_id}`, () => loadIPCR(ipcr_id))
        socket.on("assign", () => loadIPCR(ipcr_id))

        return () => {
            socket.off(`ipcr-${ipcr_id}`)
            socket.off("assign")
        }
    }, [ipcr_id])

    useEffect(() => {
        if (!value) return

        const debounce = setTimeout(() => {
            updateSubTask(subTaskID, field, value)
                .then(() => {
                    loadIPCR(ipcr_id);
                })
                .catch(error => console.error(error.response?.data?.error))
        }, 100)

        return () => clearTimeout(debounce)
    }, [value])



    if (!ipcrInfo) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="py-4" style={{ minWidth: "1200px" }}>
            <ManageTaskSupportingDocuments ipcr_id={ipcrInfo.id} batch_id={ipcrInfo.batch_id} dept_mode={false} sub_tasks={arrangedSubTasks}></ManageTaskSupportingDocuments>
            <div className="d-flex justify-content-between align-items-center gap-2 mb-4">
                <Stack>
                    <Chip label={String(ipcrInfo.form_status).toUpperCase()} color="primary" variant={ipcrInfo.form_status == "draft" ? "outlined": "filled"}></Chip>
                </Stack>
                <Stack direction="row" spacing={1} >
                    <button
                        className="btn btn-outline-secondary d-none align-items-center gap-2"
                        data-bs-dismiss="modal"
                        onClick={switchPage}
                    >
                        <span className="material-symbols-outlined">undo</span>
                    </button>
                    
                    <DownloadIPCRButton onDownload={handleChange} downloading={downloading} />
                    <SupportingDocumentButton />
                    
                    <Divider orientation="vertical" flexItem /> 
                    
                    <SubmitIPCRButton onSubmit={()=> {handleSubmit(ipcrInfo.id, ipcrInfo.user)}} disabled={loading} status={ipcrInfo.form_status}></SubmitIPCRButton>
                </Stack>
            </div>

            <PlanningIndicator isPlanningPhase={isPlanningPhase(currentPhase)} />
            
            <MonitoringIndicator isMonitoringPhase={isMonitoringPhase(currentPhase)} />

            <div className="card shadow-sm">
                <div className="card-body p-4">
                    <HeaderSection />
                    <OathSection ipcrInfo={ipcrInfo} />
                    <div className="table-responsive mt-5 mb-4">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th style={{ width: "20%", textAlign: "center" }}>OUTPUT</th>
                                    <th style={{ width: "25%", textAlign: "center" }}>
                                        SUCCESS INDICATORS<br />
                                        <small className="text-muted">(TARGETS + MEASURES)</small>
                                    </th>
                                    <th style={{ width: "20%", textAlign: "center" }}>ACTUAL ACCOMPLISHMENT</th>
                                    <th style={{ width: "15%", textAlign: "center" }}>
                                        RATING<br />
                                        <small className="text-muted">Q² E² T² A²</small>
                                    </th>
                                    <th style={{ width: "20%", textAlign: "center" }}>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="table-secondary fw-bold">
                                    <td colSpan="5">CORE FUNCTIONS</td>
                                </tr>

                                {Object.entries(arrangedSubTasks).map(([category, tasks]) => (
                                    <TaskSection
                                        key={category}
                                        category={category}
                                        tasks={tasks}
                                        categoryStats={stats.categories[categoryTypes[category]]}
                                        handleDataChange={handleDataChange}
                                        handleSpanChange={handleSpanChange}
                                        handleRemarks={(rating) => handleRemarks(rating)}
                                        setSubTaskID={setSubTaskID}
                                        mode={mode}
                                        currentPhase={currentPhase}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <FinalRatingsSection
                        stats={stats}
                        ratingThresholds={ratingThresholds}
                        handleRemarks={handleRemarks}
                    />
                    <SignaturesSection ipcrInfo={ipcrInfo} />
                </div>
            </div>
        </div>
    )
}



export default EditIPCR