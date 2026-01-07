import { useEffect, useState } from "react"
import { assignMainIPCR, downloadIPCR, getIPCR, updateSubTask } from "../../services/pcrServices"
import { socket } from "../api"
import { jwtDecode } from "jwt-decode"
import { getAccountInfo } from "../../services/userService"
import Swal from "sweetalert2"
import ManageTaskSupportingDocuments from "./ManageTaskSupportingDocuments"
import { getSettings } from "../../services/settingsService"

function EditIPCR(props) {
    // Core data states
    const [userinfo, setUserInfo] = useState(null)
    const [ipcrInfo, setIPCRInfo] = useState(null)
    const [currentUserInfo, setCurrentUserInfo] = useState(null)

    // UI states
    const [submitting, setSubmitting] = useState(false)
    const [canSubmit, setCanSubmit] = useState(false)
    const [canEval, setCanEval] = useState(false)

    // Task editing states
    const [field, setField] = useState("")
    const [value, setValue] = useState(0)
    const [subTaskID, setSubTaskID] = useState(0)

    const [downloading, setDownloading] = useState(false);

    // Organized task data
    const [arrangedSubTasks, setArrangedSubTasks] = useState({})
    const [categoryTypes, setCategoryTypes] = useState({})

    // Category statistics
    const [stats, setStats] = useState({
        quantity: 0,
        efficiency: 0,
        timeliness: 0,
        average: 0,
        categories: {
            "Core Function": { count: 0, total: 0, weight: 0 },
            "Strategic Function": { count: 0, total: 0, weight: 0 },
            "Support Function": { count: 0, total: 0, weight: 0 }
        }
    })

    async function download() {
        setDownloading(true);
        try {
          const res = await downloadIPCR(props.ipcr_id);
          window.open(res.data.link, "_blank", "noopener,noreferrer");
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.response?.data?.error || "Download failed.",
            icon: "error",
          });
        } finally {
          setDownloading(false);
        }
    }

    const [isRatingPeriod, setIsRatingPeriod] = useState(true)
    const [isMonitoringPeriod, setIsMonitoringPeriod] = useState(true)

    async function checkRatingPeriod() {
        try {
        const res = await getSettings()
        const data = res?.data?.data ?? res?.data ?? {}
        

        // determine rating period state (check explicit dates first, then fallbacks)
        try {
            let ratingOpen = true

            // prefer explicit start/end fields if present
            console.log("THE SETTINGS DATA: ",data)
            const startField = data.rating_start_date ?? data.ratingStartDate ?? data.rating_start
            const endField = data.rating_end_date ?? data.ratingEndDate ?? data.rating_end

            if (startField || endField) {
            console.log("Evaluating rating period from explicit start/end fields", startField, endField)
            try {
                const now = new Date()
                const start = startField ? new Date(startField) : null
                const end = endField ? new Date(endField) : null

                console.log(ratingOpen = now >= start && now <= end)

                if (start && end ) {
                ratingOpen = now >= start && now <= end
                } 
                else if (start && !end) {
                ratingOpen = now >= start
                }
                else {
                ratingOpen = false
                }
            } catch (e) {
                console.warn("rating start/end parse error", e)
            }
            } else {

            
                ratingOpen = false
            }

            setIsRatingPeriod(!!ratingOpen)
        } catch (e) {
            console.warn("Failed to evaluate rating period from settings", e)
            setIsRatingPeriod(true)
        }

        } catch (e) {
        console.warn("failed load formulas", e)
        }
    }

    async function checkMonitoringPeriod() {
        try {
        const res = await getSettings()
        const data = res?.data?.data ?? res?.data ?? {}
        

        // determine rating period state (check explicit dates first, then fallbacks)
        try {
            let ratingOpen = true

            // prefer explicit start/end fields if present
            console.log("THE SETTINGS DATA: ",data)
            const startField = data.monitoring_start_date
            const endField = data.monitoring_end_date 

            if (startField || endField) {
            console.log("Evaluating rating period from explicit start/end fields", startField, endField)
            try {
                const now = new Date()
                const start = startField ? new Date(startField) : null
                const end = endField ? new Date(endField) : null

                console.log(ratingOpen = now >= start && now <= end)

                if (start && end ) {
                ratingOpen = now >= start && now <= end
                } 
                else if (start && !end) {
                ratingOpen = now >= start
                }
                else {
                ratingOpen = false
                }
            } catch (e) {
                console.warn("rating start/end parse error", e)
            }
            } else {

            
                ratingOpen = false
            }

            setIsMonitoringPeriod(!!ratingOpen)
        } catch (e) {
            console.warn("Failed to evaluate rating period from settings", e)
            setIsMonitoringPeriod(true)
        }

        } catch (e) {
        console.warn("failed load formulas", e)
        }
    }

    const [ratingThresholds, setRatingThresholds] = useState(null);
    const [currentPhase, setCurrentPhase] = useState(null)

    const token = localStorage.getItem("token")

    function readTokenInformation() {
        try {
            const payload = jwtDecode(token)
            setCurrentUserInfo(payload)
        } catch (err) {
            console.error(err)
        }
    }

    async function loadUserInfo() {
        if (!token) return

        try {
            const payload = jwtDecode(token)
            const res = await getAccountInfo(payload.id).then(data => data.data)
            setUserInfo(res)
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })
        }
    }

    async function loadIPCR() {
        try {
            const res = await getIPCR(props.ipcr_id).then(data => data.data)
            console.log("IPCR", res)
            setIPCRInfo(res)
            processIPCRData(res)
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })
        }
    }

    function processIPCRData(res) {
        const sub_tasks = res.sub_tasks
        const all_categories = {}
        const all_category_type = {}
        const newStats = { ...stats }

        newStats.categories = {
            "Core Function": { count: 0, total: 0, weight: res.user_info.position.core_weight },
            "Strategic Function": { count: 0, total: 0, weight: res.user_info.position.strategic_weight },
            "Support Function": { count: 0, total: 0, weight: res.user_info.position.support_weight }
        }

        let q = 0, e = 0, t = 0, a = 0

        sub_tasks.forEach(task => {
            const category = task.main_task.category.name
            const type = task.main_task.category.type

            all_categories[category] = all_categories[category] || []
            all_category_type[category] = type

            if (newStats.categories[type]) {
                newStats.categories[type].count++
                newStats.categories[type].total += task.average
            }

            q += task.quantity
            e += task.efficiency
            t += task.timeliness
            a += task.average
            all_categories[category].push(task)
        })

        const count = sub_tasks.length || 1
        newStats.quantity = q / count
        newStats.efficiency = e / count
        newStats.timeliness = t / count
        newStats.average = a / count

        setArrangedSubTasks(all_categories)
        setCategoryTypes(all_category_type)
        setStats(newStats)
        console.log(all_categories)
    }

    // Update the handleRemarks function to use dynamic rating thresholds from settings
    function handleRemarks(rating, ratingThresholds) {
        const r = parseFloat(rating)

        // Default thresholds if not provided
        const thresholds = ratingThresholds || {
            outstanding: { min: 4.5 },
            very_satisfactory: { min: 3.5, max: 4.49 },
            satisfactory: { min: 2.5, max: 3.49 },
            unsatisfactory: { min: 1.5, max: 2.49 },
            poor: { max: 1.49 }
        }

        // Check against each threshold
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
    }

    function handleDataChange(e) {
        setField(e.target.name)
        setValue(e.target.value)
    }

    function handleSpanChange(e) {
        setField(e.target.className)
        setValue(e.target.textContent)
    }

    function allTargetsFilled(ipcr) {
        return ipcr?.sub_tasks?.every(task => task.target_acc && task.target_time && task.target_mod) || false
    }

    async function handleAssign() {
        setSubmitting(true)
        try {
            const res = await assignMainIPCR(ipcrInfo.id, ipcrInfo.user).then(data => data.data.message)

            if (res === "IPCR successfully assigned.") {
                Swal.fire({
                    title: "Success",
                    text: "IPCR successfully submitted.",
                    icon: "success"
                })
                loadIPCR()
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Submission of IPCR failed",
                    icon: "error"
                })
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })
        } finally {
            setSubmitting(false)
        }
    }

    function assignIPCR() {
        Swal.fire({
            title: "Assign",
            text: "Assigning this IPCR would make it eligible for consolidation. Continue?",
            showDenyButton: true,
            confirmButtonText: "Assign",
            denyButtonText: "No",
            denyButtonColor: "grey",
            icon: "question"
        }).then((result) => {
            if (result.isConfirmed) handleAssign()
        })
    }

    // Load settings/thresholds
    async function loadRatingThresholds() {
        try {
            const res = await getSettings(); // import from settingsService

            console.log("Settings response:", res);
            if (res?.data?.data?.rating_thresholds) {
                let rt = res.data.data.rating_thresholds;
                if (typeof rt === "string") {
                    rt = JSON.parse(rt);
                }
                console.log("Loaded rating thresholds:", rt);
                setRatingThresholds(rt);
            }
        } catch (error) {
            console.error("Failed to load rating thresholds:", error);
        }
    }

    // Load current phase from settings
    async function loadCurrentPhase() {
        try {
            const res = await getSettings()
            const phase = res?.data?.data?.current_phase
            console.log("Current phase:", phase)
            setCurrentPhase(phase)
        } catch (error) {
            console.error("Failed to load current phase:", error)
        }
    }

    // Effects
    useEffect(() => {
        loadIPCR()
        loadUserInfo()
        loadRatingThresholds()
        loadCurrentPhase() // Add this
        readTokenInformation()

        socket.on("ipcr", loadIPCR)
        socket.on("ipcr_added", loadIPCR)
        socket.on("ipcr_remove", loadIPCR)
        socket.on("assign", loadIPCR)

        return () => {
            socket.off("ipcr")
            socket.off("ipcr_added")
            socket.off("ipcr_remove")
            socket.off("assign")
        }
    }, [])

    useEffect(() => {
        if (!value) return

        const debounce = setTimeout(() => {
            updateSubTask(subTaskID, field, value)
                .then(() => {
                    setCanSubmit(allTargetsFilled(ipcrInfo))
                    getIPCR(props.ipcr_id).then(res => setIPCRInfo(res.data))
                })
                .catch(error => console.error(error.response?.data?.error))
        }, 100)

        return () => clearTimeout(debounce)
    }, [value])

    useEffect(() => {
        if (!ipcrInfo || !userinfo) return
        const ipcr_full = `${ipcrInfo.user_info.first_name} ${ipcrInfo.user_info.last_name}`
        const visitor_full = `${userinfo.first_name} ${userinfo.last_name}`
        setCanEval(ipcr_full !== visitor_full)
    }, [ipcrInfo, userinfo])

    useEffect(() => {
        const modalBody = document.querySelector("#view-ipcr .modal-body")
        if (!modalBody) return

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = modalBody
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                console.log("Reached bottom of modal")
            }
        }

        modalBody.addEventListener("scroll", handleScroll)
        return () => modalBody.removeEventListener("scroll", handleScroll)
    }, [])

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
        <div onMouseOver={props.onMouseOver} className="py-4" style={{minWidth:"1200px"}}>
            <ManageTaskSupportingDocuments ipcr_id={ipcrInfo.id} batch_id={ipcrInfo.batch_id} dept_mode={false} sub_tasks={arrangedSubTasks}></ManageTaskSupportingDocuments>
            {/* Header */}
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button
                    className="btn btn-outline-secondary d-none align-items-center gap-2"
                    data-bs-dismiss="modal"
                    onClick={props.switchPage}
                >
                    <span className="material-symbols-outlined">undo</span>
                    Back to IPCRs
                </button>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2 "
                        data-bs-toggle="modal"
                        data-bs-target="#manage-docs"
                        >
                        <span className="material-symbols-outlined fs-5 m-1">attach_file</span>
                        Documents
                    </button>
                    {
                        true && 
                        <button className="btn btn-outline-primary d-flex" onClick={download} disabled={downloading}>
                            {downloading ? <span className="spinner-border spinner-border-sm me-2"></span> : <span className="material-symbols-outlined me-1">download</span>}
                            Download
                        </button>
                    }
                </div>

                {canSubmit && props.mode === "faculty" && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        disabled={submitting}
                        onClick={assignIPCR}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">article_shortcut</span>
                                Submit IPCR
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Alert - Show phase restriction info */}
            <div className="alert alert-info d-flex align-items-center gap-2 mb-4" role="alert">
                <span className="material-symbols-outlined">info</span>
                <span>
                    Only modify fields with <strong className="text-success">green background</strong>.
                    {!isMonitoringPhase(currentPhase) && (
                        <>
                            <br />
                            <strong className="text-warning">Target and actual accomplishment fields are only editable during the Monitoring phase.</strong>
                        </>
                    )}
                </span>
            </div>

            {/* Main Card */}
            <div className="card shadow-sm">
                <div className="card-body p-4">
                    {/* Header Section */}
                    <HeaderSection ipcrInfo={ipcrInfo} />

                    {/* Oath Section */}
                    <OathSection ipcrInfo={ipcrInfo} />
 
                    {/* Tasks Table */}
                    <div className="table-responsive mt-5 mb-4">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th style={{ width: "20%", textAlign:"center" }}>OUTPUT</th>
                                    <th style={{ width: "25%", textAlign:"center"  }}>
                                        SUCCESS INDICATORS<br />
                                        <small className="text-muted">(TARGETS + MEASURES)</small>
                                    </th>
                                    <th style={{ width: "20%", textAlign:"center"  }}>ACTUAL ACCOMPLISHMENT</th>
                                    {
                                        isRatingPhase(currentPhase) && <>
                                            <th style={{ width: "15%", textAlign:"center"  }}>
                                                RATING<br />
                                                <small className="text-muted">Q² E² T² A²</small>
                                            </th>
                                            <th style={{ width: "20%", textAlign:"center"  }}>REMARKS</th>
                                        </>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(arrangedSubTasks).map(([category, tasks]) => (
                                    <TaskSection
                                        key={category}
                                        category={category}
                                        tasks={tasks}
                                        categoryType={categoryTypes[category]}
                                        categoryStats={stats.categories[categoryTypes[category]]}
                                        handleDataChange={handleDataChange}
                                        handleSpanChange={handleSpanChange}
                                        handleRemarks={(rating) => handleRemarks(rating, ratingThresholds)}
                                        setSubTaskID={setSubTaskID}
                                        mode={props.mode}
                                        ipcrInfo={ipcrInfo}
                                        currentPhase={currentPhase}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Final Ratings */}
                    {
                        isRatingPhase(currentPhase) && 
                        <FinalRatingsSection 
                            stats={stats} 
                            ratingThresholds={ratingThresholds}
                            handleRemarks={handleRemarks}
                            currentPhase={currentPhase}
                        />
                    }

                    {/* Signatures */}
                    <SignaturesSection ipcrInfo={ipcrInfo} />
                </div>
            </div>
        </div>
    )
}


