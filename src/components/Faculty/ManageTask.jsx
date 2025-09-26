import { useEffect, useState } from "react"
import { addSubTaskInIprc, getIPCR, removeSubTaskInIprc } from "../../services/pcrServices"
import { getAssignedAccountTasks } from "../../services/userService"
import { getDepartmentTasks } from "../../services/departmentService"
import Swal from "sweetalert2"
import { socket } from "../api"

function ManageTask(props){
    const [userInfo, setUserInfo] = useState({})

    const [ipcrInfo, setIPCRInfo] = useState({})
    const [batchID, setBatchID] = useState("")

    const [addedMainTasksID, setAddedMainTasksID] = useState([])
    const [allAssignedID , setAllAssignedID] = useState([])

    const [accountTasks, setAccountTasks] = useState([]) //assigned tasks to hindi pwedeng tanggalin
    const [allTasks, setAllTasks] = useState([]) //filtered na available task --main-task to

    const [tasksAndIfSubTaskExist, setTasksAndSubTaskExists] = useState({})

    //need ko malaman kung alltasks ay meron nang subtasks
    //check si alltasks base sa dept id at batch id
    //dept id to make sure na yung sub task ng main task ay pang same department lang
    //batch id to make sure kung same ipcr yung sub task na yun  


    async function loadDepartmentTasks(batch_id){
            setAllTasks([])
            setTasksAndSubTaskExists(null)
    
            var res = await getDepartmentTasks(props.dept_id).then(data => data.data)
            console.log(allAssignedID)
            var available = []
            var taste = {}
            for(const task of res){
                
                if(allAssignedID.includes(task.id)) continue;
                
                var doesSubTaskExists = false;
                
                for(const sub of task.sub_tasks){
                    if(sub.batch_id == batch_id){
                        doesSubTaskExists = true;
                        break
                    }
                }
                taste = {...taste, [task.id]: doesSubTaskExists}

                
                available.push(task)
                
            }
            setTasksAndSubTaskExists(taste)
            setAllTasks(available)       
        }

    async function loadUserTasks(){
        setAllAssignedID([])
        var res = await getAssignedAccountTasks(props.user_id).then(data => data)
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

    async function loadIPCR(){
        var res = await getIPCR(props.ipcr_id).then(data => data.data)
        setIPCRInfo(res)
    
        var sub_tasks = res.sub_tasks   
        var added_main_tasks_id = []
        setBatchID(res.batch_id)
        await loadDepartmentTasks(res.batch_id)

        for(const task of sub_tasks){
            added_main_tasks_id.push(task.main_task.id)
        }
    }

    async function handleRemoveIPCRTask(main_task_id){
        var res = await removeSubTaskInIprc(main_task_id, batchID).then(data => data.data.message)
                
        if (res == "Task was successfully removed."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: "Removal of task failed",
                icon:"error"
            })
        }
    } 
        
     async function removeIPCRTask(main_task_id){
        Swal.fire({
                title:"Warning",
                text:"Do you want to remove this task from your IPCR?",
                showDenyButton: true,
                confirmButtonText: "Remove",
                confirmButtonColor: "red",
                denyButtonText:"No",
                denyButtonColor:"grey",
                icon:"warning",
                customClass: {
                    actions: 'my-actions',
                    confirmButton: 'order-2',
                    denyButton: 'order-1 right-gap',
                },
            }).then((result)=> {
                if(result.isConfirmed){
                    handleRemoveIPCRTask(main_task_id)
                }
            }) 
    }

    async function handleAddIPCRTask(main_task_id){
        var res = await addSubTaskInIprc(main_task_id, batchID, ipcrInfo.user, ipcrInfo.id).then(data => data.data.message)
                
        if (res == "Task successfully added."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: "Adding task failed",
                icon:"error"
            })
        }
    } 
        
     async function addIPCRTask(main_task_id){
        Swal.fire({
                title:"Add Task",
                text:"Do you want to add this task to your IPCR?",
                showDenyButton: true,
                confirmButtonText: "Add",
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
                    handleAddIPCRTask(main_task_id)
                }
            }) 
    }

    useEffect(()=> {
    }, [tasksAndIfSubTaskExist])

    useEffect(()=> {
        
    }, [batchID])

    useEffect(  ()=>{
        loadIPCR()
        loadUserTasks()

        socket.on("ipcr_remove", ()=>{
            loadIPCR()
            loadUserTasks()
            console.log("MANAGE TASK LISTENED")
        })

        socket.on("ipcr_added", ()=>{
            loadIPCR()
            loadUserTasks()
            console.log("ADDED MANAGE TASK LISTENED")
        })

        return ()=> {
            socket.off("ipcr_remove")
            socket.off("ipcr_added")
            
        }

    }, [])

    //need ko tanggalin yung output at subtasks base sa main_task
    //need tanggalin yung sub task nag may same batch id  at same main task id
    return (
        <div className="modal fade" id="manage-tasks" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-xl" >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="staticBackdropLabel">Manage IPCR Task</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="choose-task-container">
                            <div className="assigned-task-container">
                                <h4>Assigned Tasks</h4>
                                    
                                <div className="assigned-tasks">
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
                                    {allTasks && allTasks.map(task => (
                                        <div className="available-task"> 
                                            <input type="checkbox" className="choose" value={task.id} id = {task.id} name="chosen" hidden disabled/>
                                            <label className="task-assigned" htmlFor={task.id}>
                                                <div className="name">
                                                    <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                                    <span>{task.name}</span>
                                                </div>
                                                <div className="manage-tasks">
                                                    <div className="category unassigned">
                                                        {task.category.name}
                                                    </div>

                                                    {tasksAndIfSubTaskExist[task.id]?
                                                    <button className="btn btn-danger" onClick={()=>{removeIPCRTask(task.id)}}>Remove</button>:
                                                    <button className="btn btn-primary " onClick={()=> {addIPCRTask(task.id)}}>Add</button>}
                                                </div>
                                            </label>
                                        </div>
                                    ))}                                        
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageTask