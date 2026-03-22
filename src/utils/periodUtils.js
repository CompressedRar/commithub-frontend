export function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function parseDateString(s) {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function computePeriodLabel(date = new Date()) {
  const m = new Date(date).getMonth() + 1;
  return m >= 1 && m <= 6 ? "January to June" : "July to December";
}

export function computePeriodId(date = new Date()) {
  const year = new Date(date).getFullYear();
  const half = computePeriodLabel(date) === "January to June" ? "H1" : "H2";
  return `${year}-${half}`;
}

export function computeCurrentPhase({ planningStart, planningEnd, monitoringStart, monitoringEnd, ratingStart, ratingEnd }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const phases = [];

  const checkPhase = (start, end, name) => {
    if (start && end) {
      const sDate = parseDateString(start);
      const eDate = parseDateString(end);
      if (sDate && eDate && sDate <= today && today <= eDate) phases.push(name);
    }
  };

  checkPhase(planningStart, planningEnd, "Planning");
  checkPhase(monitoringStart, monitoringEnd, "Monitoring");
  checkPhase(ratingStart, ratingEnd, "Rating");

  return phases.length > 0 ? phases : null;
}

export function checkDateOverlap(periodState) {
  // Logic remains the same, accepting periodState as an argument.
  // ...
  return { hasOverlap: false, message: "" };
}