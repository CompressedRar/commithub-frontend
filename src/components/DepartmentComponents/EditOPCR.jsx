import { useEffect, useState } from "react"
import {
  approveOPCR,
  downloadOPCR,
  downloadPlannedOPCR,
  downloadWeightedOPCR,
  getAssignedTasksByDept,
  getOPCR,
  reviewOPCR,
  updateRating
} from "../../services/pcrServices"
import { socket } from "../api"
import Swal from "sweetalert2"
import { jwtDecode } from "jwt-decode"
import { getAccountInfo } from "../../services/userService"
import { getSettings } from "../../services/settingsService"
import { getCategories } from "../../services/categoryService"
import ManageDeptSupportingDocuments from "../Faculty/ManageDeptSupportingDocuments"



function EditOPCR(props) {
  const [opcrInfo, setOPCRInfo] = useState(null)
  const [quantityFormula, setQuantityFormula] = useState(null)
  const [efficiencyFormula, setEfficiencyFormula] = useState(null)
  const [timelinessFormula, setTimelinessFormula] = useState(null)


  const [assignedData, setAssignedData] = useState(null)
  const [headData, setHeadData] = useState(null)
  const [formStatus, setFormStatus] = useState(null)

  const [quantityAvg, setQuantity] = useState(0)
  const [efficiencyAvg, setEfficiency] = useState(0)
  const [timelinessAvg, setTimeliness] = useState(0)
  const [allAvg, setAllAvg] = useState(0)

  const [downloading, setDownloading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  // new state: whether current system settings allow rating now
  const [isRatingPeriod, setIsRatingPeriod] = useState(true)

  const [field, setField] = useState("")
  const [value, setValue] = useState(0)
  const [ratingID, setRatingID] = useState(0)

  const [canEval, setCanEval] = useState(false)
  const [ratingThresholds, setRatingThresholds] = useState(null)

  const [categoriesTypes, setCategoryTypes] = useState({})

  const token = localStorage.getItem("token")

  const [mainTasks, setMainTasks] = useState(null)

  async function loadOPCR() {
    const res = await getOPCR(props.opcr_id)
      .then((d) => d.data)
      .catch((error) => {
        Swal.fire("Error", error.response?.data?.error || "Failed to load OPCR", "error")
        return null
      })

    if (!res) return
    console.log("OPCR Data: ", res)
    setOPCRInfo(res.ipcr_data)
    setFormStatus(res.form_status?.toUpperCase())
    setAssignedData(res.assigned)
    setHeadData(res.admin_data)
  }

  async function loadMainTasks() {
    try {
      console.log("LOADING TAKSS")
      const res = await getAssignedTasksByDept()
      const maintasks = res?.data?.tasks
      console.log("Current main tasks:", maintasks)

    } catch (error) {
      console.error("Failed to load current phase:", error)
      }
    }

  const [currentPhase, setCurrentPhase] = useState(null) //monitoring, rating, planning

  async function loadCurrentPhase() {
    try {
      const res = await getSettings()
      const phase = res?.data?.data?.current_phase
      console.log("Current phase:", phase)
      setCurrentPhase(phase) //monitoring, rating, planning
    } catch (error) {
      console.error("Failed to load current phase:", error)
      }
    }

  async function loadCategoryTypes() {
    try{
      const res = await getCategories()

      if(!res) return
      const data = res.data.reduce((acc, category) => {
        acc[category.name] = category.type
        return acc
      }, {})
      console.log("Category Types: ", data)
      setCategoryTypes(data)


    }
    catch (e) {
      console.log("failed load category types", e)
    }
  }

  async function loadUserInfo() {
    if (!token) return
    try {
      const payload = jwtDecode(token)
      const res = await getAccountInfo(payload.id).then((d) => d.data)
      setUserInfo(res)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadFormulas() {
    try {
      const res = await getSettings()
      const data = res?.data?.data ?? res?.data ?? {}
      if (data.quantity_formula) setQuantityFormula(typeof data.quantity_formula === "string" ? data.quantity_formula : data.quantity_formula)
      if (data.efficiency_formula) setEfficiencyFormula(typeof data.efficiency_formula === "string" ? data.efficiency_formula : data.efficiency_formula)
      if (data.timeliness_formula) setTimelinessFormula(typeof data.timeliness_formula === "string" ? data.timeliness_formula : data.timeliness_formula)
      if (data.rating_thresholds) {
        let rt = data.rating_thresholds
        if (typeof rt === "string") rt = JSON.parse(rt)
        setRatingThresholds(rt)
      }

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

          const rp = data.rating_period ?? data.ratingPeriod ?? data.rating_window
          if (rp) {
            let period = rp
            if (typeof rp === "string") {
              try { period = JSON.parse(rp) } catch {}
            }
            if (period && period.start && period.end) {
              const now = new Date()
              const start = new Date(period.start)
              const end = new Date(period.end)
              if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                ratingOpen = now >= start && now <= end
              }
            } else if (typeof period === "boolean") {
              ratingOpen = period
            }
          }
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

  async function download() {
    setDownloading(true)
    const link = await downloadOPCR(props.opcr_id)
      .then((d) => d.data.link)
      .catch((err) => {
        Swal.fire("Error", err.response?.data?.error || "Failed to download", "error")
        return null
      })
    if (link) window.open(link, "_blank", "noopener,noreferrer")
    setDownloading(false)
  }
  
  async function downloadPlanned() {
              setDownloading(true)
              var res = await downloadPlannedOPCR(props.dept_id).then(data => data.data.link).catch(error => {
                  console.log(error.response.data.error)
                  Swal.fire({
                      title: "Error",
                      text: error.response.data.error,
                      icon: "error"
                  })
              })
                  window.open(res, "_blank", "noopener,noreferrer");
                  setDownloading(false)
              }

  async function downloadWeighted() {
    setDownloading(true)
    const link = await downloadWeightedOPCR(props.opcr_id)
      .then((d) => d.data.link)
      .catch((err) => {
        Swal.fire("Error", err.response?.data?.error || "Failed to download", "error")
        return null
      })
    if (link) window.open(link, "_blank", "noopener,noreferrer")
    setDownloading(false)
  }

  async function handleApproval() {
    const res = await approveOPCR(props.opcr_id)
      .then((d) => d.data.message)
      .catch((err) => {
        Swal.fire("Error", err.response?.data?.error || "Approve failed", "error")
        return null
      })
    if (res) {
      Swal.fire("Success", res, "success")
      loadOPCR()
    }
  }

  async function handleReview() {
    const res = await reviewOPCR(props.opcr_id)
      .then((d) => d.data.message)
      .catch((err) => {
        Swal.fire("Error", err.response?.data?.error || "Review failed", "error")
        return null
      })
    if (res) {
      Swal.fire("Success", res, "success")
      loadOPCR()
    }
  }

  function handleRemarks(rating, thresholds) {
    const r = parseFloat(rating)
    const thresh = thresholds || {
      outstanding: { min: 4.5 },
      very_satisfactory: { min: 3.5, max: 4.49 },
      satisfactory: { min: 2.5, max: 3.49 },
      unsatisfactory: { min: 1.5, max: 2.49 },
      poor: { max: 1.49 }
    }

    if (thresh.outstanding && r >= (thresh.outstanding.min ?? 4.5)) return "OUTSTANDING"
    if (thresh.very_satisfactory && r >= (thresh.very_satisfactory.min ?? 3.5) && r <= (thresh.very_satisfactory.max ?? 4.49)) return "VERY SATISFACTORY"
    if (thresh.satisfactory && r >= (thresh.satisfactory.min ?? 2.5) && r <= (thresh.satisfactory.max ?? 3.49)) return "SATISFACTORY"
    if (thresh.unsatisfactory && r >= (thresh.unsatisfactory.min ?? 1.5) && r <= (thresh.unsatisfactory.max ?? 2.49)) return "UNSATISFACTORY"
    if (thresh.poor && r <= (thresh.poor.max ?? 1.49)) return "POOR"
    return "UNKNOWN"
  }

  useEffect(() => {
    loadOPCR()
    loadUserInfo()
    loadFormulas()
    loadCategoryTypes()
    loadMainTasks()


    loadCurrentPhase()

    socket.on("ipcr", loadOPCR)
    socket.on("ipcr_added", loadOPCR)
    socket.on("rating", loadOPCR)
    socket.on("opcr_created", loadOPCR)

    return () => {
      socket.off("ipcr")
      socket.off("ipcr_added")
      socket.off("rating")
      socket.off("opcr_created")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!opcrInfo) return

    console.log("opcr info loaded: ", opcrInfo)

    const evalExpression = (expr, ctx = {}) => {
      if (!expr || typeof expr !== "string") return null
      try {
        const fn = new Function(...Object.keys(ctx), `return (${expr})`)
        const res = fn(...Object.values(ctx))
        if (Number.isFinite(res)) return res
      } catch (e) {
        console.warn("Formula eval error", expr, e)
      }
      return null
    }

    const applyToTask = (task) => {
      const ctx = {
        target_acc: task.summary?.target ?? 0,
        actual_acc: task.summary?.actual ?? 0,
        target_time: task.working_days?.target ?? 0,
        actual_time: task.working_days?.actual ?? 0,
        target_mod: task.corrections?.target ?? 0,
        actual_mod: task.corrections?.actual ?? 0,
        quantity: task.rating?.quantity ?? 0,
        efficiency: task.rating?.efficiency ?? 0,
        timeliness: task.rating?.timeliness ?? 0
      }
      const qExpr = typeof quantityFormula === "string" ? quantityFormula : quantityFormula?.expression
      const eExpr = typeof efficiencyFormula === "string" ? efficiencyFormula : efficiencyFormula?.expression
      const tExpr = typeof timelinessFormula === "string" ? timelinessFormula : timelinessFormula?.expression

      const q = evalExpression(qExpr, ctx)
      const e = evalExpression(eExpr, ctx)
      const t = evalExpression(tExpr, ctx)
      const clamp = (v, fallback) => {
        if (v === null || v === undefined) return fallback
        const n = Number(v)
        if (!Number.isFinite(n)) return fallback
        return Math.min(5, Math.max(0, parseFloat(n.toFixed(2))))
      }
      const cq = clamp(q, task.rating?.quantity ?? 0)
      const ce = clamp(e, task.rating?.efficiency ?? 0)
      const ct = clamp(t, task.rating?.timeliness ?? 0)
      return { ...task, _computed: { quantity: cq, efficiency: ce, timeliness: ct, average: ((cq + ce + ct) / 3) } }
    }

    let qSum = 0, eSum = 0, tSum = 0, allSum = 0
    let count = 0
    let qCount = 0, eCount = 0, tCount = 0;


    // Iterate through new nested structure: functionObj > categoryObj > tasks
    opcrInfo.forEach(categoryObj => {
        Object.entries(categoryObj).forEach(([category, tasks]) => {
            tasks.forEach(task => {
                let q = task.rating.quantity;
                let e = task.rating.efficiency;
                let t = task.rating.timeliness;
                
                let avg = calculateAverage(q, e, t);

                qSum += q; eSum += e; tSum += t; allSum += avg;
                qCount++; eCount++; tCount++;
                count++;
                });
            });
        });

    if (count === 0) return
    setQuantity(qSum / count)
    setEfficiency(eSum / count)
    setTimeliness(tSum / count)
    setAllAvg(allSum / count)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opcrInfo, quantityFormula, efficiencyFormula, timelinessFormula])

  function calculateAverage(quantity, efficiency, timeliness) {
        let calculations = quantity + efficiency + timeliness;
        let result = calculations / 3;

        return result;
    }

  useEffect(() => {
    if (!userInfo) return
    setCanEval(userInfo.role === "president" || userInfo.role === "administrator")
  }, [userInfo])

  useEffect(() => {
    if (value == "") return
    const debounce = setTimeout(() => {
      updateRating(ratingID, field, value).catch((err) => console.error(err.response?.data?.error || err))
    }, 500)
    return () => clearTimeout(debounce)
  }, [value])

  if (!opcrInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4" style={{minWidth:"1200px"}} >

      {/* Overlay when rating period is closed in system settings */}


      {/* Header */}
      <ManageDeptSupportingDocuments dept_id={props.dept_id} dept_mode={true} sub_tasks={props.arrangedSubTasks}></ManageDeptSupportingDocuments>
      <div className="d-flex justify-content-between gap-2 align-items-center mb-4">
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2" data-bs-dismiss="modal" onClick={() => props.switchPage()}>
          <span className="material-symbols-outlined">undo</span>
          Back to PCR
        </button>
        <button className="btn btn-outline-primary d-none" >
                {downloading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Download Weighted OPCR"}
                
              </button>
        <div className="d-flex align-items-center gap-2">
          
        <button className="btn btn-primary" data-bs-toggle="modal"
                        data-bs-target="#manage-dept-docs">Documents</button>


          <select name="" className="form-select" id="" disabled={downloading}>
            <option value="" onClick={download} disabled={downloading}>
              <button className="btn btn-outline-primary d-flex" >
                {downloading ? "Downloading..." : "Download OPCR"}
                
              </button>
            </option>
            <option value="" onClick={downloadWeighted} disabled={downloading}>
              <button className="btn btn-outline-primary d-flex" >
                {downloading ? "Downloading..." : "Download Weighted OPCR"}
                
              </button>
            </option>

            <option value="" onClick={downloadPlanned} disabled={downloading}>
              <button className="btn btn-outline-primary d-flex" >
                {downloading ? "Downloading..." : "Download Planned OPCR"}                
              </button>
            </option>
          </select>

        </div>
      </div>

      {/* Alert */}
      {canEval && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-4" role="alert">
          <span className="material-symbols-outlined">info</span>
          <span>Only modify fields highlighted with a <strong className="text-success">green background</strong>.</span>
        </div>
      )}

      {/* Main Card */}
      <div className="container-fluid border rounded">
        <div className="card-body p-4">
          {/* Header Section */}
          <HeaderSection />

          {/* Officer Info Section */}
          <OfficerInfoSection headData={headData} assignedData={assignedData} />

          {/* Tasks Table */}
          <div className="table-responsive mt-5 mb-4">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "15%", textAlign: "center" }}>OUTPUT</th>
                  <th style={{ width: "10%", textAlign: "center" }}>WEIGHT</th>
                  <th style={{ width: "20%", textAlign: "center" }}>
                    SUCCESS INDICATORS<br />
                    <small className="text-muted">(TARGETS + MEASURES)</small>
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    INDIVIDUALS ACCOUNTABLE<br />
                  </th>
                  <th style={{ width: "20%", textAlign: "center" }}>ACTUAL ACCOMPLISHMENT</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    RATING<br />
                    <small className="text-muted">Q² E² T² A²</small>
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>WEIGHTED AVG</th>
                  <th style={{ width: "15%", textAlign: "center" }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {opcrInfo.map((categoryObj, i) =>
                  Object.entries(categoryObj).map(([category, tasks]) => (
                     <TaskSection
                       key={`${i}-${category}`}
                       category={category}
                       tasks={tasks}
                       assignedData={assignedData}
                       handleRemarks={handleRemarks}
                       ratingThresholds={ratingThresholds}
                       setField={setField}
                       setValue={setValue}
                       setRatingID={setRatingID}
                       canEval={canEval}
                       currentPhase={currentPhase}
                     />
                   ))
                )}
              </tbody>
            </table>
          </div>

          {/* Final Ratings */}
          <FinalRatingsSection
            quantityAvg={quantityAvg}
            efficiencyAvg={efficiencyAvg}
            timelinessAvg={timelinessAvg}
            allAvg={allAvg}
            handleRemarks={handleRemarks}
            ratingThresholds={ratingThresholds}
            currentPhase={currentPhase}
            opcrInfo = {opcrInfo}
          />

          {/* Signatures */}
          <SignaturesSection headData={headData} />
        </div>
      </div>
    </div>
  )
}

// Sub-component: Header
function HeaderSection() {
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
      <h4 className="fw-bold mt-3">OFFICE PERFORMANCE COMMITMENT & REVIEW FORM</h4>
    </div>
  )
}

// Sub-component: Officer Info
function OfficerInfoSection({ headData, assignedData }) {
  return (
    <div className="mb-4 p-3 bg-light rounded-3">
      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label fw-semibold">Ratee</label>
            <input type="text" className="form-control" value={headData?.fullName || "-"} readOnly />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label fw-semibold">Position</label>
            <input type="text" className="form-control" value={headData?.position || "-"} readOnly />
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

// Sub-component: Task Section
function TaskSection({ category, tasks, assignedData, handleRemarks, ratingThresholds, setField, setValue, setRatingID, canEval , currentPhase}) {
  if (!tasks || tasks.length === 0) return null
  function isMonitoringPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring")
        }
    
    function isRatingPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating")
        }
    
    function isPlanningPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("planning")
        }
  return (
    <>   
      <tr className="table-light small">
        <td colSpan="6" className="text-muted">{category}</td>
      </tr>

      {tasks.map((task, idx) => (
        <tr key={idx} className="align-middle">
          <td className="fw-semibold small" style={{ minWidth: 220 }}>{task.title}</td>
          <td className="fw-semibold small" style={{textAlign:"center"}}>{task.description?.task_weight * 100}%</td>
          <td>
            <div className="d-grid gap-2">
              <div>
                <input disabled className="form-control form-control-sm" defaultValue={task.summary?.target} />
                <small className="text-muted d-block">{task.description?.target} {task.description?.timeliness_mode == "timeframe" ? "in" : ""}</small>
              </div>
              {task.description?.timeliness_mode == "timeframe" ? (
                <div>
                  <input disabled className="form-control form-control-sm" defaultValue={task.working_days?.target} />
                  <small className="text-muted d-block">{task.description?.time}/s with</small>
                </div>
              ):
              (
                <div>
                  <input disabled className="form-control form-control-sm"  value={""}/>
                  <small className="text-muted d-block">on the set deadline with</small>
                </div>
              )
              }
              <div>
                <input disabled className="form-control form-control-sm" defaultValue={task.corrections?.target} />
                <small className="text-muted d-block">{task.description?.alterations}</small>
              </div>
            </div>
          </td>
          <td>
            <div className="d-flex justify-content-center align-items-center flex-column">
              {Object.keys(assignedData).includes(task.title) && assignedData[task.title].map((user) => <div>{user}</div>)}
            </div>
          </td>
          <td>
            <div className="d-grid gap-2">
              <div>
                <input disabled className="form-control form-control-sm" defaultValue={String(task.summary?.actual).replace(".", "")} />
                <small className="text-muted d-block">{task.description?.actual} {task.description?.timeliness_mode == "timeframe" ? "in" : ""}</small>
              </div>
              {task.description?.timeliness_mode == "timeframe" ? (
                <div>
                  <input disabled className="form-control form-control-sm" defaultValue={task.working_days?.actual != 0 ? task.working_days?.actual / task.frequency : 0} />
                  <small className="text-muted d-block">{task.description?.time}/s in average with</small>
                </div>
              ):
              (
                <div>
                  {parseFloat(task.working_days?.actual / task.frequency).toFixed(0) == 0 ? (
                    <input disabled className="form-control form-control-sm" value = ""/>
                  ) : (
                    <input disabled className="form-control form-control-sm" defaultValue={task.working_days?.actual != 0 ? Math.abs(parseFloat(task.working_days?.actual / task.frequency).toFixed(0)) : ""} />
                  )}

                  
                  {task.working_days?.actual != 0 ? Math.abs(parseFloat(task.working_days?.actual / task.frequency).toFixed(0)) : 0 == 0 ? (
                    <small className="text-muted d-block">on the set deadline with</small>
                  ) : 
                    parseFloat(task.working_days?.actual / task.frequency) < 0 ? (
                      <small className="text-muted d-block">day/s early in average with</small>
                    ) :
                    (
                      <small className="text-muted d-block">day/s late in average with</small>
                    )
                  }
                </div>
              )
              }
              <div>
                <input disabled className="form-control form-control-sm" defaultValue={task.corrections?.actual != 0 ?parseFloat(task.corrections?.actual / task.frequency).toFixed(0) : 0} />
                <small className="text-muted d-block">{task.description?.alterations}/s in average</small>
              </div>
            </div>
          </td>
          <td className="text-center">
            <RatingBadges task={task} canEval={canEval} setField={setField} setValue={setValue} setRatingID={setRatingID} currentPhase={currentPhase} />
          </td>
          <td className="small text-center fw-semibold">{task.rating?.weighted_avg.toFixed(2)}</td>
          <td className="small text-center fw-semibold">{(isMonitoringPhase() && isRatingPhase()) ?  handleRemarks(task.rating?.average, ratingThresholds) : "N/A"}</td>
          
        </tr>
      ))}
    </>
  )
}



function RatingBadges({ task, canEval, setField, setValue, setRatingID, currentPhase }) {
  
      
    function isMonitoringPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring")
        }
    
    function isRatingPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating")
        }
    
    function isPlanningPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("planning")
        }

    
  
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
    }}>
      <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
        <span
          className={`d-block ${canEval ? "cursor-pointer" : ""}`}
          contentEditable={canEval}
          onClick={() => canEval && setRatingID(task.rating?.id)}
          onInput={(e) => { if (canEval) { setField("quantity"); setValue(e.target.textContent) } }}
        >
          {(isMonitoringPhase() || isRatingPhase()) ? parseFloat(task.rating?.quantity || 0).toFixed(0) : 0}
        </span>
      </div>
      <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
        <span
          className={`d-block ${canEval ? "cursor-pointer" : ""}`}
          contentEditable={canEval}
          onClick={() => canEval && setRatingID(task.rating?.id)}
          onInput={(e) => { if (canEval) { setField("efficiency"); setValue(e.target.textContent) } }}
        >
          {(isMonitoringPhase() || isRatingPhase()) ? parseFloat(task.rating?.efficiency || 0).toFixed(0) : 0}
        </span>
      </div>
      <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
        <span
          className={`d-block ${canEval ? "cursor-pointer" : ""}`}
          contentEditable={canEval}
          onClick={() => canEval && setRatingID(task.rating?.id)}
          onInput={(e) => { if (canEval) { setField("timeliness"); setValue(e.target.textContent) } }}
        >
          { (isMonitoringPhase() || isRatingPhase()) ? parseFloat(task.rating?.timeliness || 0).toFixed(0) : 0}
        </span>
      </div>
      <div className="text-center" style={{ fontSize: "1.5rem" }}>
        <div>{ (isMonitoringPhase() || isRatingPhase()) ? parseFloat(task.rating?.average || 0).toFixed(0) : 0}</div>
      </div>
    </div>
  )
}

