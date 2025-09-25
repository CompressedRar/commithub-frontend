import { useEffect, useState } from "react"
import { assignDepartmentHead, getDepartment, removeDepartmentHead } from "../../services/departmentService"
import Swal from "sweetalert2"
import { socket } from "../api"

function DepartmentAssignHead(props){
    const [departmentInfo, setDepartmentInfo] = useState({})
    const [departmentUsers, setDepartmentUsers] = useState([])
    const [headInfo, setHeadinfo] = useState(null)

    async function loadDepartmentInfo(){
        var res = await getDepartment(props.dept_id).then(data => data.data)
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
        var res = await assignDepartmentHead(user_id, props.dept_id).then(data => data.data.message)
        
        if (res == "Department head successfully assigned."){
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
                    text:"Do you want to this member as department head?  \n(Note: Assigning this user override the current assigned head)",
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
        var res = await removeDepartmentHead(user_id).then(data => data.data.message)
        
        if (res == "Department head successfully removed."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: "Removal of Department Head failed",
                icon:"error"
            })
        }
    } 

    async function removeHead(user_id){
        Swal.fire({
                    title:"Assign",
                    text:"Do you want to remove this member as department head?",
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

        return () => socket.off("department")
    }, [])
    // assign and remove head
    //change role



    return (
        <div className="department-assign-container">
            <div className="assigned-head-container">
                <h4>
                    Current Department Head
                </h4>
                {headInfo ?<div className="member assigned-head">
                    <div className="member-info">
                        <div className="user-image" style={{backgroundImage: `url('${headInfo.profile_picture_link}')`}}>.</div>
                        <div className="user-info">
                            <span className="name">{headInfo.first_name + " " + headInfo.last_name}</span>
                            <span className="position">{headInfo.position.name}</span>
                        </div>
                    </div>
                    <button className="already-assigned" style={{backgroundImage:"linear-gradient(to left,rgb(255, 69, 69), rgb(255, 136, 0), rgb(240, 128, 0))"}} onClick={()=>{removeHead(headInfo.id)}}>
                        <span className="material-symbols-outlined">assignment_ind</span>
                        <span>REMOVE</span>
                    </button>
                </div> : 
                <div className="empty-head">There is no member currently assigned as head.</div>}
            </div>

            <div className="other-member-container">
                <h4>
                    Department Members
                </h4>
                {departmentInfo.users && departmentUsers.map(user => (
                    user.account_status == 1? <div className="member">
                        <div className="member-info">
                            <div className="user-image" style={{backgroundImage: `url('${user.profile_picture_link}')`}}>.</div>
                            <div className="user-info">
                                <span className="name">{user.first_name + " " + user.last_name}</span>
                                <span className="position">{user.position.name}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={()=>{assignHead(user.id)}}>
                            <span className="material-symbols-outlined">assignment_ind</span>
                            <span>Assign</span>
                        </button>
                    </div>: ""
                ))}
            </div>


        </div>
    )
}
 
export default DepartmentAssignHead