
import { useState } from "react";

export default function PositionItem({position}){


    return (
        <div className="position-item p-3 border rounded mb-3 d-flex justify-content-between align-items-start">

    <div className="position-name fw-semibold fs-5">
        {position.name}
    </div>

    <div className="weights d-flex gap-4 align-items-center">

        <div className="weight-pair d-flex flex-column text-end">
            <span className="weight-name text-muted small">Core Function</span>
            <span className="fw-semibold">{position.core_weight}</span>
        </div>

        <div className="weight-pair d-flex flex-column text-end">
            <span className="weight-name text-muted small">Strategic Function</span>
            <span className="fw-semibold">{position.strategic_weight}</span>
        </div>

        <div className="weight-pair d-flex flex-column text-end">
            <span className="weight-name text-muted small">Support Function</span>
            <span className="fw-semibold">{position.support_weight}</span>
        </div>

        <button className="btn btn-primary d-flex align-items-center gap-1">
            <span className="material-symbols-outlined">edit</span>
            <span>Edit</span>
        </button>

    </div>

</div>

    )
}