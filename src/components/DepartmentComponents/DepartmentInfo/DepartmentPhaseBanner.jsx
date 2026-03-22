function DepartmentPhaseBanner({ currentPhase }) {

  function getPhaseInfos() {

    const infos = []

    if (currentPhase?.includes("planning")) {
      infos.push({
        key: "planning",
        label: "Planning Phase",
        shortLabel: "Planning",
        color: "info",
        icon: "calendar_month"
      })
    }

    if (currentPhase?.includes("monitoring")) {
      infos.push({
        key: "monitoring",
        label: "Monitoring Phase",
        shortLabel: "Monitoring",
        color: "warning",
        icon: "timeline"
      })
    }

    if (currentPhase?.includes("rating")) {
      infos.push({
        key: "rating",
        label: "Rating Phase",
        shortLabel: "Rating",
        color: "success",
        icon: "star_rate"
      })
    }

    if (infos.length === 0) {
      infos.push({
        key: "inactive",
        label: "Inactive",
        shortLabel: "Inactive",
        color: "secondary",
        icon: "block"
      })
    }

    return infos
  }

  const phaseInfos = getPhaseInfos()

  return (
    <div
      className="alert alert-soft-primary d-flex justify-content-between align-items-center mb-4 border-0 rounded-3 shadow-sm"
      style={{
        backgroundColor: "#e7f1ff",
        borderLeft: "5px solid #0d6efd"
      }}
    >

      <div className="d-flex align-items-center gap-3">

        <div
          className={`rounded-circle p-3 bg-${phaseInfos[0].color}`}
          style={{ width: 50, height: 50 }}
        >
          <span className="material-symbols-outlined text-white">
            {phaseInfos[0].icon}
          </span>
        </div>

        <div>
          <h6 className="mb-0 fw-bold text-dark">
            Current Phase{phaseInfos.length > 1 ? "s" : ""}
          </h6>

          <p className="mb-0 text-muted small">
            {phaseInfos.length === 1
              ? phaseInfos[0].label
              : "Multiple phases active"}
          </p>
        </div>

      </div>

      <div>
        {phaseInfos.map(p => (
          <span key={p.key} className={`badge bg-${p.color} me-1`}>
            {p.shortLabel}
          </span>
        ))}
      </div>

    </div>
  )
}

export default DepartmentPhaseBanner