// Sub-component: Header
function HeaderSection({ ipcrInfo }) {
    return (
        <div className="text-center mb-5">
            <div className="row align-items-center mb-3 g-2">
                <div className="col-md-2 d-flex justify-content-center">
                    <img
                        src={`${import.meta.env.BASE_URL}municipal.png`}
                        alt="Municipal Logo"
                        style={{ height: "80px", objectFit: "contain" }}
                    />
                </div>
                <div className="col-md-8">
                    <p className="mb-1 small">Republic of the Philippines</p>
                    <p className="mb-1 small">Province of Bulacan</p>
                    <p className="mb-2"><strong>Municipality of Norzagaray</strong></p>
                    <h5 className="mb-0"><strong>NORZAGARAY COLLEGE</strong></h5>
                </div>
                <div className="col-md-2 d-flex justify-content-center">
                    <img
                        src={`${import.meta.env.BASE_URL}LogoNC.png`}
                        alt="College Logo"
                        style={{ height: "80px", objectFit: "contain" }}
                    />
                </div>
            </div>
            <h4 className="fw-bold mt-3">INDIVIDUAL PERFORMANCE COMMITMENT & REVIEW FORM</h4>
        </div>
    )
}

// Sub-component: Oath Section
function OathSection({ ipcrInfo }) {
    return (
        <div className="mb-4 p-3 bg-light rounded-3">
            <p className="fst-italic mb-3">
                I, <strong>{ipcrInfo?.user_info.first_name} {ipcrInfo?.user_info.last_name}</strong>,
                Librarian of the <strong>NORZAGARAY COLLEGE</strong>, commit to deliver and agree to be rated on
                the attainment of the following targets in accordance with the indicated measures for the period
                <strong> JULY - DECEMBER 2025</strong>
            </p>

            <div className="row g-3">
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="form-label fw-semibold">Ratee</label>
                        <input
                            type="text"
                            className="form-control"
                            value={`${ipcrInfo?.user_info.first_name} ${ipcrInfo?.user_info.last_name}`}
                            readOnly
                        />
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="row mt-3">
                <div className="col-12">
                    <div className="ps-3 border-start border-3 border-primary">
                        <small className="d-block">5 - OUTSTANDING</small>
                        <small className="d-block">4 - VERY SATISFACTORY</small>
                        <small className="d-block">3 - SATISFACTORY</small>
                        <small className="d-block">2 - UNSATISFACTORY</small>
                        <small className="d-block">1 - POOR</small>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Sub-component: Task Section (replaces Core/Strategic/Support repetition)
function TaskSection({
    category,
    tasks,
    categoryType,
    categoryStats,
    handleDataChange,
    handleSpanChange,
    handleRemarks,
    setSubTaskID,
    mode,
    ipcrInfo,
    currentPhase
}) {
    if (!categoryStats || categoryStats.count === 0) return null

    const rawAvg = categoryStats.total / categoryStats.count
    const weightedAvg = categoryStats.weight * rawAvg

    return (
        <>
            <tr className="table-secondary fw-bold">
                <td colSpan="5">{categoryType}</td>
            </tr>
            <tr className="table-light small">
                <td colSpan="5" className="text-muted">{category}</td>
            </tr>

            {tasks.map((task) => (
                <TaskRow
                    key={task.id}
                    task={task}
                    handleDataChange={handleDataChange}
                    handleSpanChange={handleSpanChange}
                    handleRemarks={handleRemarks}
                    setSubTaskID={setSubTaskID}
                    mode={mode}
                    ipcrInfo={ipcrInfo}
                    currentPhase={currentPhase}
                />
            ))}


            
        </>
    )
}

function RatingBadges({ task, currentPhase }) {
    return (
        <div style = {{
            display:"grid",
            gridTemplateColumns:"repeat(4, 1fr)",
        }}>
            <div className="text-center" style={{fontSize:"1.5rem", borderStyle:"solid", borderWidth:"0 1px 0 0", borderColor:"grey", height: "100%"}}>
                <div>{isRatingPhase(currentPhase) && parseFloat(task.quantity).toFixed(0)}</div>
            </div>
            <div className="text-center" style={{fontSize:"1.5rem", borderStyle:"solid", borderWidth:"0 1px 0 0", borderColor:"grey", height: "100%"}}>
                <div>{isRatingPhase(currentPhase) && parseFloat(task.efficiency).toFixed(0)}</div>
            </div>
            <div className="text-center" style={{fontSize:"1.5rem", borderStyle:"solid", borderWidth:"0 1px 0 0", borderColor:"grey", height: "100%"}}>
                <div>{isRatingPhase(currentPhase) && parseFloat(task.timeliness).toFixed(0)}</div>
            </div>
            <div className="text-center" style={{fontSize:"1.5rem"}}>
                <div>{isRatingPhase(currentPhase) && parseFloat(task.average).toFixed(0)}</div>
            </div>
        </div>
    )
}
function numericKeyDown(e) {
    const allowed = [
        "Backspace","Tab","ArrowLeft","ArrowRight","Delete","Enter","Home","End"
    ]
    if (allowed.includes(e.key)) return
    // allow digits and single dot
    const isDigit = /^[0-9]$/.test(e.key)
    const isDot = e.key === "."
    if (!isDigit && !isDot) {
        e.preventDefault()
        return
    }
    // prevent multiple dots
    if (isDot && e.target.value.includes(".")) {
        e.preventDefault()
    }
}

function handlePasteNumeric(e) {
    e.preventDefault()
    const pasted = (e.clipboardData || window.clipboardData).getData("text")
    const sanitized = pasted.replace(/[^0-9.]/g, "")
    if (!sanitized) return
    // insert sanitized text at cursor
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    const value = e.target.value
    e.target.value = value.slice(0, start) + sanitized + value.slice(end)
    // dispatch input event so React picks up change
    const evt = new Event("input", { bubbles: true })
    e.target.dispatchEvent(evt)
}

function sanitizeNumberInput(e) {
    // remove any non-digit/non-dot characters and trim multiple dots
    let v = e.target.value.replace(/[^0-9.]/g, "")
    const parts = v.split(".")
    if (parts.length > 2) v = parts.shift() + "." + parts.join("")
    if (v !== e.target.value) {
        e.target.value = v
    }
}
// Sub-component: Task Row
function TaskRow({ task, handleDataChange, handleSpanChange, handleRemarks, setSubTaskID, mode, ipcrInfo, currentPhase }) {
    const isEditable = mode === "faculty" && ipcrInfo?.form_status !== "approved"
    const isEditableMode = mode === "faculty" && ipcrInfo?.form_status !== "approved"
    const isEditableDuringMonitoring = isMonitoringPhase(currentPhase)
    
    // Target fields only editable during monitoring phase
    const isTargetEditable = isEditableMode && isEditableDuringMonitoring
    // Actual fields only editable during monitoring phase
    const isActualEditable = isEditableMode && isEditableDuringMonitoring

    const onNumberInput = (e) => {
        sanitizeNumberInput(e)
        handleDataChange(e)
    }

    // submit datetime values immediately to server for a sub-task
    async function submitDateTimeChange(subTaskId, fieldName, datetimeLocal) {
      if (!subTaskId || !fieldName) return;
      if (!datetimeLocal) {
        Swal.fire("Validation", "Please provide a valid date/time.", "warning");
        return;
      }
  
      const d = new Date(datetimeLocal);
      if (isNaN(d.getTime())) {
        Swal.fire("Error", "Invalid date/time value.", "error");
        return;
      }
  
      const iso = d.toISOString();
  
      try {
        await updateSubTask(subTaskId, fieldName, iso);
        // refresh IPCR data so UI shows updated value
      } catch (error) {
        console.error("Failed to save datetime:", error);
        Swal.fire("Error", error.response?.data?.error || "Failed to save date/time", "error");
      }
    }

    return (
        <>
            <tr className="align-middle">
                <td className="fw-semibold small">{task.title}</td>
                <td className>
                    <div className="d-grid gap-2">
                        <div>
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*"
                                name="target_acc"
                                defaultValue={task.target_acc}
                                className={`form-control form-control-sm no-spinner`}
                                onClick={() => isTargetEditable && setSubTaskID(task.id)}
                                onKeyDown={numericKeyDown}
                                onPaste={handlePasteNumeric}
                                onInput={onNumberInput}
                                disabled={true}
                                title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                            />
                            <span className="text-muted small d-block">{task.main_task.target_acc} in</span>
                            
                        </div>
                        <div>
                            {task.main_task.timeliness_mode == "timeframe"? 
                            <>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    pattern="[0-9]*"
                                    name="target_time"
                                    defaultValue={task.main_task.target_timeframe}
                                    className={`form-control form-control-sm no-spinner `}
                                    onClick={() => isTargetEditable && setSubTaskID(task.id)}
                                    onKeyDown={numericKeyDown}
                                    onPaste={handlePasteNumeric}
                                    onInput={onNumberInput}
                                    disabled={true}
                                    title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                                />
                                <span className="text-muted small d-block">{task.main_task.time} with</span>
                                
                            </>:
                            <>
                                <input 
                                    type="date" 
                                    name="target_deadline"
                                    className={`form-control form-control-sm no-spinner`}
                                    value={formatDateForInput(task.main_task.target_deadline)}
                                    onChange={(e) => submitDateTimeChange(task.id, "target_deadline", e.target.value)}
                                    disabled={true}
                                    title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                                />
                                <span className="text-muted small d-block">on set deadline with</span>
                                

                            </>}
                        </div>
                        <div>
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*"
                                name="target_mod"
                                defaultValue={task.main_task.target_efficiency}
                                className={`form-control form-control-sm no-spinner `}
                                onClick={() => isTargetEditable && setSubTaskID(task.id)}
                                onKeyDown={numericKeyDown}
                                onPaste={handlePasteNumeric}
                                onInput={onNumberInput}
                                disabled={true}
                                title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                            />
                            <span className="text-muted small d-block">{task.main_task.modification}</span>
                            
                        </div>
                    </div>
                </td>
                <td>
                    <div className="d-grid gap-2">
                        <div>
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*"
                                name="actual_acc"
                                defaultValue={task.actual_acc}
                                className={`form-control form-control-sm no-spinner ${isActualEditable ? "bg-success bg-opacity-25" : ""}`}
                                onClick={() => isActualEditable && setSubTaskID(task.id)}
                                onKeyDown={numericKeyDown}
                                onPaste={handlePasteNumeric}
                                onInput={onNumberInput}
                                disabled={!isActualEditable}
                                title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                            />
                            <span className="text-muted small d-block">{task.main_task.actual_acc} in</span>
                            
                        </div>
                        <div>
                            {task.main_task.timeliness_mode == "timeframe"? 
                            <>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    pattern="[0-9]*"
                                    name="actual_time"
                                    defaultValue={task.actual_time}
                                    
                                    className={`form-control form-control-sm no-spinner ${isActualEditable ? "bg-success bg-opacity-25" : ""}`}
                                    onClick={() => isTargetEditable && setSubTaskID(task.id)}
                                    onKeyDown={numericKeyDown}
                                    onPaste={handlePasteNumeric}
                                    onInput={onNumberInput}
                                    disabled={!isActualEditable}
                                    title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                                />
                                <span className="text-muted small d-block">{task.main_task.time} with</span>
                                
                            </>:
                            <>
                                <input 
                                    type="date" 
                                    name = "actual_deadline"
                                    className={`form-control form-control-sm no-spinner ${isActualEditable ? "bg-success bg-opacity-25" : ""}`}
                                    value={formatDateForInput(task.actual_deadline) }
                                    onChange={(e) => submitDateTimeChange(task.id, "actual_deadline", e.target.value)}
                                    disabled={!isActualEditable}
                                    title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                                />
                                <span className="text-muted small d-block">on set deadline with</span>
                                

                            </>}
                        </div>
                        <div>
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*"
                                name="actual_mod"
                                defaultValue={task.actual_mod}
                                className={`form-control form-control-sm no-spinner ${isActualEditable ? "bg-success bg-opacity-25" : ""}`}
                                onClick={() => isActualEditable && setSubTaskID(task.id)}
                                onKeyDown={numericKeyDown}
                                onPaste={handlePasteNumeric}
                                onInput={onNumberInput}
                                disabled={!isActualEditable}
                                title={!isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                            />
                            <span className="text-muted small d-block">{task.main_task.modification}</span>
                            
                        </div>
                    </div>
                </td>
                {isRatingPhase(currentPhase) && <>  
                    <td className="small text-center">
                        <RatingBadges task={task} currentPhase = {currentPhase} />
                    </td>
                    <td className="small text-center fw-semibold">{handleRemarks(task.average)}</td>
                </>}
            </tr>
        </>
    )
}

// Sub-component: Final Ratings
function FinalRatingsSection({ stats, ratingThresholds, handleRemarks, currentPhase }) {
    const categories = stats?.categories || {}
    const core = categories["Core Function"] || { count: 0, total: 0, weight: 0 }
    const strategic = categories["Strategic Function"] || { count: 0, total: 0, weight: 0 }
    const support = categories["Support Function"] || { count: 0, total: 0, weight: 0 }

    const calcRaw = (c) => (c.count ? c.total / c.count : 0)
    const coreRaw = calcRaw(core)
    const strategicRaw = calcRaw(strategic)
    const supportRaw = calcRaw(support)

    const coreWeighted = coreRaw * (core.weight ?? 0)
    const strategicWeighted = strategicRaw * (strategic.weight ?? 0)
    const supportWeighted = supportRaw * (support.weight ?? 0)

    const overallWeighted = coreWeighted + strategicWeighted + supportWeighted

    return (
        <div className="row g-3 my-4">
            <div className="col-md-4">
                <div className="card h-100 border">
                    <div className="card-body">
                        <h6 className="card-title fw-bold">Final Average Rating</h6>
                        <div className="d-grid gap-2 small">
                            <div className="d-flex justify-content-between">
                                <span>Quantity (Q):</span>
                                <strong>{isRatingPhase(currentPhase) && parseFloat(stats.quantity).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Efficiency (E):</span>
                                <strong>{isRatingPhase(currentPhase) && parseFloat(stats.efficiency).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Timeliness (T):</span>
                                <strong>{isRatingPhase(currentPhase) && parseFloat(stats.timeliness).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2">
                                <span>Average (A):</span>
                                <strong>{isRatingPhase(currentPhase) && parseFloat(stats.average).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            

            <div className="col-md-4">
                <div className="card h-100 border text-center">
                    <div className="card-body d-flex flex-column justify-content-center">
                        <h6 className="card-title fw-bold">Adjectival Rating</h6>
                        <p className="mb-0 fs-6 fw-bold text-warning">
                            {handleRemarks(parseFloat(stats.average).toFixed(2), ratingThresholds)}
                        </p>
                        <small className="text mt-2">Overall Average: {isRatingPhase(currentPhase) && parseFloat(stats.average).toFixed(2)}</small>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Sub-component: Signatures
function SignaturesSection({ ipcrInfo }) {
    const people = [
        { label: "Reviewed by", ...ipcrInfo?.review },
        { label: "Approved by", ...ipcrInfo?.approve },
        { label: "Discussed with", ...ipcrInfo?.discuss },
        { label: "Assessed by", ...ipcrInfo?.assess },
        { label: "Final Rating by", ...ipcrInfo?.final },
        { label: "Confirmed by", ...ipcrInfo?.confirm }
    ]

    return (
        <div className="mt-5">
            <div className="row g-3">
                {people.map((person, idx) => (
                    <div key={idx} className="col-md-6">
                        <div className="border-top pt-3">
                            <p className="small mb-1 fw-semibold">{person.label}:</p>
                            <p className="mb-0 fw-bold">{person?.name?.toUpperCase()}</p>
                            <p className="small text-muted mb-3">{person?.position}</p>                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Add this function near the top of the component, after other helper functions
function isMonitoringPhase(currentPhase) {
  return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring")
}

function isRatingPhase(currentPhase) {
  return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating")
}

// Add this helper function near the top with other helper functions
function formatDateForInput(dateString) {
  if (!dateString) return "";
  
  try {
    // Handle both ISO 8601 and other date formats
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "";
    }
    
    // Convert to YYYY-MM-DD format (required by date input)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

export default EditIPCR