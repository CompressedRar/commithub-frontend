import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { removeTask } from "../../services/departmentService"

function GeneralTask({mems, switchMember}){
    const [open, setOpen] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const [assigned, setAssigned] = useState([])

    function filterAssigned(){
        var iteratedmembers = []
        var filteredMembers = []

        for(const user of mems.users){
            console.log("dpet task user",user)
            if(iteratedmembers.includes(user.id)) continue;

            iteratedmembers.push(user.id)
            filteredMembers.push(user)            
        }

        setAssigned(filteredMembers)
    }

    const Remove = async () => {
        var res = await removeTask(mems.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "Task successfully removed.") {
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
    const handleRemove = async () => {
        Swal.fire({
            title: 'Do you want to remove this task?',
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
                            Remove()
                        } else if (result.isDenied) {
                               
                        }
                    })
    
        setArchiving(false)
    }

    useEffect(()=>{
        filterAssigned()
    }, [])


    return (
        <tr key = {mems.id}>                              
            <td>{mems.name}</td>
            <td>{mems.target_accomplishment}</td>
            <td>{mems.actual_accomplishment}</td>
            <td>{mems.category.name}</td>
            <td className="profile-icon-container">{
                assigned.map(user => (
                    <div className="profile-icon" style={{backgroundImage: `url('${user.profile_picture_link}')`}}>.</div>
                ))
            }</td>
            <td className="more-options">
                <span  className="material-symbols-outlined open" onClick={()=>{setOpen(true)}}>more_vert</span>

                {open && 
                <div className="member-options" onMouseLeave={()=>{setOpen(false)}}>
                    
                    <span className="option" onClick={()=>{switchMember(mems.id)}} data-bs-toggle="modal" data-bs-target="#general-user-profile">
                        <span className="material-symbols-outlined">account_circle</span>
                        <span>Assign Member</span>
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

export default GeneralTask