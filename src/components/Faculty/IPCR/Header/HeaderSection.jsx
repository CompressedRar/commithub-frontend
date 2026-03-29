export default function HeaderSection() {
    return (
        <div className="text-center mb-5">

            <div className="d-flex justify-content-center gap-5 align-items-center mb-3 g-2">
                <div className="d-flex justify-content-center">
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
                <div className="d-flex justify-content-center">
                    <img
                        src={`${import.meta.env.BASE_URL}NC.png`}
                        alt="College Logo"
                        style={{ height: "80px", objectFit: "contain" }}
                    />
                </div>
            </div>
            <h4 className="fw-bold mt-3">INDIVIDUAL PERFORMANCE COMMITMENT & REVIEW FORM</h4>            
        </div>
    )
}