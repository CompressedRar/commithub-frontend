import { useEffect, useRef, useState } from "react"
import Swal from "sweetalert2"
import { getSettings, updateSettings, validateFormula, verifyAdminPassword, resetPeriod } from "../services/settingsService"
import Positions from "./Positions"
import Periods from "../components/SystemSettings/Periods"

export default function SystemSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("ratings")
  const [resettingPeriod, setResettingPeriod] = useState(false)

  const periodsRef = useRef(null)

  const [currentPeriodId, setCurrentPeriodId] = useState("")
    const [autoPeriodId, setAutoPeriodId] = useState(true)
    const [currentPeriod, setCurrentPeriod] = useState("")
    const [currentPhase, setCurrentPhase] = useState(null)
    const [planningStartDate, setPlanningStartDate] = useState("")
    const [planningEndDate, setPlanningEndDate] = useState("")
    const [monitoringStartDate, setMonitoringStartDate] = useState("")
    const [monitoringEndDate, setMonitoringEndDate] = useState("")
    const [ratingStartDate, setRatingStartDate] = useState("")
    const [ratingEndDate, setRatingEndDate] = useState("")

  // Rating thresholds state
  const [ratingThresholds, setRatingThresholds] = useState({
    outstanding: { min: 4.5 },
    very_satisfactory: { min: 3.5, max: 4.49 },
    satisfactory: { min: 2.5, max: 3.49 },
    unsatisfactory: { min: 1.5, max: 2.49 },
    poor: { max: 1.49 }
  })

  // Formula states
  const [quantityFormula, setQuantityFormula] = useState({})
  const [quantityFormulaValid, setQuantityFormulaValid] = useState(true)
  
  const [efficiencyFormula, setEfficiencyFormula] = useState({})
  const [efficiencyFormulaValid, setEfficiencyFormulaValid] = useState(true)

  const [timelinessFormula, setTimelinessFormula] = useState({})
  const [timelinessFormulaValid, setTimelinessFormulaValid] = useState(true)

  // Officers (kept in parent)
  const [currentPresidentFullname, setCurrentPresidentFullname] = useState("")
  const [currentMayorFullname, setCurrentMayorFullname] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const res = await getSettings()
      const data = res.data?.data ?? res.data ?? {}
      setSettings(data)

      setValues(data)

      // rating thresholds
      if (data.rating_thresholds) setRatingThresholds(typeof data.rating_thresholds === "string" ? JSON.parse(data.rating_thresholds) : data.rating_thresholds)

      if (data.quantity_formula) setQuantityFormula(data.quantity_formula)
      if (data.efficiency_formula) setEfficiencyFormula(data.efficiency_formula)
      if (data.timeliness_formula) setTimelinessFormula(data.timeliness_formula)

      setCurrentPresidentFullname(data.current_president_fullname ?? "")
      setCurrentMayorFullname(data.current_mayor_fullname ?? "")

      // pass period values to Periods component via initialData prop (it will pick them up)
      // note: Periods receives `initialData` prop below
    } catch (error) {
      console.error(error)
      Swal.fire("Error", "Failed to load system settings", "error")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      // validate period fields via Periods component
      

      console.log(quantityFormulaValid, efficiencyFormulaValid, timelinessFormulaValid)

      if(!quantityFormulaValid) {
        Swal.fire("Error", "Invalid Quantity Formula", "error")
        return
      }
      if(!efficiencyFormulaValid) {
        Swal.fire("Error", "Invalid Efficiency Formula", "error")
        return
      }
      if(!timelinessFormula) {
        Swal.fire("Error", "Invalid Timeliness Formula", "error")
        return
      }

      setSaving(true)

      let periodId = currentPeriodId

      if (autoPeriodId || !periodId) periodId = computePeriodId(new Date())

      // ensure dates are in ISO (yyyy-mm-dd) or null
      const fmt = (d) => {
        if (!d) return null
        const parsed = parseDateString(d)
        return parsed ? parsed.toISOString().slice(0, 10) : null
      }

      // build payload
      //const periodPayload = periodsRef.current.getPayload()
      const payload = {
        rating_thresholds: ratingThresholds,
        quantity_formula: quantityFormula,
        efficiency_formula: efficiencyFormula,
        timeliness_formula: timelinessFormula,
        current_president_fullname: currentPresidentFullname || null,
        current_mayor_fullname: currentMayorFullname || null,
        // merge period payload
        current_period_id: periodId,
        current_period: computePeriodLabel(new Date()),
        planning_start_date: fmt(planningStartDate),
        planning_end_date: fmt(planningEndDate),
        monitoring_start_date: fmt(monitoringStartDate),
        monitoring_end_date: fmt(monitoringEndDate),
        rating_start_date: fmt(ratingStartDate),
        rating_end_date: fmt(ratingEndDate),
        auto_period_id: !!autoPeriodId
      }

      // Ask for admin password confirmation before saving
      const { value: adminPassword } = await Swal.fire({
        title: "Confirm changes",
        text: "Please enter your admin password to confirm this change",
        input: "password",
        inputAttributes: { autocapitalize: "off", autocorrect: "off" },
        showCancelButton: true
      })

      if (!adminPassword) {
        setSaving(false)
        return
      }

      try {
        const confirmationToken = await verifyAdminPassword({ password: adminPassword })
        payload.confirmation_token = confirmationToken.data.confirmation_token
        console.log("ADMIN PASSWORD VERIFIED")
      } catch (err) {
        Swal.fire("Error", err.response?.data?.error || "Invalid password", "error")
        setSaving(false)
        return
      }

      await updateSettings(payload)
      Swal.fire("Success", "System settings updated successfully", "success")
      const res = await getSettings()
      setSettings(res.data?.data ?? res.data ?? {})
      
    } catch (error) {
      console.log(error)
      Swal.fire("Error", error.response?.data?.error || "Failed to save settings", "error")
    } finally {
      setSaving(false)
    }
  }

  function updateRatingThreshold(rating, field, value) {
    setRatingThresholds(prev => ({
      ...prev,
      [rating]: {
        ...prev[rating],
        [field]: value === "" ? undefined : parseFloat(value)
      }
    }))
  }

  async function handleResetPeriod() {
    const { value: adminPassword } = await Swal.fire({
      title: "Reset Period",
      text: "This will generate a new random period ID. Are you sure?",
      input: "password",
      inputLabel: "Enter your admin password to confirm",
      inputPlaceholder: "Password",
      inputAttributes: { autocomplete: "off" },
      showCancelButton: true,
      confirmButtonText: "Yes, Reset Period",
      confirmButtonColor: "#f59e0b",
      cancelButtonText: "Cancel",
      inputValidator: (value) => !value && "Password is required"
    })

    if (!adminPassword) return

    setResettingPeriod(true)
    try {
      const confirmationToken = await verifyAdminPassword({ password: adminPassword })
      const res = await resetPeriod()
      
      if (res.data?.status === "success") {
        Swal.fire({
          title: "Success",
          html: `<p>Period has been reset!</p><p className="fw-bold">New Period ID: <code>${res.data?.new_period_id}</code></p>`,
          icon: "success"
        })
        
        // Reload settings to show new period ID
        const updatedSettings = await getSettings()
        setSettings(updatedSettings.data?.data ?? updatedSettings.data ?? {})
        setCurrentPeriodId(res.data?.new_period_id || "")
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to reset period", "error")
    } finally {
      setResettingPeriod(false)
    }
  }

  function checkDateOverlap() {
    const phases = [
      { name: "Planning", start: planningStartDate, end: planningEndDate },
      { name: "Monitoring", start: monitoringStartDate, end: monitoringEndDate },
      { name: "Rating", start: ratingStartDate, end: ratingEndDate }
    ]

    // filter out phases with incomplete date ranges
    const activePhasesWithDates = phases.filter(p => p.start && p.end)

    // check each pair for overlaps
    for (let i = 0; i < activePhasesWithDates.length; i++) {
      for (let j = i + 1; j < activePhasesWithDates.length; j++) {
        const phase1 = activePhasesWithDates[i]
        const phase2 = activePhasesWithDates[j]

        const start1 = parseDateString(phase1.start)
        const end1 = parseDateString(phase1.end)
        const start2 = parseDateString(phase2.start)
        const end2 = parseDateString(phase2.end)

        // check if ranges overlap: start1 <= end2 AND start2 <= end1
        if (start1 <= end2 && start2 <= end1) {
          return {
            hasOverlap: true,
            phase1: phase1.name,
            phase2: phase2.name,
            message: `${phase1.name} phase (${phase1.start} to ${phase1.end}) overlaps with ${phase2.name} phase (${phase2.start} to ${phase2.end})`
          }
        }
      }
    }

    return { hasOverlap: false, message: "" }
  }

  function toInputDate(value) {
    if (!value) return ""
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 10)
  }

  // parse yyyy-mm-dd to Date (local)
  function parseDateString(s) {
    if (!s) return null
    const d = new Date(s + "T00:00:00")
    return Number.isNaN(d.getTime()) ? null : d
  }

  function computePeriodLabel(date = new Date()) {
    const m = date instanceof Date ? date.getMonth() + 1 : new Date(date).getMonth() + 1
    return m >= 1 && m <= 6 ? "January to June" : "July to December"
  }

  function computePeriodId(date = new Date()) {
    const year = date instanceof Date ? date.getFullYear() : new Date(date).getFullYear()
    const half = computePeriodLabel(date) === "January to June" ? "H1" : "H2"
    return `${year}-${half}`
  }

  function isInCurrentPeriod(dateStr, periodLabel) {
    const d = parseDateString(dateStr)
    if (!d) return false
    const year = new Date().getFullYear()
    if (d.getFullYear() !== year) return false
    const m = d.getMonth() + 1
    if (periodLabel === "January to June") return m >= 1 && m <= 6
    return m >= 7 && m <= 12
  }

  // compute current active phases based on today's date
  function computeCurrentPhase() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const phases = []

    // Check planning phase
    if (planningStartDate && planningEndDate) {
      const sDate = parseDateString(planningStartDate)
      const eDate = parseDateString(planningEndDate)
      if (sDate && eDate && sDate <= today && today <= eDate) {
        phases.push("Planning")
      }
    }

    // Check monitoring phase
    if (monitoringStartDate && monitoringEndDate) {
      const sDate = parseDateString(monitoringStartDate)
      const eDate = parseDateString(monitoringEndDate)
      if (sDate && eDate && sDate <= today && today <= eDate) {
        phases.push("Monitoring")
      }
    }

    // Check rating phase
    if (ratingStartDate && ratingEndDate) {
      const sDate = parseDateString(ratingStartDate)
      const eDate = parseDateString(ratingEndDate)
      if (sDate && eDate && sDate <= today && today <= eDate) {
        phases.push("Rating")
      }
    }

    return phases.length > 0 ? phases : null
  }

  function validatePeriodDates(periodLabel) {
      const pairs = [
        { s: planningStartDate, e: planningEndDate, label: "Planning" },
        { s: monitoringStartDate, e: monitoringEndDate, label: "Monitoring" },
        { s: ratingStartDate, e: ratingEndDate, label: "Rating" }
      ]
  
      for (const p of pairs) {
        if (p.s || p.e) {
          const sDate = parseDateString(p.s)
          const eDate = parseDateString(p.e)
          if (!sDate || !eDate) {
            Swal.fire("Validation", `${p.label} start and end dates must both be valid dates`, "warning")
            return false
          }
          if (sDate > eDate) {
            Swal.fire("Validation", `${p.label} start date must be before or equal to end date`, "warning")
            return false
          }
          if (!isInCurrentPeriod(p.s, periodLabel) || !isInCurrentPeriod(p.e, periodLabel)) {
            Swal.fire("Validation", `${p.label} dates must fall within the current period (${periodLabel}) and year ${new Date().getFullYear()}`, "warning")
            return false
          }
        }
      }
  
      // check for overlapping phases
      const overlapCheck = checkDateOverlap()
      if (overlapCheck.hasOverlap) {
        Swal.fire(
          "Validation Error",
          overlapCheck.message,
          "warning"
        )
        return false
      }
  
      return true
    }

  function setValues(data = {}) {
    setCurrentPeriodId(data.current_period_id ?? "")
    // autoPeriodId = true if stored id matches deterministic id for current half-year
    setAutoPeriodId(!(data.current_period_id && data.current_period_id !== computePeriodId(new Date())))
    setCurrentPeriod(computePeriodLabel(new Date()))
    setPlanningStartDate(toInputDate(data.planning_start_date))
    setPlanningEndDate(toInputDate(data.planning_end_date))
    setMonitoringStartDate(toInputDate(data.monitoring_start_date))
    setMonitoringEndDate(toInputDate(data.monitoring_end_date))
    setRatingStartDate(toInputDate(data.rating_start_date))
    setRatingEndDate(toInputDate(data.rating_end_date))

    // compute and set current phase based on loaded dates
    setTimeout(() => {
      setCurrentPhase(computeCurrentPhase())
    }, 0)
  }

  useEffect(() => {
      setCurrentPhase(computeCurrentPhase())
    }, [planningStartDate, planningEndDate, monitoringStartDate, monitoringEndDate, ratingStartDate, ratingEndDate])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <h2 className="fw-bold mb-2">
                <span className="material-symbols-outlined me-2" style={{ fontSize: "2rem", verticalAlign: "middle" }}>settings</span>
                System Settings
              </h2>
              <p className="text-muted">Configure rating scales, formulas, and system parameters</p>
            </div>
            {/* removed duplicate header Save Changes button - keep single save button at bottom */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs border-bottom-2" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${activeTab === "ratings" ? "active" : ""}`}
                onClick={() => setActiveTab("ratings")}
                type="button"
              >
                <span className="material-symbols-outlined">grade</span>
                Rating Thresholds
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${activeTab === "formulas" ? "active" : ""}`}
                onClick={() => setActiveTab("formulas")}
                type="button"
              >
                <span className="material-symbols-outlined">calculate</span>
                Formulas
              </button>
            </li>

            <li className="nav-item" role="presentation">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${activeTab === "positions" ? "active" : ""}`}
                onClick={() => setActiveTab("positions")}
                type="button"
              >
                <span className="material-symbols-outlined">people</span>
                Positions
              </button>
            </li>

            <li className="nav-item" role="presentation">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${activeTab === "periods" ? "active" : ""}`}
                onClick={() => setActiveTab("periods")}
                type="button"
              >
                <span className="material-symbols-outlined">event</span>
                Periods & Officers
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Rating Thresholds Tab */}
      {activeTab === "ratings" && (
        <div className="row g-3">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-light border-bottom">
                <h5 className="mb-0 fw-semibold">
                  <span className="material-symbols-outlined me-2">grade</span>
                  Performance Rating Scale
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead className="table-light">
                      <tr>
                        <th>Rating Level</th>
                        <th>Minimum Score</th>
                        <th>Maximum Score</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <RatingRow
                        level="Outstanding"
                        ratingKey="outstanding"
                        thresholds={ratingThresholds.outstanding}
                        onUpdate={updateRatingThreshold}
                        color="success"
                        description="Exceptional performance exceeding all standards"
                      />
                      <RatingRow
                        level="Very Satisfactory"
                        ratingKey="very_satisfactory"
                        thresholds={ratingThresholds.very_satisfactory}
                        onUpdate={updateRatingThreshold}
                        color="info"
                        description="Performance consistently exceeds expectations"
                      />
                      <RatingRow
                        level="Satisfactory"
                        ratingKey="satisfactory"
                        thresholds={ratingThresholds.satisfactory}
                        onUpdate={updateRatingThreshold}
                        color="primary"
                        description="Performance meets all major expectations"
                      />
                      <RatingRow
                        level="Unsatisfactory"
                        ratingKey="unsatisfactory"
                        thresholds={ratingThresholds.unsatisfactory}
                        onUpdate={updateRatingThreshold}
                        color="warning"
                        description="Performance falls below expectations"
                      />
                      <RatingRow
                        level="Poor"
                        ratingKey="poor"
                        thresholds={ratingThresholds.poor}
                        onUpdate={updateRatingThreshold}
                        color="danger"
                        description="Performance requires immediate improvement"
                      />
                    </tbody>
                  </table>
                </div>

                {/* Scale Preview */}
                <div className="mt-4 p-3 bg-light rounded-2">
                  <h6 className="fw-semibold mb-3">Scale Preview</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {Object.entries(ratingThresholds).map(([key, threshold]) => (
                      <div
                        key={key}
                        className={`badge bg-${getBadgeColor(key)} p-3`}
                        style={{ minWidth: "120px", textAlign: "center" }}
                      >
                        <div className="fw-bold text-capitalize">{key.replace(/_/g, " ")}</div>
                        <small>
                          {threshold.min !== undefined && `Min: ${threshold.min}`}
                          {threshold.max !== undefined && ` - Max: ${threshold.max}`}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        activeTab === "positions" && (
          <div className="row g-3">
            <Positions></Positions>
          </div>
        )
      }

      {/* Formulas Tab */}
      {activeTab === "formulas" && (
        <div className="row g-3">
          <FormulaCard
            title="Quantity Formula"
            icon="inventory_2"
            formula={quantityFormula}
            onChange={setQuantityFormula}
            isValid={setQuantityFormulaValid}
            description="Define how quantity metrics are calculated"
          />
          <FormulaCard
            title="Efficiency Formula"
            icon="speed"
            formula={efficiencyFormula}
            onChange={setEfficiencyFormula}
            description="Define how efficiency metrics are calculated"
            isValid={setEfficiencyFormulaValid}
          />
          <FormulaCard
            title="Timeliness Formula"
            icon="schedule"
            formula={timelinessFormula}
            onChange={setTimelinessFormula}
            description="Define how timeliness metrics are calculated"
            isValid={setTimelinessFormulaValid}
          />
        </div>
      )}

      {/* Periods & Officers Tab */}
      {activeTab === "periods" && (
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-semibold"><span className="material-symbols-outlined me-2">event</span> Periods</h5>
              </div>
              <div className="card-body">
                {/* Pass initialData so Periods can initialize */}
                <div className="row g-3">
                  {/* Current Phase Display */}
                  <div className="col-12">
                    <div className="alert alert-info d-flex align-items-center gap-2" role="alert">
                      <span className="material-symbols-outlined">info</span>
                      <div>
                        <strong>Current Active Phase(s):</strong>
                        {currentPhase && currentPhase.length > 0 ? (
                          <div className="mt-1">
                            {currentPhase.map((phase, idx) => (
                              <span key={idx} className="badge bg-primary me-2">
                                {phase}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mb-0 mt-1 text-muted">No active phase today</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Overlap Warning */}
                  {checkDateOverlap().hasOverlap && (
                    <div className="col-12">
                      <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
                        <span className="material-symbols-outlined">warning</span>
                        <div>
                          <strong>Date Overlap Detected:</strong>
                          <p className="mb-0 mt-1">{checkDateOverlap().message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-12 col-md-6 d-none">
                    <label className="form-label fw-semibold">Current Period ID</label>
                    <div className="input-group" >
                      <input
                        className="form-control"
                        value={currentPeriodId}
                        onChange={(e) => { setCurrentPeriodId(e.target.value); setAutoPeriodId(false) }}
                        placeholder="auto-generated semi-annually or provide custom id"
                        readOnly={autoPeriodId}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          const id = computePeriodId(new Date())
                          setCurrentPeriodId(id)
                          setAutoPeriodId(true)
                        }}
                      >
                        Use Auto
                      </button>
                    </div>

                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoPeriodId"
                        checked={autoPeriodId}
                        onChange={(e) => {
                          const enabled = e.target.checked
                          setAutoPeriodId(enabled)
                          if (enabled) setCurrentPeriodId(computePeriodId(new Date()))
                        }}
                      />
                      <label className="form-check-label" htmlFor="autoPeriodId">
                        Auto-generate Period ID (changes semi-annually)
                      </label>
                    </div>
                    <small className="text-muted d-block mt-1">When enabled the Period ID is deterministic and will change every half-year (H1/H2).</small>
                  </div>

                  <div className="col-12">
                    <div className="border-warning">
                      <div className="card-body">
                        <h4 className="card-title fw-semibold d-flex align-items-center gap-2 mb-2">
                          Period Management
                        </h4>
                        <p className="small text-muted mb-3">Generate a new random period ID to start a new academic period.</p>
                        <button 
                          className="btn btn-warning btn-sm d-flex align-items-center gap-2"
                          onClick={handleResetPeriod}
                          disabled={resettingPeriod}
                        >
                          <span className="material-symbols-outlined">{resettingPeriod ? "hourglass_empty" : "refresh"}</span>
                          {resettingPeriod ? "Resetting..." : "Reset Period"}
                        </button>
                        <small className="text-muted d-block mt-2">
                          <span className="material-symbols-outlined" style={{fontSize: "0.875rem", verticalAlign: "middle"}}>info</span>
                          {" "}Current Period ID: <code>{currentPeriodId || "Not set"}</code>
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-12">
                    <label className="form-label fw-semibold">Current Period (auto)</label>
                    <input className="form-control" value={currentPeriod} readOnly />
                    <small className="text-muted">Automatically set to "January to June" or "July to December" based on today's date.</small>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Planning Start Date</label>
                    <input type="date" className="form-control" value={planningStartDate} onChange={(e) => setPlanningStartDate(e.target.value)} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Planning End Date</label>
                    <input type="date" className="form-control" value={planningEndDate} onChange={(e) => setPlanningEndDate(e.target.value)} />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Monitoring Start Date</label>
                    <input type="date" className="form-control" value={monitoringStartDate} onChange={(e) => setMonitoringStartDate(e.target.value)} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Monitoring End Date</label>
                    <input type="date" className="form-control" value={monitoringEndDate} onChange={(e) => setMonitoringEndDate(e.target.value)} />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Rating Start Date</label>
                    <input type="date" className="form-control" value={ratingStartDate} onChange={(e) => setRatingStartDate(e.target.value)} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Rating End Date</label>
                    <input type="date" className="form-control" value={ratingEndDate} onChange={(e) => setRatingEndDate(e.target.value)} />
                  </div>

                  {/* Reset Period Section */}
                  
                </div>
              </div>
            </div>
          </div>

          {/* Officers */}
          <div className="col-12 col-lg-4">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-semibold"><span className="material-symbols-outlined me-2">account_circle</span> Current Officers</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">President Fullname</label>
                  <input className="form-control" value={currentPresidentFullname} onChange={(e) => setCurrentPresidentFullname(e.target.value)} placeholder="Fullname of current president" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Mayor Fullname</label>
                  <input className="form-control" value={currentMayorFullname} onChange={(e) => setCurrentMayorFullname(e.target.value)} placeholder="Fullname of current mayor" />
                </div>

                <div className="mt-3 text-muted small">
                  These fields are used in generated reports and headers.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed-bottom p-3 d-flex justify-content-end">
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

// Rating Row Component
function RatingRow({ level, ratingKey, thresholds, onUpdate, color, description }) {
  return (
    <tr className="border-bottom">
      <td className="fw-semibold">
        <span className={`badge bg-${color} me-2`}>{level}</span>
      </td>
      <td>
        <input
          type="number"
          className="form-control form-control-sm"
          step="0.01"
          value={thresholds.min ?? ""}
          onChange={(e) => onUpdate(ratingKey, "min", e.target.value)}
          placeholder="Min score"
          style={{ maxWidth: "120px" }}
          min={0}
          max={5}
        />
      </td>
      <td>
        <input
          type="number"
          className="form-control form-control-sm"
          step="0.01"
          value={thresholds.max ?? ""}
          onChange={(e) => onUpdate(ratingKey, "max", e.target.value)}
          placeholder="Max score"
          style={{ maxWidth: "120px" }}
          min={0}
          max={5}
        />
      </td>
      <td>
        <small className="text-muted">{description}</small>
      </td>
    </tr>
  )
}

// Formula Card Component
function FormulaCard({ title, icon, formula, onChange, description, isValid }) {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(formula, null, 2))
  const [jsonResult, setJsonResult] = useState("Valid JSON")

  useEffect(() => {
    setJsonInput(JSON.stringify(formula, null, 2))
    var valid = validate(formula)    
  }, [formula])

  async function validate(value) {
    try {
      const res = await validateFormula(
        {
          "formula": JSON.stringify(value, null, 2)
        }
      )

      const message = res.data.message      
      console.log("Validation REsult: ",message)

      setJsonResult(message)
      isValid(message == "Valid JSON")
      console.log(message, message == "Valid JSON")

      return message

    }
    catch(e){
      console.log(e)
      return e
    }
  }

  function handleJsonChange(e) {
    const value = e.target.value
    setJsonInput(value)
    try {
      
      const parsed = JSON.parse(value)  
      onChange(parsed)
    } catch (error) {
      // Invalid JSON, don't update
      console.log("Invalid JSON")
    }
  }

  return (
    <div className="col-12 col-md-12 col-lg-6">
      <div className="card border-0 shadow-sm rounded-3 h-100">
        <div className="card-header bg-light border-bottom">
          <h5 className="mb-0 fw-semibold">
            <span className="material-symbols-outlined me-2">{icon}</span>
            {title}
          </h5>
        </div>
        <div className="card-body p-4">
          <small className="text-muted d-block mb-3">{description}</small>
          <label className="form-label fw-semibold">JSON Configuration</label>
          <textarea
            className="form-control font-monospace"
            rows={8}
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder="Enter JSON configuration"
            style={{ fontSize: "0.875rem" }}
          />
          <small className="mt-2 d-block d-flex align-items-center gap-1">
            <span className={`material-symbols-outlined`} style={{ fontSize: "1rem", verticalAlign: "middle" }}>info</span>
            <span className={` ${jsonResult == "Valid JSON"? "text-success": "text-danger"}`}>{jsonResult}</span>
          </small>
        </div>
      </div>
    </div>
  )
}

function getBadgeColor(key) {
  const colors = {
    outstanding: "success",
    very_satisfactory: "info",
    satisfactory: "primary",
    unsatisfactory: "warning",
    poor: "danger"
  }
  return colors[key] || "secondary"
}