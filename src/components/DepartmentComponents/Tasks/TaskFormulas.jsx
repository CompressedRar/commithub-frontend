import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { getSettings, updateSettings, validateFormula } from "../../../services/settingsService"
import { updateAssignedDepartmentTaskFormula } from "../../../services/departmentService"
import Switch from '@mui/material/Switch';


export default function FormulaSettings({task_data}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [quantity, setQuantity] = useState({})
  const [efficiency, setEfficiency] = useState({})
  const [timeliness, setTimeliness] = useState({})

  const [enableFormulas, setEnableFormulas] = useState(false) 

  const [validity, setValidity] = useState({
    quantity: true,
    efficiency: true,
    timeliness: true
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      if (task_data == null) return;

    
      setEnableFormulas(task_data.enable_formulas ?? false)
      console.log("Quantity", task_data.quantity_formula)
      setQuantity(task_data.quantity_formula)
      setEfficiency(task_data.efficiency_formula)
      setTimeliness(task_data.timeliness_formula)
    } catch {
      Swal.fire("Error", "Failed to load formulas", "error")
    } finally {
      setLoading(false)
    }
  }

  async function save() {

    if(enableFormulas) {
      if (!validity.quantity || !validity.efficiency || !validity.timeliness) {
        Swal.fire("Validation Error", "Fix invalid formulas before saving", "warning")
        return
      }
    }
    

    try {
      setSaving(true)
      await updateAssignedDepartmentTaskFormula(task_data.assigned_dept_id,{
        quantity_formula: quantity,
        efficiency_formula: efficiency,
        timeliness_formula: timeliness,
        enable_formulas: enableFormulas
      })
      Swal.fire("Success", "Formulas updated successfully", "success")
    } catch {
      Swal.fire("Error", "Failed to save formulas", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <header className="mb-4">
        <h2 className="fw-bold">
          <span className="material-symbols-outlined me-2">calculate</span>
          Formula Settings
        </h2>
        <p className="text-muted">Configure system computation formulas</p>
      </header>

      <div className="form-check form-switch my-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="enableFormulas"
          checked={enableFormulas}
          onChange={(e) => setEnableFormulas(e.target.checked)}
        />
        <label className="form-check-label fw-semibold" htmlFor="enableFormulas">
          Enable Formulas
        </label>
      </div>


      {
        enableFormulas ? 
        <div className="row g-3" >
        <FormulaEditor
          title="Quantity Formula"
          icon="inventory_2"
          value={quantity}
          onChange={setQuantity}
          onValidity={(v) => setValidity(p => ({ ...p, quantity: v }))}
        />

        <FormulaEditor
          title="Efficiency Formula"
          icon="speed"
          value={efficiency}
          onChange={setEfficiency}
          onValidity={(v) => setValidity(p => ({ ...p, efficiency: v }))}
        />

        <FormulaEditor
          title="Timeliness Formula"
          icon="schedule"
          value={timeliness}
          onChange={setTimeliness}
          onValidity={(v) => setValidity(p => ({ ...p, timeliness: v }))}
        />
      </div>
      :
      <div className="card text-muted">
        Click "Enable Formulas" to edit formula for the tasks.
      </div>
      }

      <div className=" p-3 d-flex justify-content-end bg-white border-top">
        <button className="btn btn-success" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────── */

function FormulaEditor({ title, icon, value, onChange, onValidity }) {
  const [input, setInput] = useState(JSON.stringify(value, null, 2))
  const [result, setResult] = useState("Valid JSON")

  useEffect(() => {
    setInput(JSON.stringify(value, null, 2))
    validate(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  async function validate(obj) {
    try {
      const res = await validateFormula({
        formula: JSON.stringify(obj, null, 2)
      })
      const msg = res.data?.message ?? "Invalid JSON"
      console.log(res.data?.message )
      setResult(msg)
      onValidity(msg === "Valid JSON")
    } catch {
      setResult("Validation failed")
      onValidity(false)
    }
  }

  function handleChange(e) {
    const raw = e.target.value
    setInput(raw)

    try {
      const parsed = JSON.parse(raw)
      onChange(parsed)
      validate(parsed)
    } catch {
      setResult("Invalid JSON format")
      onValidity(false)
    }
  }

  return (
    <div className="col-12 col-lg-12">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-header bg-light">
          <h5 className="mb-0 fw-semibold">
            <span className="material-symbols-outlined me-2">{icon}</span>
            {title}
          </h5>
        </div>

        <div className="card-body">
          <textarea
            className="form-control font-monospace"
            rows={8}
            defaultValue={input}
            value={input}
            onChange={handleChange}
          />

          <small className="d-flex align-items-center gap-1 mt-2">
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
              info
            </span>
            <span className={result === "Valid JSON" ? "text-success" : "text-danger"}>
              {result}
            </span>
          </small>
        </div>
      </div>
    </div>
  )
}
