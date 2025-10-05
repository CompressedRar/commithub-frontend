import { use, useEffect, useState } from "react"
import { assignUsers, getAssignedUsers, getDepartmentMembers, getGeneralAssignedUsers, unAssignUsers } from "../../services/departmentService"
import Swal from "sweetalert2"
import { socket } from "../api"


function GeneralAssignTask(props){
    const [members, setMembers] = useState([])
    const [assignedMembers, setAssignedMembers] = useState([])
    const [archiving, setArchiving] = useState(false)

    async function loadAssignedMembers(){
        var res = await getGeneralAssignedUsers(props.task_id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        setAssignedMembers(res)
        console.log("assigned members: ", res)
    }

    function checkIfAssigned(user_id){

        for(const i of assignedMembers){
            if(i.id == user_id) return true
        }

        return false
    }

    async function loadMembers(){
        var res = await getDepartmentMembers(props.dept_id, 0, 100).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log("department assigned members: ", res)
        setMembers(res)
    }

    async function AssignUser(userid) {
    
            var res = await assignUsers(userid, props.task_id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            if(res == "User successfully assigned.") {
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
    async function handleAssign(userid){
            Swal.fire({
                title: 'Do you want to assign the task to this user?',
                showDenyButton: true,
                confirmButtonText: 'Yes',
                denyButtonText: 'No',
                icon:"question",
                customClass: {
                    actions: 'my-actions',
                    cancelButton: 'order-1 right-gap',
                    confirmButton: 'order-2'
                    },
                        }).then(async (result) => {
                        if (result.isConfirmed) {
                            AssignUser(userid)
                        } else if (result.isDenied) {
                                       
                        }
                    })
             setArchiving(false)
        }

    async function UnassignUser(userid) {
    
            var res = await unAssignUsers(userid, props.task_id).then(data => data.data.message).catch(error => {
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
    async function handleUnassign(userid){
            Swal.fire({
                title: 'Do you want to remove the task from this user? ',
                showDenyButton: true,
                text:"Note: Removing this task will erase user\'s corresponding task data in all of its IPCR.",
                confirmButtonText: 'Yes',
                confirmButtonColor:"red",
                denyButtonText: 'No',
                denyButtonColor:"gray",
                icon:"warning",
                customClass: {
                    actions: 'my-actions',
                    cancelButton: 'order-1 right-gap',
                    confirmButton: 'order-2'
                    },
                        }).then(async (result) => {
                        if (result.isConfirmed) {
                            UnassignUser(userid)
                        } else if (result.isDenied) {
                                       
                        }
                    })
             setArchiving(false)
        }

    useEffect(()=>{
        loadAssignedMembers()
        loadMembers()

        socket.on("user_assigned", ()=>{
            loadMembers()
            loadAssignedMembers()
            console.log("heheh user assigned")
        })

        socket.on("user_unassigned", ()=>{
            loadMembers()
            loadAssignedMembers()
            console.log("heheh user unassigned")
        })
    }, [])

    //graphs mamayang gabi
    //wag na iassign si president at administrator

    return(
        <div className="assign-task-container">
            <div className="members-container">
                {members.map(member => (
                <div className="user">
                    <div className="user-profile">
                        <div className="user-image" style={{backgroundImage: `url('${member.profile_picture_link}')`}}>.</div>
                        <div className="user-info">
                            <div className="user-name">{member.first_name + " " + member.last_name}</div>
                            <div className="user-dept">{member.department_name}</div>
                        </div>
                    </div>
                    <div className="option">
                        {checkIfAssigned(member.id)?
                            <button className="btn btn-danger" onClick={()=>{
                                handleUnassign(member.id)
                            }}>
                                <span className="material-symbols-outlined">remove</span>
                                <span>Remove User</span>
                            </button>
                            :
                            <button className="btn btn-success" onClick={()=>{
                                handleAssign(member.id)
                            }}>
                                <span className="material-symbols-outlined">add</span>
                                <span>Assign User</span>
                            </button>
                        }
                    </div>
                </div>
                ))}
                
            </div>
            
        </div>
    )   
}

export default GeneralAssignTask