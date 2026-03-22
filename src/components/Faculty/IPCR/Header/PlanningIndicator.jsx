export default function PlanningIndicator({ isPlanningPhase }) {
    if (!isPlanningPhase) return null;

    return (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-4" role="alert">
            <span className="material-symbols-outlined">edit_calendar</span>
            <span>
                You are currently in the <strong>Planning phase</strong>. Please define your targets numbers for this period.
            </span>
        </div>
    );
}