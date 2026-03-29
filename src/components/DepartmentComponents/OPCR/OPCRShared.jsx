

import { useState, useEffect } from "react";
import { FormControl, InputLabel, MenuItem, Select, CircularProgress } from "@mui/material";
import { clampRating, handleTabbing, numericKeyDown, handlePasteRate, sanitizeNumberInput } from "../../../utils/inputSanitization";

// ─── Header ──────────────────────────────────────────────────────────────────

export function OPCRHeaderSection({ title = "OFFICE PERFORMANCE COMMITMENT & REVIEW FORM", subtitle = null }) {
  return (
    <div className="text-center mb-5">
      <div className="d-flex justify-content-center gap-5 align-items-center mb-3 g-2">
        <div className=" d-flex justify-content-center">
          <img
            src={`${import.meta.env.BASE_URL}municipal.png`}
            alt="Municipal Logo"
            style={{ height: "80px", objectFit: "contain" }}
          />
        </div>
        <div className="">
          <p className="mb-1 small">Republic of the Philippines</p>
          <p className="mb-1 small">Province of Bulacan</p>
          <p className="mb-2"><strong>Municipality of Norzagaray</strong></p>
          <h5 className="mb-0"><strong>NORZAGARAY COLLEGE</strong></h5>
        </div>
        <div className=" d-flex justify-content-center">
          <img
            src={`${import.meta.env.BASE_URL}NC.png`}
            alt="College Logo"
            style={{ height: "80px", objectFit: "contain" }}
          />
        </div>
      </div>
      <h4 className="fw-bold mt-3">{title}</h4>
      {subtitle && <p className="text-muted small mt-2">{subtitle}</p>}
    </div>
  );
}

// ─── Officer Info ─────────────────────────────────────────────────────────────

export function OfficerInfoSection({ headData, rateeLabel = "Ratee" }) {
  return (
    <div className="mb-4 p-3 bg-light rounded-3">
      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label fw-semibold">{rateeLabel}</label>
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
  );
}

// ─── Signatures ───────────────────────────────────────────────────────────────

export function OPCRSignaturesSection({ headData, people: customPeople }) {
  const people = customPeople ?? [
    { label: "Discussed with", name: headData?.fullName, position: headData?.position },
    { label: "Assessed by", name: headData?.individuals?.assess?.name, position: headData?.individuals?.assess?.position },
    { label: "Final Rating by", name: headData?.individuals?.final?.name, position: headData?.individuals?.final?.position },
    { label: "Approved by", name: headData?.individuals?.approve?.name, position: headData?.individuals?.approve?.position },
  ];

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
  );
}

// ─── Final Ratings ────────────────────────────────────────────────────────────

