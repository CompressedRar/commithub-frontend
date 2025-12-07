import React, { useEffect, useImperativeHandle, useState, forwardRef } from "react"
import Swal from "sweetalert2"

const Periods = forwardRef(function Periods({ initialData = {} }, ref) {
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

  useEffect(() => {
    setValues(initialData)

    console.log("Periods initialData", initialData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  // normalize server value -> yyyy-mm-dd string for <input type="date" />
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

  // check for overlapping date ranges
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

  // expose methods to parent
  useImperativeHandle(ref, () => ({
    validate: () => {
      const computedLabel = computePeriodLabel(new Date())
      setCurrentPeriod(computedLabel)
      return validatePeriodDates(computedLabel)
    },
    getPayload: () => {
      // compute id if auto or empty
      let periodId = currentPeriodId
      if (autoPeriodId || !periodId) periodId = computePeriodId(new Date())

      // ensure dates are in ISO (yyyy-mm-dd) or null
      const fmt = (d) => {
        if (!d) return null
        const parsed = parseDateString(d)
        return parsed ? parsed.toISOString().slice(0, 10) : null
      }

      return {
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
    },
    setValues: (data = {}) => setValues(data)
  }))

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

  // update current phase when any date changes
  useEffect(() => {
    setCurrentPhase(computeCurrentPhase())
  }, [planningStartDate, planningEndDate, monitoringStartDate, monitoringEndDate, ratingStartDate, ratingEndDate])

  return (
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
    </div>
  )
})

export default Periods