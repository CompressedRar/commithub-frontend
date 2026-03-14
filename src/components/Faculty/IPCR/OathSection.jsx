export default function OathSection({ ipcrInfo }) {
    return (
        <div className="mb-4 p-3 bg-light rounded-3">
            <p className="fst-italic mb-3">
                I, <strong>{ipcrInfo?.user_info.first_name} {ipcrInfo?.user_info.last_name}</strong>,
                {ipcrInfo?.user_info.position.name} of the <strong>NORZAGARAY COLLEGE</strong>, commit to deliver and agree to be rated on
                the attainment of the following targets in accordance with the indicated measures for this period.

            </p>

            <div className="row g-3">
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="form-label fw-semibold">Ratee</label>
                        <input
                            type="text"
                            className="form-control"
                            value={`${ipcrInfo?.user_info.first_name} ${ipcrInfo?.user_info.last_name}`}
                            readOnly
                        />
                    </div>
                </div>
            </div>

            {/* Legend */}
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
    )
}