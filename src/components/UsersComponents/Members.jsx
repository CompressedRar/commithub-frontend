import { useState } from "react"
import { Modal } from "bootstrap"
import MemberProfile from "./MemberProfile"
function Members({mems, switchMember}){
    const [open, setOpen] = useState(false)


    return (
        <tr key = {mems.id}>
            <td>{mems.id}</td>                                    
             <td>{mems.email}</td>
            <td>{mems.first_name + " " + mems.last_name}</td>
            <td>{mems.department.name}</td>
            <td>{mems.position.name}</td>
            <td>{mems.role[0].toUpperCase() + mems.role.slice(1)}</td>
            <td>{mems.account_status == 0? "Deactivated": "Active"}</td>
            <td>{mems.created_at}</td>
            <td className="more-options">
                <span  className="material-symbols-outlined open" onClick={()=>{setOpen(true)}}>more_vert</span>

                {open && 
                <div className="member-options" onMouseLeave={()=>{setOpen(false)}}>
                    
                    <span className="option" onClick={()=>{switchMember(mems.id)}} data-bs-toggle="modal" data-bs-target="#user-profile">
                        <span className="material-symbols-outlined">account_circle</span>
                        <span>View Profile</span>
                    </span>
                    <span className="option">
                        <span className="material-symbols-outlined">edit</span>
                        <span>Edit Info</span>
                    </span>
                    
                    <span className="option">
                        <span className="material-symbols-outlined">account_circle_off</span>
                        <span>Deactivate</span>
                    </span>


                </div>}

                {/**
                    * view profile
                    * assign tasks
                    * change role
                    * remove
                    * deactivate or reactivate
                    * edt member info
                */}
             </td>
             
        </tr>
    )
}

export default Members