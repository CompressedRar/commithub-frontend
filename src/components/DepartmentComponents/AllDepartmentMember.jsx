import { useState } from "react"

function AllDepartmentMember({dept, onClick}) {

    return (
        <div className="department" key={dept.id} onClick={onClick}>
            <div className="pair">
                <span className="material-symbols-outlined"></span>
                <span>{dept.name}</span>
            </div>
            
        </div>
        
    )
}

export default AllDepartmentMember