import { useEffect, useRef, useState } from "react"
import Swal from "sweetalert2"
import { getSettings, updateSettings, validateFormula } from "../services/settingsService"
import Positions from "./Positions"
import Periods from "../components/SystemSettings/Periods"

export default function SystemSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("ratings")

  const periodsRef = useRef(null)

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
  const [quantityFormulaValid, setQuantityFormulaValid] = useState(false)
  
  const [efficiencyFormula, setEfficiencyFormula] = useState({})
  const [efficiencyFormulaValid, setEfficiencyFormulaValid] = useState(false)

  const [timelinessFormula, setTimelinessFormula] = useState({})
  const [timelinessFormulaValid, setTimelinessFormulaValid] = useState(false)

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
      if (!periodsRef.current) {
        Swal.fire("Error", "Period component not initialized", "error")
        return
      }
      const valid = periodsRef.current.validate()
      if (!valid) return

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

      // build payload
      const periodPayload = periodsRef.current.getPayload()
      const payload = {
        rating_thresholds: ratingThresholds,
        quantity_formula: quantityFormula,
        efficiency_formula: efficiencyFormula,
        timeliness_formula: timelinessFormula,
        current_president_fullname: currentPresidentFullname || null,
        current_mayor_fullname: currentMayorFullname || null,
        // merge period payload
        ...periodPayload
      }

      await updateSettings(payload)
      Swal.fire("Success", "System settings updated successfully", "success")
      const res = await getSettings()
      setSettings(res.data?.data ?? res.data ?? {})
    } catch (error) {
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
                Positions and Weights
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
                <Periods ref={periodsRef} initialData={settings} />
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