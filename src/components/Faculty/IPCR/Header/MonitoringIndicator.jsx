export default function MonitoringIndicator({ isMonitoringPhase }) {
    if (!isMonitoringPhase) return null;

    return (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
            <span className="material-symbols-outlined">warning</span>
            <span>
                You are currently in the <strong>Monitoring phase</strong>. Please update your actual accomplishment fields.
            </span>
        </div>
    )
}