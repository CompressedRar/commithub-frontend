import { useEffect, useState } from "react"
import { getDepartment, getDepartmentTasks, getGeneralTasks } from "../../services/departmentService"
import { jwtDecode } from "jwt-decode"
import { createUserTasks, getAccountInfo, getAccountTasks, getAssignedAccountTasks } from "../../services/userService"
import Swal from "sweetalert2"
import { all } from "axios"
import { socket } from "../api"
import { Modal } from "bootstrap"
import IPCR from "./IPCR"



function IPCRContainer({switchPage}) {
    const [userinfo, setuserInfo] = useState({})
    const [departmentInfo, setDepartmentInfo] = useState([])
    const [allTasks, setAllTasks] = useState([])
    const [accountTasks, setAccountTasks] = useState([])
    const [allAssignedID , setAllAssignedID] = useState([])
    const [checkedArray , setChecked] = useState([])
    const [allIPCR, setAllIPCR] = useState([])

    

    async function loadUserTasks(user_id){
        setAllAssignedID([])
        var res = await getAssignedAccountTasks(user_id).then(data => data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        var ids = []

        var all_assigned_tasks = []
        for(const task of res.data.assigned_tasks){
            if(task.is_assigned){
                all_assigned_tasks.push(task.tasks)
                ids.push(task.tasks.id)
            }
        }
        
        setAccountTasks(all_assigned_tasks)
        setAllAssignedID(ids)
    }

    async function loadUserInfo() {
        if (Object.keys(localStorage).includes("token")){
            var token = localStorage.getItem("token")
            var payload = jwtDecode(token)
            
            var res = await getAccountInfo(payload.id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

            setuserInfo(res)
            setAllIPCR(res.ipcrs)
            console.log(res.ipcrs)
        }
    }

    async function loadDepartmenInfo(id){
        setAllTasks([])
        
        var res = await getDepartment(id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log(res)
        setDepartmentInfo(res)       
    }

    async function loadAllTasks(id){
        setAllTasks([])

        var res = await getDepartmentTasks(id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        var available = []

        for(const task of res){
            
            if(allAssignedID.includes(task.id)) continue;
            //console.log(allAssignedID)
            available.push(task)
            //setAllTasks([...allTasks, task])
        }

        var all_general = await getGeneralTasks().then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        for(const task of all_general){
            
            if(allAssignedID.includes(task.id)) continue;
            available.push(task)
        }


        setAllTasks(available)       
    }

    function getAllCheckedTasks(){
        var all = document.getElementsByName("chosen")
        var checkedID = [...allAssignedID]

        for(const taskEl of all){
            if (taskEl.checked) checkedID.push(parseInt(taskEl.id))
        }

        setChecked(checkedID)
    }

    async function createTasks() {
        console.log("all main task id:",checkedArray)

        if(checkedArray.length == 0){
            Swal.fire({
                title:"Empty Task",
                text:"You must have atleast one task for IPCR."
            })
        }
        var res = await createUserTasks(userinfo.id, checkedArray).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        if(res == "IPCR successfully created"){
            Swal.fire({
                title:"Success",
                text:res,
                icon:"success"
            })
        }

        else {
            Swal.fire({
                title:"Error",
                text: "There is an error while creating IPCR",
                icon:"error"
            })
        }

        const modalEl = document.getElementById("create-ipcr");
        const modal = Modal.getOrCreateInstance(modalEl);

        modal.hide();

            // Cleanup leftover backdrop if any
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = ""; // reset scroll lock
    }

    useEffect(()=> {
            
    },[accountTasks])

    useEffect(()=> {
        if(userinfo.department) {
            loadAllTasks(userinfo.department.id)
            loadDepartmenInfo(userinfo.department.id)

        }
       
    },[allAssignedID])

    useEffect(()=> {
        if(userinfo.id) {
            loadUserTasks(userinfo.id)
            
        }
        
    }, [userinfo])

    useEffect(()=> {
        loadUserInfo()

        socket.on("ipcr_create", ()=>{
            loadUserInfo()
        })

    }, [])

    return(

        <div className="ipcr-container">
            <div className="modal fade" id="create-ipcr" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-xl" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title" id="staticBackdropLabel">Create IPCR</h3>
                                <span>To create IPCR, choose tasks available to your department. <strong>Assigned task</strong> can only be removed by department head.</span>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">                            
                            <div className="choose-task-container">
                                <div className="assigned-task-container">
                                    <h4>Assigned Tasks</h4>
                                    
                                    <div className="assigned-tasks">
                                    {accountTasks.length == 0 ?
                                    <div className="empty">There is no tasks assigned for you.</div>:""}
                                    {accountTasks && accountTasks.map(task => (
                                        <div className="task-assigned">
                                            <div className="name">
                                                <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                                <span>{task.name}</span>
                                            </div>
                                            <div className="category">
                                                {task.category.name}
                                            </div>
                                        </div>
                                    ))}
                                        

                                    </div>
                                </div>

                                <div className="assigned-task-container">
                                    <h4>Available Tasks</h4>
                                    <div className="assigned-tasks">
                                        {allTasks.length == 0 ?
                                    <div className="empty">There is no tasks available yet.</div>:""}
                                        {allTasks && allTasks.map(task => (
                                            <div className="available-task"> 
                                                <input type="checkbox" className="choose" value={task.id} id = {task.id} name="chosen" onChange={()=>{getAllCheckedTasks()}} hidden/>
                                                <label className="task-assigned" htmlFor={task.id}>
                                                    <div className="name">
                                                        <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                                        <span>{task.name}</span>
                                                    </div>
                                                    <div className="category unassigned">
                                                        {task.category.name}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}                                        
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        <div className="modal-footer">
                            <div className="modal-choices">
                                <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button className="btn btn-primary" onClick={()=>{
                                    createTasks()
                                }}>Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ipcr-list">
                <div className="ipcr-options-container">
                    <div className="options-header">
                        <span className="title">Individual Performance Commitment Forms</span>
                        <span className="content">This is where you create your IPCR. Click the 'Create IPCR' button to get started.</span>
                    </div>
                    <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#create-ipcr">
                        <span className="material-symbols-outlined">add_notes</span>
                        <span>Create IPCR</span>
                    </button>
                </div>
                <div className="all-ipcr-container">
                    {allIPCR && allIPCR.map(ipcr => (
                        ipcr.status == 1?<IPCR ipcr={ipcr} onClick = {()=>{switchPage(ipcr.id, userinfo.department.id)}}></IPCR>: ""
                    ))}
                    
                </div>
                {allIPCR.length != 0?"":
                    <div className="empty-symbols">
                        <span className="material-symbols-outlined">file_copy_off</span>    
                        <span className="desc">No IPCRs Found</span>
                    </div>} 

            </div>
            <div className="department-members" style={{display:"none"}}>
                <h3>Department Members</h3>
                <div className="member-container">
                    {departmentInfo.users && departmentInfo.users.map(user => (
                        <div className="member"> 
                            <div className="image" style={{backgroundImage: `url('${user.profile_picture_link}`}}>.</div>
                            <div className="desc">
                                <span className="name">{user.first_name + " " + user.last_name}</span>
                                <span className="position">{user.position.name}</span>
                            </div>
                        </div>
                    ))}
                    
                </div>  
            </div>
        </div>
    )
}

export default IPCRContainer