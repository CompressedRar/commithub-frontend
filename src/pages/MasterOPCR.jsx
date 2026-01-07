import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { downloadMasterOPCR, getMasterOPCR } from "../services/pcrServices"
import { socket } from "../components/api"
import { getSettings } from "../services/settingsService"


function MasterOPCR(){
    const [opcrInfo, setOPCRInfo] = useState(null)
    const [assignedData, setAssignedData] = useState(null)
    const [headData, setHeadData] = useState(null)

    const [quantityAvg, setQuantity] = useState(0)
    const [efficiencyAvg, setEfficiency] = useState(0)
    const [timelinessAvg, setTimeliness] = useState(0)
    const [allAvg, setAllAvg] = useState(0)

    const [coreRawAvg, setCoreRawAvg] = useState(0)
    const [strategicRawAvg, setStrategicRawAvg] = useState(0)
    const [supportRawAvg, setSupportRawAvg] = useState(0)

    const [downloading, setDownloading] = useState(false)
    const [ratingThresholds, setRatingThresholds] = useState(null)

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
      function isMonitoringPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring")
        }
    
        function isRatingPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating")
        }
    
        function isPlanningPhase() {
            return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("planning")
        }

    async function loadOPCR(){
        var res = await getMasterOPCR().then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        console.log("MASTER OPCR INFO", res)
        setOPCRInfo(res.ipcr_data)
        setAssignedData(res.assigned)
        setHeadData(res.admin_data)
        
        // Load rating thresholds if available
        if (res.rating_thresholds) {
            let rt = res.rating_thresholds
            if (typeof rt === "string") rt = JSON.parse(rt)
            setRatingThresholds(rt)
        }
    }

    async function download() {
        setDownloading(true)
        var res = await downloadMasterOPCR().then(data => data.data.link).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
            setDownloading(false)
        })
        if (res) window.open(res, "_blank", "noopener,noreferrer");
        setDownloading(false)
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

    function calculateAverage(quantity, efficiency, timeliness) {
        let calculations = quantity + efficiency + timeliness;
        let result = calculations / 3;

        return result;
    }

    useEffect(() => {
        if (!opcrInfo) return;

        try {
          let qSum = 0, eSum = 0, tSum = 0, allSum = 0;
          let count = 0;

          opcrInfo.forEach(categoryObj => {
            Object.entries(categoryObj).forEach(([category, tasks]) => {
                tasks.forEach(task => {
                    let q = task.rating.quantity;
                    let e = task.rating.efficiency;
                    let t = task.rating.timeliness;
                    
                    let avg = calculateAverage(q, e, t);

                    qSum += q; eSum += e; tSum += t; allSum += avg;
                    count++;
                    });
                });
            });


          setQuantity(qSum / count);
          setEfficiency(eSum / count);
          setTimeliness(tSum / count);
          setAllAvg(allSum / count);

        } catch (err) {
          console.error("Error computing Master OPCR averages", err);
        }
   }, [opcrInfo]);

    useEffect(()=> {
        loadOPCR()
        loadCurrentPhase()

        socket.on("ipcr", ()=>{
            loadOPCR()
            console.log("IPCR LISTENED")
        })

        socket.on("ipcr_added", ()=>{
            loadOPCR()
            console.log("ADDED LISTENED")
        })

        socket.on("ipcr_remove", ()=>{
            loadOPCR()
            console.log("REMOVE LISTENED")
        })

        socket.on("assign", ()=>{
            loadOPCR()
            console.log("ASSIGNED LISTENED")
        })

        return () => {
            socket.off("ipcr")
            socket.off("ipcr_added")
            socket.off("ipcr_remove")
            socket.off("assign")
        }
    }, [])

    

    // helper to render task sections supporting both array and object ipcr_data shapes
    function renderTaskSections() {
      if (!opcrInfo) return null

      // when opcrInfo is an array of function objects: [{ "Core Function": { ... } }, ...]
      if (Array.isArray(opcrInfo)) {
        return opcrInfo.map((functionObj, idx) =>
          Object.entries(functionObj).map(([functionType, categoryObj]) =>
            Object.entries(categoryObj).map(([category, tasks]) => (
              <TaskSection
                key={`${idx}-${functionType}-${category}`}
                category={category}
                functionType={functionType}
                tasks={tasks}
                assignedData={assignedData}
                handleRemarks={handleRemarks}
                ratingThresholds={ratingThresholds}
              />
            ))
          )
        )
      }

      // when opcrInfo is an object keyed by function type:
      // { "Core Function": { "Category": [tasks] }, "Support Function": { ... } }
      if (typeof opcrInfo === "object") {
        return opcrInfo.map((categoryObj, i) =>
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
                     />
                   ))
                )
            }

      return null
    }

    if (!opcrInfo ) {
        return (
            <div className="edit-ipcr-container" style={{ position: "relative" }}>
                <div className="overlay-container">
                    <div className="overlay-content">
                        <img 
                            src={`${import.meta.env.BASE_URL}empty-folder.png`} 
                            alt="No Data" 
                            className="overlay-icon"
                        />
                        <h2>No Consolidated OPCR Data</h2>
                        <p>There are currently no IPCRs assigned or consolidated into the Master OPCR.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="py-4" style={{minWidth:"1200px"}}>
            {/* Header */}
            

            {!opcrInfo && (
                <div className="d-flex justify-content-center align-items-center flex-column" style={{ zIndex: 1050,marginTop:"-5%", width:"80%", height:"100%", position:"absolute", backgroundColor:"rgba(255,255,255,0.8)"}}>
                    <div className="overlay-content text-center p-4">
                        <img
                        src={`${import.meta.env.BASE_URL}calendar_blocked.png`}
                        alt="OPCR Closed"
                        className="overlay-icon"
                        style={{ maxWidth: 120 }}
                        />
                        <h2>OPCR Closed</h2>
                        <p className="mb-0 text-muted">
                        OPCR does not have any data to compile yet. You will be able to view it once there are IPCR to consolidate.
                        </p>
                    </div>
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Master OPCR - Consolidated Results</h4>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                    onClick={download}
                    disabled={downloading}
                >
                    <span className="material-symbols-outlined">
                        {downloading ? "sync" : "download"}
                    </span>
                    {downloading ? "Generating..." : "Download Master OPCR"}
                </button>
            </div>

            {/* Main Card */}
            <div className="container-fluid border rounded">
                <div className="card-body p-4">
                    {/* Header Section */}
                    <HeaderSection headData={headData} />

                    {/* Officer Info Section */}
                    <OfficerInfoSection headData={headData} />

                    {/* Tasks Table */}
                    <div className="table-responsive mt-5 mb-4">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th style={{ width: "20%", textAlign: "center" }}>OUTPUT</th>
                                    <th style={{ width: "20%", textAlign: "center" }}>
                                        SUCCESS INDICATORS<br />
                                        <small className="text-muted">(TARGETS + MEASURES)</small>
                                    </th>
                                    <th style={{ width: "15%", textAlign: "center" }}>
                                        INDIVIDUALS ACCOUNTABLE<br />
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
                            {opcrInfo.map((categoryObj, i) =>
                                Object.entries(categoryObj).map(([category, tasks]) => (
                                    <TaskSection
                                    key={`${i}-${category}`}
                                    category={category}
                                    tasks={tasks}
                                    assignedData={assignedData}
                                    handleRemarks={handleRemarks}
                                    ratingThresholds={ratingThresholds}
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
                    />

                    {/* Signatures */}
                    <SignaturesSection headData={headData} />
                </div>
            </div>
        </div>
    )
}

// Sub-component: Header
function HeaderSection({ headData }) {
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
            <h4 className="fw-bold mt-3">MASTER OFFICE PERFORMANCE COMMITMENT & REVIEW FORM</h4>
            <p className="text-muted small mt-2">Consolidated Results from All Department OPCRs</p>
        </div>
    )
}

// Sub-component: Officer Info
function OfficerInfoSection({ headData }) {
    return (
        <div className="mb-4 p-3 bg-light rounded-3">
            <div className="row g-3">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="form-label fw-semibold">Consolidated by</label>
                        <input type="text" className="form-control" value={headData?.fullName || "President"} readOnly />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="form-label fw-semibold">Position</label>
                        <input type="text" className="form-control" value={headData?.position || "Office of the President"} readOnly />
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
function TaskSection({ category, tasks, assignedData, handleRemarks, ratingThresholds }) {
    if (!tasks || tasks.length === 0) return null

  return (
    <>
      
    
      <tr className="table-light small">
        <td colSpan="6" className="text-muted">{category}</td>
      </tr>

      {tasks.map((task, idx) => (
        <tr key={idx} className="align-middle">
          <td className="fw-semibold small" style={{ minWidth: 220 }}>{task.title}</td>
          <td>
            <div className="d-grid gap-2">
              <div>
                <input disabled className="form-control form-control-sm" defaultValue={task.summary?.target} />
                <small className="text-muted d-block">{task.description?.target} {task.description?.timeliness_mode == "timeframe" ? "in" : ""}</small>
              </div>
              {task.description?.timeliness_mode == "timeframe" ? (
                <div>
                  <input disabled className="form-control form-control-sm" defaultValue={task.description?.target_timeframe} />
                  <small className="text-muted d-block">{task.description?.time} with</small>
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
            <div className="d-flex justify-content-center align-items-center flex-column" >
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
                  <small className="text-muted d-block">{task.description?.time} with</small>
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
            <RatingBadges task={task} />
          </td>
          <td className="small text-center fw-semibold">{handleRemarks(task.rating?.average, ratingThresholds)}</td>
        </tr>
      ))}
    </>
  )
}

function RatingBadges({ task }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
        }}>
            <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
                <span className="d-block">
                    {parseFloat(task.rating?.quantity || 0).toFixed(0)}
                </span>
            </div>
            <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
                <span className="d-block">
                    {parseFloat(task.rating?.efficiency || 0).toFixed(0)}
                </span>
            </div>
            <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
                <span className="d-block">
                    {parseFloat(task.rating?.timeliness || 0).toFixed(0)}
                </span>
            </div>
            <div className="text-center" style={{ fontSize: "1.5rem" }}>
                <div>{parseFloat(task.rating?.average || 0).toFixed(0)}</div>
            </div>
        </div>
    )
}

// Sub-component: Final Ratings
function FinalRatingsSection({ quantityAvg, efficiencyAvg, timelinessAvg, allAvg, handleRemarks, ratingThresholds }) {
    return (
        <div className="row g-3 my-4">
            <div className="col-md-4">
                <div className="card h-100 border">
                    <div className="card-body">
                        <h6 className="card-title fw-bold">Final Average Rating</h6>
                        <div className="d-grid gap-2 small">
                            <div className="d-flex justify-content-between">
                                <span>Quantity (Q):</span>
                                <strong>{parseFloat(quantityAvg || 0).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Efficiency (E):</span>
                                <strong>{parseFloat(efficiencyAvg || 0).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Timeliness (T):</span>
                                <strong>{parseFloat(timelinessAvg || 0).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2">
                                <span>Average (A):</span>
                                <strong>{parseFloat(allAvg || 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card h-100 border text-center">
                    <div className="card-body d-flex flex-column justify-content-center">
                        <h6 className="card-title fw-bold">Adjectival Rating</h6>
                        <p className="mb-0 fs-5 fw-bold text-warning">
                            {handleRemarks(allAvg.toFixed(2), ratingThresholds)}
                        </p>
                        <small className="text-muted mt-2">Overall Average: {parseFloat(allAvg || 0).toFixed(2)}</small>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Sub-component: Signatures
function SignaturesSection({ headData }) {
    const people = [
        { label: "Consolidated by", name: headData?.fullName, position: headData?.position },
        { label: "Reviewed by", name: headData?.individuals?.assess?.name, position: headData?.individuals?.assess?.position },
        { label: "Approved by", name: headData?.individuals?.approve?.name, position: headData?.individuals?.approve?.position },
        { label: "Confirmed by", name: headData?.individuals?.confirm?.name, position: headData?.individuals?.confirm?.position }
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

export default MasterOPCR