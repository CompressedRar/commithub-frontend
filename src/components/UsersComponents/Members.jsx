import { useState } from "react"
import { Modal } from "bootstrap"

import MemberProfile from "./MemberProfile"
import { archiveAccount, unarchiveAccount } from "../../services/userService"
import Swal from "sweetalert2"

function Members({mems, switchMember}){
    const [open, setOpen] = useState(false)
    const [archiving, setArchiving] = useState(false)

    const Reactivate = async () => {
        var res = await unarchiveAccount(mems.id).then(data => data.data.message)
        if(res == "User successfully reactivated") {
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: res,
                icon:"error"
            })
        }
    }
    const handleReactivate = async () => {
        Swal.fire({
            title: 'Do you want to reactivate this account?',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2'
                },
                        }).then(async (result) => {
                        if (result.isConfirmed) {
                            Reactivate()
                        } else if (result.isDenied) {
                               
                        }
                    })
            
    
        const modalEl = document.getElementById("user-profile");
        const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
        modal.hide();
    
        setArchiving(false)
    }

    const handleArch = async () => {
        var res = await archiveAccount(mems.id).then(data => data.data.message)
        if(res == "User successfully deactivated") {
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: res,
                icon:"error"
            })
        }
    }
    const handleArchive = async () => {
        Swal.fire({
            title: 'Do you want to deactivate this account?',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2'
                },
                        }).then(async (result) => {
                        if (result.isConfirmed) {
                            handleArch()
                        } else if (result.isDenied) {
                               
                        }
                    })
            
    
        const modalEl = document.getElementById("user-profile");
        const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
        modal.hide();
    
        setArchiving(false)
    }


    return (
        <tr key = {mems.id}>
            <td>{mems.id}</td>                                    
             <td>{mems.email}</td>
            <td>{mems.first_name + " " + mems.last_name}</td>
            <td>{mems.department.name}</td>
            <td>{mems.position.name}</td>
            <td>{mems.role[0].toUpperCase() + mems.role.slice(1)}</td>
            <td style={{display:"flex", justifyContent: "center"}}>{mems.account_status == 0? 
            <span className="deactivated">Deactivated</span>: <span className="active" >Active</span>}</td>
            <td>{mems.created_at}</td>
            <td className="more-options">
                <span  className="material-symbols-outlined open" onClick={()=>{setOpen(true)}}>more_vert</span>

                {open && 
                <div className="member-options" onMouseLeave={()=>{setOpen(false)}}>
                    
                    <span className="option" onClick={()=>{switchMember(mems.id)}} data-bs-toggle="modal" data-bs-target="#user-profile">
                        <span className="material-symbols-outlined">account_circle</span>
                        <span>View Profile</span>
                    </span>
                    
                    <span className="option" onClick={()=> {
                        if(mems.account_status == 0){
                            handleReactivate()
                        }
                        else {
                            handleArchive()
                        }
                    }}>
                        <span className="material-symbols-outlined">account_circle_off</span>
                        <span>{mems.account_status == 0? "Reactivate Account": "Deactivate Account"}</span>
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