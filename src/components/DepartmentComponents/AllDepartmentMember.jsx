import { useState } from "react"

function AllDepartmentMember({dept, onClick}) {

    return (
        <div
        className={`department ${isSelected ? "selected" : ""}`} // 👈 Add selected class
        key={dept.id}
        onClick={onClick}
        >
            <div className="pair">
                <span className="material-symbols-outlined">{dept.icon || "domain"}</span>
                <span>{dept.name}</span>
            </div>
        </div>
    );
}

export default AllDepartmentMember