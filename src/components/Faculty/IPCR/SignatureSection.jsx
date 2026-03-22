export default function SignaturesSection({ ipcrInfo }) {
    const people = [
        { label: "Reviewed by", ...ipcrInfo?.review },
        { label: "Approved by", ...ipcrInfo?.approve },
        { label: "Discussed with", ...ipcrInfo?.discuss },
        { label: "Assessed by", ...ipcrInfo?.assess },
        { label: "Final Rating by", ...ipcrInfo?.final },
        { label: "Confirmed by", ...ipcrInfo?.confirm }
    ]

    return (
        <div className="mt-5">
            <div className="row g-3">
                {people.map((person, idx) => (
                    <div key={idx} className="col-md-6">
                        <div className="border-top pt-3">
                            <p className="small mb-1 fw-semibold">{person.label}:</p>
                            <p className="mb-0 fw-bold">{person?.name?.toUpperCase()}</p>
                            <p className="small text-muted mb-3">{person?.position}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}