import { useEffect, useState } from "react"
import { assignDepartmentHead, getDepartment, removeDepartmentHead } from "../../services/departmentService"
import Swal from "sweetalert2"
import { socket } from "../api"

function DepartmentAssignHead(props){
    const [departmentInfo, setDepartmentInfo] = useState({})
    const [departmentUsers, setDepartmentUsers] = useState([])
    const [headInfo, setHeadinfo] = useState(null)

    async function loadDepartmentInfo(){
        var res = await getDepartment(props.dept_id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setDepartmentInfo(res)
        setHeadinfo(null)

        var users = []

        for(const user of res.users){
            if(user.role == "administrator") continue;

            if(user.role == "head"){
                setHeadinfo(user)
            }
            else {
                users.push(user)
            }
        }
        setDepartmentUsers(users)
        console.log(res)
    }

    async function handleAssignment(user_id){
        var res = await assignDepartmentHead(user_id, props.dept_id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        
        if (res == "Office head successfully assigned."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: "Assigning Department Head failed",
                icon:"error"
            })
        }
    } 

    async function assignHead(user_id){
        Swal.fire({
                    title:"Assign",
                    text:"Do you want to this member as Office head?  \n(Note: Assigning this user override the current assigned head)",
                    showDenyButton: true,
                    confirmButtonText:"Assign",
                    denyButtonText:"No",
                    icon:"question",
                    customClass: {
                        actions: 'my-actions',
                        confirmButton: 'order-2',
                        denyButton: 'order-1 right-gap',
                    },
                }).then((result)=> {
                    if(result.isConfirmed){
                        handleAssignment(user_id)
                    }
                }) 
    }

    async function handleRemoval(user_id){
        var res = await removeDepartmentHead(user_id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        
        if (res == "Office head successfully removed."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: "Removal of Office Head failed",
                icon:"error"
            })
        }
    } 

    async function removeHead(user_id){
        Swal.fire({
                    title:"Assign",
                    text:"Do you want to remove this member as office head?",
                    showDenyButton: true,
                    confirmButtonText:"Remove",
                    confirmButtonColor:"red",
                    denyButtonText:"No",
                    denyButtonColor:"grey",
                    icon:"question",
                    customClass: {
                        actions: 'my-actions',
                        confirmButton: 'order-2',
                        denyButton: 'order-1 right-gap',
                    },
                }).then((result)=> {
                    if(result.isConfirmed){
                        handleRemoval(user_id)
                    }
                }) 
    }


    useEffect(()=> {
        loadDepartmentInfo()

        socket.on("department", ()=> {
            loadDepartmentInfo()
        })

    }, [])
    // assign and remove head
    //change role



    return (
        <div className="department-assign-container">
            <div className="assigned-head-container card mb-3">
                <div className="card-body d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle border flex-shrink-0" style={{ width: "60px", height: "60px", backgroundImage: `url(${(headInfo && headInfo.profile_picture_link) || '/default-profile.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        <div>
                            <h5 className="mb-0 fw-semibold">{headInfo ? `${headInfo.first_name} ${headInfo.last_name}` : "No Head Assigned"}</h5>
                            <small className="text-muted">{headInfo ? headInfo.position.name : ""}</small>
                        </div>
                    </div>

                    {headInfo ? (
                        <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-outline-danger btn-sm" onClick={() => removeHead(headInfo.id)}>
                                <span className="material-symbols-outlined align-middle">assignment_ind</span>
                                <span className="ms-1">Remove</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-muted small">There is no member currently assigned as head.</div>
                    )}
                </div>
            </div>

            <div className="other-member-container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary">Office Members</h5>
                    <small className="text-muted">{departmentUsers.length} members</small>
                </div>

                <div className="list-group">
                    {departmentInfo.users && departmentUsers.filter(u => u.account_status === 1).map(user => (
                        <div key={user.id} className="list-group-item d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle border flex-shrink-0" style={{ width: "48px", height: "48px", backgroundImage: `url(${user.profile_picture_link || '/default-profile.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                <div>
                                    <div className="fw-semibold">{user.first_name} {user.last_name}</div>
                                    <small className="text-muted">{user.position.name}</small>
                                </div>
                            </div>

                            <div>
                                <button className="btn btn-primary fw-semibold d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-pill" onClick={() => assignHead(user.id)}>
                                    <span className="material-symbols-outlined">assignment_ind</span>
                                    <span>Assign</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Empty state */}
                    {departmentUsers.filter(u => u.account_status === 1).length === 0 && (
                        <div className="list-group-item text-center text-muted py-4">
                            <span className="material-symbols-outlined fs-1 text-secondary">no_accounts</span>
                            <div>No Members Found</div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
 
export default DepartmentAssignHead