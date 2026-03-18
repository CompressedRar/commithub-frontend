import { useEffect, useState, useRef } from "react"
import { updateSubTask } from "../../services/pcrServices"
import { socket } from "../api"
import Swal from "sweetalert2"
import ManageTaskSupportingDocuments from "./ManageTaskSupportingDocuments"

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
import { useParams, useSearchParams } from "react-router-dom"
import { Step, StepLabel, Stepper } from "@mui/material"



function OtherIPCR({ onMouseOver}) {
    // Core data states

    const [searchParams] = useSearchParams()

    
    

    const { ipcr_id } = useParams()
    const dept_id = searchParams.get("dept_id")
    const mode = searchParams.get("mode")

    const [field, setField] = useState("")
    const [value, setValue] = useState(0)
    const [subTaskID, setSubTaskID] = useState(0)

    const [ratingThresholds, setRatingThresholds] = useState(null);
    const [currentPhase, setCurrentPhase] = useState(null)


    const { settings, handleRemarks, isMonitoringPhase } = useSettings();

    const { downloading, downloadStandard, downloadWeighted, downloadPlanned, stats, ipcrInfo, categoryTypes, arrangedSubTasks, loadIPCR } = useIPCR();

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


        socket.on("ipcr", () => loadIPCR(ipcr_id))
        socket.on("assign", () => loadIPCR(ipcr_id))

        return () => {
            socket.off("ipcr")
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
        <div className="py-4" style={{minWidth:"1200px"}} onMouseOver={onMouseOver}>

            <Stepper activeStep={1} alternativeLabel>
                    {["Planning", "Monitoring", "Rating",].map((label) => (
                    <Step key={label} completed={currentPhase && currentPhase.includes(label.toLowerCase())}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>   

            <ManageTaskSupportingDocuments ipcr_id={ipcrInfo.id} batch_id={ipcrInfo.batch_id} dept_mode={false} sub_tasks={arrangedSubTasks}></ManageTaskSupportingDocuments>
            <div className="d-flex justify-content-end align-items-center gap-2 mb-4">
                <button
                    className="btn btn-outline-secondary d-none align-items-center gap-2"
                    data-bs-dismiss="modal"
                >
                    <span className="material-symbols-outlined">undo</span>
                </button>
                <SupportingDocumentButton />
                <DownloadIPCRButton onDownload={handleChange} downloading={downloading} />
            </div>
            
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

export default OtherIPCR