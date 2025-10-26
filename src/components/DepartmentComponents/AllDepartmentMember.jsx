import { useState } from "react"

function AllDepartmentMember({dept, onClick, isSelected}) {

    return (
        <div
        className={`dpt ${isSelected ? "selected" : ""}`} // 👈 Add selected class
        key={dept.id}
        onClick={onClick}
        >
            <div className="pair">
                <span>{dept.name}</span>
            </div>
        </div>
    );
}

export default AllDepartmentMember