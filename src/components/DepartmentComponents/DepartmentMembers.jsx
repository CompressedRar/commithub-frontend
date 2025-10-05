import { useEffect, useState } from "react"
import { Modal } from "bootstrap"
import Swal from "sweetalert2"
import { removeUserFromDepartment } from "../../services/departmentService"


function DepartmentMembers({mems}){
    const [open, setOpen] = useState(false)
    const [archiving, setArchiving] = useState(false)

    const RemoveUser = async () => {

        var res = await removeUserFromDepartment(mems.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "User successfully removed.") {
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
    const handleRemoval = async () => {
        Swal.fire({
            title: 'Do you want to remove this user from department?',
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
                        RemoveUser()
                    } else if (result.isDenied) {
                                   
                    }
                })
        
         setArchiving(false)
    }

    useEffect(()=> {
        
    }, [])

    return (
        <tr key = {mems.id}>     
            <td className="table-profile">
                <div className="table-profile-picture" style={{backgroundImage:`url(${mems.profile_picture_link})`}}>.</div>
                {mems.first_name + " " + mems.last_name}
            </td>
            <td>{(mems.avg_performance == 5)? <span className="outstanding">OUTSTANDING</span>:
                (mems.avg_performance < 4.99 && mems.avg_performance >= 4) ? <span className="very-satisfactory">VERY SATISFACTORY</span>:
                (mems.avg_performance < 3.99 && mems.avg_performance >= 3) ? <span className="satisfactory">SATISFACTORY</span>:
                (mems.avg_performance < 2.99 && mems.avg_performance >= 2) ? <span className="unsatisfactory">UNSATISFACTORY</span>:
                (mems.avg_performance < 1.99 && mems.avg_performance >= 1) ? <span className="poor">POOR</span>:
                (mems.avg_performance < 1) ? <span className="unrated">UNRATED</span>:""}</td>                           
            <td>{mems.email}</td>
            
            <td>{mems.position.name}</td>
            <td>{mems.main_tasks_count}</td>
            <td>{mems.account_status == 0? 
            <span className="deactivated">Deactivated</span>: <span className="active" >Active</span>}</td>
            
            <td className="more-options">
                <span  className="material-symbols-outlined open" onClick={()=>{setOpen(true)}}>more_vert</span>

                {open && 
                <div className="member-options" onMouseLeave={()=>{setOpen(false)}}>
                    <span className="option">
                        <span className="material-symbols-outlined">download</span>
                        <span>Download IPCR</span>
                    </span>
                    <span className="option">
                        <span className="material-symbols-outlined">account_circle</span>
                        <span>View Profile</span>
                    </span>
                    
                    <span className="option" onClick={()=>{handleRemoval()}}>
                        <span className="material-symbols-outlined">group_remove</span>
                        <span>Remove</span>
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

export default DepartmentMembers