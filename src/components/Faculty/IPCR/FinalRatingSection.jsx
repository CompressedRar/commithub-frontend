

export default function FinalRatingsSection({ stats, handleRemarks }) {


    
    return (
        <div className="row g-3 my-4">
            <div className="col-md-4">
                <div className="card h-100 border">
                    <div className="card-body">
                        <h6 className="card-title fw-bold">Final Average Rating</h6>
                        <div className="d-grid gap-2 small">
                            <div className="d-flex justify-content-between">
                                <span>Quality (Q):</span>
                                <strong>{parseFloat(stats.quantity).toFixed(0)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Efficiency (E):</span>
                                <strong>{parseFloat(stats.efficiency).toFixed(0)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Timeliness (T):</span>
                                <strong>{parseFloat(stats.timeliness).toFixed(0)}</strong>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2">
                                <span>Average (A):</span>
                                <strong>{parseFloat(stats.average).toFixed(1)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card h-100 border text-center">
                    <div className="card-body d-flex flex-column justify-content-center">
                        <h6 className="card-title fw-bold">Adjectival Rating</h6>
                        <p className="mb-0 fs-6 fw-bold text-warning">
                            {handleRemarks(parseFloat(stats.average).toFixed(1))}
                        </p>
                        <small className="text mt-2">Overall Average: {parseFloat(stats.average).toFixed(1)}</small>
                    </div>
                </div>
            </div>
            
        </div>
    )
}