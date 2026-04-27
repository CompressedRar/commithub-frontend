import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getSettings, updateSettings, verifyAdminPassword, resetPeriod, validateFormula } from "../services/settingsService";
import { computePeriodId, computePeriodLabel, parseDateString, checkDateOverlap, computeCurrentPhase, toInputDate } from "../utils/periodUtils";

export function useSystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingPeriod, setResettingPeriod] = useState(false);

  // Ratings
  const [ratingThresholds, setRatingThresholds] = useState({
    outstanding: { min: 4.5 },
    very_satisfactory: { min: 3.5, max: 4.49 },
    satisfactory: { min: 2.5, max: 3.49 },
    unsatisfactory: { min: 1.5, max: 2.49 },
    poor: { max: 1.49 }
  });

  // Formulas
  const [enableFormulas, setEnableFormulas] = useState(0);
  const [formulas, setFormulas] = useState({
    quantity: {}, efficiency: {}, timeliness: {}
  });
  const [formulaValidations, setFormulaValidations] = useState({
    quantity: true, efficiency: true, timeliness: true
  });

  // Periods
  const [periodState, setPeriodState] = useState({
    currentPeriodId: "", autoPeriodId: true, currentPeriod: "", currentPhase: null,
    planningStart: "", planningEnd: "", monitoringStart: "", monitoringEnd: "", ratingStart: "", ratingEnd: ""
  });

  // Officers
  const [officers, setOfficers] = useState({ president: "", mayor: "" });

  // Form Builder
  const [mainFormTemplateId, setMainFormTemplateId] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const phases = computeCurrentPhase(periodState);
    setPeriodState(prev => ({ ...prev, currentPhase: phases }));
  }, [
    periodState.planningStart, periodState.planningEnd, 
    periodState.monitoringStart, periodState.monitoringEnd, 
    periodState.ratingStart, periodState.ratingEnd
  ]);

  async function loadSettings() {
    try {
      const res = await getSettings();
      const data = res.data?.data ?? res.data ?? {};

      if (data.rating_thresholds) {
        setRatingThresholds(typeof data.rating_thresholds === "string" ? JSON.parse(data.rating_thresholds) : data.rating_thresholds);
      }

      setFormulas({
        quantity: data.quantity_formula || {},
        efficiency: data.efficiency_formula || {},
        timeliness: data.timeliness_formula || {}
      });
      setEnableFormulas(data.enable_formula || 0);

      setOfficers({
        president: data.current_president_fullname ?? "",
        mayor: data.current_mayor_fullname ?? ""
      });

      setPeriodState({
        currentPeriodId: data.current_period_id ?? "",
        autoPeriodId: !(data.current_period_id && data.current_period_id !== computePeriodId(new Date())),
        currentPeriod: computePeriodLabel(new Date()),
        planningStart: toInputDate(data.planning_start_date),
        planningEnd: toInputDate(data.planning_end_date),
        monitoringStart: toInputDate(data.monitoring_start_date),
        monitoringEnd: toInputDate(data.monitoring_end_date),
        ratingStart: toInputDate(data.rating_start_date),
        ratingEnd: toInputDate(data.rating_end_date),
        currentPhase: null
      });

      // Form Builder
      setMainFormTemplateId(data.main_form_template_id || null);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load system settings", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true); // move this up so UI reflects immediately

  // STEP 1: Validate all formulas
    const results = { quantity: true, efficiency: true, timeliness: true };

    for (const key of ["quantity", "efficiency", "timeliness"]) {
      try {
        await validateFormula(formulas[key]);
        results[key] = true;
      } catch {
        results[key] = false;
      }
    }

    setFormulaValidations(results);

    // STEP 2: Block save if any invalid
    if (!Object.values(results).every(Boolean)) {
      Swal.fire("Invalid Formula", "Please fix invalid formulas before saving.", "error");
      setSaving(false);
      return;
    }

    setSaving(true);

    const fmt = (d) => {
      if (!d) return null;
      const parsed = parseDateString(d);
      return parsed ? parsed.toISOString().slice(0, 10) : null;
    };

    const periodId = (!periodState.autoPeriodId && periodState.currentPeriodId) 
      ? periodState.currentPeriodId 
      : computePeriodId(new Date());

    const payload = {
      rating_thresholds: ratingThresholds,
      quantity_formula: formulas.quantity,
      efficiency_formula: formulas.efficiency,
      timeliness_formula: formulas.timeliness,
      current_president_fullname: officers.president || null,
      current_mayor_fullname: officers.mayor || null,
      current_period_id: periodId,
      current_period: computePeriodLabel(new Date()),
      planning_start_date: fmt(periodState.planningStart),
      planning_end_date: fmt(periodState.planningEnd),
      monitoring_start_date: fmt(periodState.monitoringStart),
      monitoring_end_date: fmt(periodState.monitoringEnd),
      rating_start_date: fmt(periodState.ratingStart),
      rating_end_date: fmt(periodState.ratingEnd),
      auto_period_id: !!periodState.autoPeriodId,
      enable_formula: enableFormulas,
      main_form_template_id: mainFormTemplateId || null
    };

    const { value: adminPassword } = await Swal.fire({
      title: "Confirm changes",
      text: "Please enter your admin password to confirm",
      input: "password",
      inputAttributes: { autocapitalize: "off", autocorrect: "off" },
      showCancelButton: true
    });

    if (!adminPassword) {
      setSaving(false);
      return;
    }

    try {
      const confirmationToken = await verifyAdminPassword({ password: adminPassword });
      payload.confirmation_token = confirmationToken.data.confirmation_token;
      
      await updateSettings(payload);
      Swal.fire("Success", "System settings updated successfully", "success");
      await loadSettings();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPeriod() {
    const { value: adminPassword } = await Swal.fire({
      title: "Reset Period",
      text: "This will generate a new random period ID. Are you sure?",
      input: "password",
      showCancelButton: true,
      confirmButtonText: "Yes, Reset Period",
      confirmButtonColor: "#f59e0b",
      inputValidator: (value) => !value && "Password is required"
    });

    if (!adminPassword) return;

    setResettingPeriod(true);
    try {
      await verifyAdminPassword({ password: adminPassword });
      const res = await resetPeriod();
      
      if (res.data?.status === "success") {
        Swal.fire("Success", `Period reset! New ID: ${res.data?.new_period_id}`, "success");
        await loadSettings();
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to reset period", "error");
    } finally {
      setResettingPeriod(false);
    }
  }

  return {
    loading, saving, resettingPeriod,
    ratingThresholds, setRatingThresholds,
    formulas, setFormulas,
    formulaValidations, setFormulaValidations,
    enableFormulas, setEnableFormulas,
    periodState, setPeriodState,
    officers, setOfficers,
    mainFormTemplateId, setMainFormTemplateId,
    handleSave, handleResetPeriod
  };
}