export function OPCRFinalRatingsSection({ stats, opcrInfo, handleRemarks, ratingThresholds }) {
  const [totalWeightedAvg, setTotalWeightedAvg] = useState(0);

  useEffect(() => {
    if (!opcrInfo) return;
    let total = 0;
    opcrInfo.forEach((categoryObj) =>
      Object.entries(categoryObj).forEach(([, tasks]) =>
        tasks.forEach((task) => { total += parseFloat(task.rating?.weighted_avg ?? 0); })
      )
    );
    setTotalWeightedAvg(total);
  }, [stats.average, opcrInfo]);

  const hasWeighted = opcrInfo?.some((cat) =>
    Object.values(cat).some((tasks) => tasks.some((t) => t.description?.task_weight != null))
  );

  return (
    <div className="row g-3 my-4">
      {/* Simple Average */}
      <div className={hasWeighted ? "col-md-6" : "col-md-4"}>
        <div className="card h-100 border">
          <div className="card-body">
            <h6 className="card-title fw-bold">Average Rating</h6>
            <div className="d-grid gap-2 small">
              <div className="d-flex justify-content-between">
                <span>Quality (Q):</span>
                <strong>{parseFloat(stats.quantity || 0).toFixed(0)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Efficiency (E):</span>
                <strong>{parseFloat(stats.efficiency || 0).toFixed(0)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Timeliness (T):</span>
                <strong>{parseFloat(stats.timeliness || 0).toFixed(0)}</strong>
              </div>
              <div className="d-flex justify-content-between border-top pt-2">
                <span>Average (A):</span>
                <strong>{parseFloat(stats.average || 0).toFixed(1)}</strong>
              </div>
            </div>
            <br />
            <h6 className="fw-bold">Adjectival Rating</h6>
            <p className="mb-0 fs-5 fw-bold text-warning">
              {handleRemarks(parseFloat(stats.average || 0).toFixed(1), ratingThresholds)}
            </p>
            <small className="text-muted mt-2">Overall Average: {parseFloat(stats.average || 0).toFixed(2)}</small>
          </div>
        </div>
      </div>

      {/* Weighted Average — only shown when task_weight data exists */}
      {hasWeighted && (
        <div className="col-md-6">
          <div className="card h-100 border">
            <div className="card-body">
              <h6 className="card-title fw-bold">Weighted Average</h6>
              <div className="d-grid gap-2 small">
                {opcrInfo.map((categoryObj, i) =>
                  Object.entries(categoryObj).map(([, tasks]) =>
                    tasks.map((task, idx) => (
                      <div key={`${i}-${idx}`} className="d-flex justify-content-between">
                        <span>{task.title} ({String(task.description?.task_weight * 100)}%)</span>
                        <strong>{parseFloat((task.rating?.average ?? 0) * (task.description?.task_weight ?? 0)).toFixed(2)}</strong>
                      </div>
                    ))
                  )
                )}
                <div className="d-flex justify-content-between border-top pt-2">
                  <span>Total Weighted Average (A):</span>
                  <strong>{parseFloat(totalWeightedAvg).toFixed(2)}</strong>
                </div>
              </div>
              <br/>
              <h6 className="fw-bold">Adjectival Rating</h6>
              <p className="mb-0 fs-5 fw-bold text-warning">
                {handleRemarks(parseFloat(totalWeightedAvg).toFixed(2), ratingThresholds)}
              </p>
              <small className="text-muted mt-2">Total Weighted Average: {parseFloat(totalWeightedAvg || 0).toFixed(2)}</small>
            </div>
          </div>
        </div>
      )}

      {/* Adjectival Rating card (shown when no weighted avg) */}
      {!hasWeighted && (
        <div className="col-md-4">
          <div className="card h-100 border text-center">
            <div className="card-body d-flex flex-column justify-content-center">
              <h6 className="card-title fw-bold">Adjectival Rating</h6>
              <p className="mb-0 fs-6 fw-bold text-warning">
                {handleRemarks(parseFloat(stats.average || 0).toFixed(1), ratingThresholds)}
              </p>
              <small className="text-muted mt-2">Overall Average: {parseFloat(stats.average || 0).toFixed(2)}</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────

export function OPCRDownloadButton({ onDownload, downloading, label = "Download OPCR", options }) {
  const defaultOptions = [
    { value: "opcr", label: "Standard OPCR" },
    { value: "weighted", label: "Weighted OPCR" },
    { value: "planned", label: "Planned OPCR" },
  ];

  return (
    <FormControl sx={{ width: "200px" }} size="small" variant="outlined" disabled={downloading}>
      <InputLabel>{downloading ? "Generating..." : label}</InputLabel>
      <Select
        value=""
        label={downloading ? "Generating..." : label}
        onChange={onDownload}
        IconComponent={downloading ? () => <CircularProgress size={16} sx={{ mr: 2 }} /> : undefined}
      >
        {(options ?? defaultOptions).map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ─── OPCR Rating Badges (read-only) ──────────────────────────────────────────

export function OPCRRatingBadges({ task }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
      {["quantity", "efficiency", "timeliness"].map((field) => (
        <div
          key={field}
          className="text-center"
          style={{ fontSize: "1.5rem", borderRight: "1px solid grey", height: "100%" }}
        >
          {parseFloat(task.rating?.[field] || 0).toFixed(0)}
        </div>
      ))}
      <div className="text-center" style={{ fontSize: "1.5rem" }}>
        {parseFloat(task.rating?.average || 0).toFixed(1)}
      </div>
    </div>
  );
}

// ─── OPCR Editable Rating Badges ─────────────────────────────────────────────

export function OPCREditableRatingBadges({ task, canEval, isRatingPhase, setRating }) {
  const isEditable = canEval && isRatingPhase;

  function sanitizeNumeric(v) {
    if (v === undefined || v === null || v === "") return "";
    const str = String(v).replace(/[^0-9.]/g, "");
    const num = parseInt(str.split(".")[0], 10);
    if (isNaN(num)) return "";
    if (num < 1) return "1";
    if (num > 5) return "5";
    return String(num);
  }

  function handleInput(e, field) {
    if (!canEval) return;
    const sanitized = sanitizeNumeric(e.target.value);
    if (sanitized) handleTabbing(e);
    e.target.value = sanitized;
    // Always calls setRating with a fresh object so the debounce fires
    // even when the same value is re-entered.
    setRating(task.rating?.a_dept_id, field, sanitized);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", height: "150px" }}>
      {["quantity", "efficiency", "timeliness"].map((field) => (
        <input
          key={field}
          type="number"
          style={{ width: "100%", height: "100%", fontWeight:"bolder" }}
          id={`${task.rating?.id}-${field}`}
          className={`form-control form-control-sm no-spinner text-center ${canEval? "bg-success bg-opacity-25" : ""}`}
          disabled={!isEditable}
          max={5}
          min={1}
          onInput={(e) => handleInput(e, field)}
          onFocus={(e) => e.target.select()}
          defaultValue={parseFloat(task.rating?.[field] ?? 0).toFixed(0)}
        />
      ))}
      <input
        type="number"
        style={{ width: "100%", height: "100%" }}
        className="form-control form-control-sm no-spinner text-center"
        readOnly
        disabled
        value={parseFloat(task.rating?.average ?? 0).toFixed(1)}
      />
    </div>
  );
}

// ─── OPCR Task Row ────────────────────────────────────────────────────────────

export function OPCRTaskRow({ task, assignedData, canEval, isRatingPhase, setRating, showWeightedAvg = false, editable = false }) {
  const freq = task.frequency || 1;

  function renderTimeliness(summary, isActual = false) {
    if (task.description?.timeliness_mode === "timeframe") {
      const val = isActual
        ? (summary?.actual != 0 ? (summary?.actual / freq).toFixed(0) : 0)
        : (summary?.target != 0 ? (summary?.target / freq).toFixed(0) : 0);
      return (
        <div>
          <input disabled className="form-control form-control-sm" defaultValue={val} />
          <small className="text-muted d-block">{task.description?.time}/s with</small>
        </div>
      );
    }

    if (!isActual) {
      return (
        <div>
          <input disabled className="form-control form-control-sm" value="" />
          <small className="text-muted d-block">on the set deadline with</small>
        </div>
      );
    }

    const days = task.working_days?.actual ?? 0;
    const daysPerFreq = parseFloat((days / freq).toFixed(0));
    const absVal = Math.abs(daysPerFreq);
    const label = daysPerFreq === 0
      ? "on the set deadline with"
      : daysPerFreq < 0
        ? "day/s early in average with"
        : "day/s late in average with";

    return (
      <div>
        {daysPerFreq === 0
          ? <input disabled className="form-control form-control-sm" value="" />
          : <input disabled className="form-control form-control-sm" defaultValue={absVal} />
        }
        <small className="text-muted d-block">{label}</small>
      </div>
    );
  }

  return (
    <tr className="align-middle">
      <td className="fw-semibold small" style={{ minWidth: 220 }}>{task.title}</td>
      {showWeightedAvg && (
        <td className="fw-semibold small text-center">{task.description?.task_weight * 100}%</td>
      )}

      {/* Target */}
      <td>
        <div className="d-grid gap-2">
          <div>
            <input disabled className="form-control form-control-sm" defaultValue={(task.summary?.target ?? 0).toFixed?.(0) ?? task.summary?.target} />
            <small className="text-muted d-block">{task.description?.target} {task.description?.timeliness_mode === "timeframe" ? "in" : ""}</small>
          </div>
          {renderTimeliness(task.working_days, false)}
          <div>
            <input disabled className="form-control form-control-sm" defaultValue={task.corrections?.target !== 0 ? parseFloat(task.corrections?.target / freq).toFixed(0) : 0} />
            <small className="text-muted d-block">{task.description?.alterations}</small>
          </div>
        </div>
      </td>

      {/* Individuals Accountable */}
      <td>
        <div className="d-flex justify-content-center align-items-center flex-column">
          {assignedData && Object.keys(assignedData).includes(task.title)
            && assignedData[task.title].map((user, i) => <div key={i}>{user}</div>)}
        </div>
      </td>

      {/* Actual */}
      <td>
        <div className="d-grid gap-2">
          <div>
            <input disabled className="form-control form-control-sm" defaultValue={String(task.summary?.actual ?? "").replace(".", "")} />
            <small className="text-muted d-block">{task.description?.actual} {task.description?.timeliness_mode === "timeframe" ? "in" : ""}</small>
          </div>
          {renderTimeliness(task.working_days, true)}
          <div>
            <input disabled className="form-control form-control-sm" defaultValue={task.corrections?.actual !== 0 ? parseFloat(task.corrections?.actual / freq).toFixed(0) : 0} />
            <small className="text-muted d-block">{task.description?.alterations}/s</small>
          </div>
        </div>
      </td>

      {/* Rating */}
      <td className="text-center">
        {isRatingPhase
          ? <OPCREditableRatingBadges task={task} canEval={canEval} isRatingPhase={isRatingPhase} setRating={setRating} />
          : <OPCRRatingBadges task={task} />
        }
      </td>

      {/* Weighted avg */}
      {showWeightedAvg && (
        <td className="small text-center fw-semibold">
          {((task.rating?.average ?? 0) * (task.description?.task_weight ?? 0)).toFixed(2)}
        </td>
      )}

      {/* Remarks placeholder */}
      <td className="small text-center fw-semibold">N/A</td>
    </tr>
  );
}

// ─── OPCR Task Section ────────────────────────────────────────────────────────

export function OPCRTaskSection({ category, tasks, assignedData, canEval, isRatingPhase, setRating, showWeightedAvg = false, editable = false }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <>
      <tr className="table-light small">
        <td colSpan={showWeightedAvg ? 8 : 7} className="text-muted">{category}</td>
      </tr>
      {tasks.map((task, idx) => (
        <OPCRTaskRow
          key={`${task.id ?? idx}-${task.rating?.quantity}-${task.rating?.efficiency}-${task.rating?.timeliness}`}
          task={task}
          assignedData={assignedData}
          canEval={canEval}
          isRatingPhase={isRatingPhase}
          setRating={setRating}
          showWeightedAvg={showWeightedAvg}
          editable={editable}
        />
      ))}
    </>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function OPCRLoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
