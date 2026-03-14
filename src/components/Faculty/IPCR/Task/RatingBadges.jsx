export default function RatingBadges({ task }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
        }}>
            <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
                <div>{parseFloat(task.quantity).toFixed(0)}</div>
            </div>
            <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
                <div>{parseFloat(task.efficiency).toFixed(0)}</div>
            </div>
            <div className="text-center" style={{ fontSize: "1.5rem", borderStyle: "solid", borderWidth: "0 1px 0 0", borderColor: "grey", height: "100%" }}>
                <div>{parseFloat(task.timeliness).toFixed(0)}</div>
            </div>
            <div className="text-center" style={{ fontSize: "1.5rem" }}>
                <div>{parseFloat(task.average).toFixed(1)}</div>
            </div>
        </div>
    )
}