// Sub-component: Final Ratings
function FinalRatingsSection({ quantityAvg, efficiencyAvg, timelinessAvg, allAvg, handleRemarks, ratingThresholds, currentPhase, opcrInfo}) {
  
  function isMonitoringPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring")
        }
    
    function isRatingPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating")
        }
    
    function isPlanningPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("planning")
        }
  
  const [totalWeightedAvg, setTotalWAvg] = useState(0)

  useEffect(()=> {
    var total = 0
    opcrInfo.map((categoryObj, i) =>
        Object.entries(categoryObj).map(([category, tasks]) => (
          tasks.map((task, idx) => {
              total += parseFloat(task.rating.weighted_avg)   
              console.log(total)  
            }             
          )           
        )
      )
    )
    setTotalWAvg(total)  
  },[])

  return (
    <div className="row g-3 my-4">
      <div className="col-md-6">
        <div className="card h-100 border">
          <div className="card-body">
            <h6 className="card-title fw-bold">Average Rating</h6>
            <div className="d-grid gap-2 small">
              <div className="d-flex justify-content-between">
                <span>Quantity (Q):</span>
                <strong>{(isMonitoringPhase() || isRatingPhase()) ? parseFloat(quantityAvg || 0).toFixed(2) : 0}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Efficiency (E):</span>
                <strong>{(isMonitoringPhase() || isRatingPhase()) ? parseFloat(efficiencyAvg || 0).toFixed(2) : 0}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Timeliness (T):</span>
                <strong>{(isMonitoringPhase() || isRatingPhase()) ? parseFloat(timelinessAvg || 0).toFixed(2) : 0}</strong>
              </div>
              <div className="d-flex justify-content-between border-top pt-2">
                <span>Average (A):</span>
                <strong>{(isMonitoringPhase() || isRatingPhase()) ? parseFloat(allAvg || 0).toFixed(2) : 0}</strong>
              </div>
            </div>
            <br />
            <h6 className="fw-bold">Adjectival Rating</h6>
            <p className="mb-0 fs-5 fw-bold text-warning">
              {(isMonitoringPhase() || isRatingPhase()) ? handleRemarks(allAvg.toFixed(2), ratingThresholds) : "N/A"}
            </p>
            <small className="text-muted mt-2">Overall Average: {(isMonitoringPhase() || isRatingPhase()) ?parseFloat(allAvg || 0).toFixed(2) : 0}</small>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card h-100 border">
          <div className="card-body">
            <h6 className="card-title fw-bold">Weighted Average</h6>
            <div className="d-grid gap-2 small">
              {
                opcrInfo.map((categoryObj, i) =>
                    Object.entries(categoryObj).map(([category, tasks]) => (
                      tasks.map((task, idx) => {
                        //setTotalWAvg(parseFloat(task.rating.weighted_avg).toFixed(2) + totalWeightedAvg)
                          return <div className="d-flex justify-content-between">
                              <span>{task.title} ({String(task.description.task_weight * 100) + "%"})</span>
                              <strong>{parseFloat(task.rating.weighted_avg).toFixed(2)}</strong>
                            </div>
                        }
                      )
                    )
                  )
                )
              }
              <div className="d-flex justify-content-between border-top pt-2">
                <span>Total Weighted Average (A):</span>
                <strong>{parseFloat(totalWeightedAvg).toFixed(2)}</strong>
              </div>
            </div>
            <br />
            <h6 className="fw-bold">Adjectival Rating</h6>
            <p className="mb-0 fs-5 fw-bold text-warning">
              {(isMonitoringPhase() || isRatingPhase()) ? handleRemarks(totalWeightedAvg.toFixed(2), ratingThresholds) : "N/A"}
            </p>
            <small className="text-muted mt-2">Total Weighted Average: {(isMonitoringPhase() || isRatingPhase()) ? parseFloat(totalWeightedAvg || 0).toFixed(2) : 0}</small>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-component: Signatures
function SignaturesSection({ headData }) {
  const people = [
    { label: "Discussed with", name: headData?.fullName, position: headData?.position },
    { label: "Assessed by", name: headData?.individuals?.assess?.name, position: headData?.individuals?.assess?.position },
    { label: "Final Rating by", name: headData?.individuals?.final?.name, position: headData?.individuals?.final?.position },
    { label: "Approved by", name: headData?.individuals?.approve?.name, position: headData?.individuals?.approve?.position }
  ]

  return (
    <div className="mt-5">
      <div className="row g-3">
        {people.map((person, idx) => (
          <div key={idx} className="col-md-6">
            <div className="border-top pt-3">
              <p className="small mb-1 fw-semibold">{person.label}:</p>
              <p className="mb-0 fw-bold">{person?.name?.toUpperCase() || "-"}</p>
              <p className="small text-muted mb-0">{person?.position || ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EditOPCR