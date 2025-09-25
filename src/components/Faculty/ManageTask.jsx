import { useEffect, useState } from "react"
import { getIPCR } from "../../services/pcrServices"
import { getAssignedAccountTasks } from "../../services/userService"
import { getDepartmentTasks } from "../../services/departmentService"

function ManageTask(props){
    const [userInfo, setUserInfo] = useState({})

    const [ipcrInfo, setIPCRInfo] = useState({})
    const [batchID, setBatchID] = useState("")

    const [addedMainTasksID, setAddedMainTasksID] = useState([])
    const [allAssignedID , setAllAssignedID] = useState([])

    const [accountTasks, setAccountTasks] = useState([]) //assigned tasks to hindi pwedeng tanggalin
    const [allTasks, setAllTasks] = useState([]) //filtered na available task

    const [tasksAndIfSubTaskExist, setTasksAndSubTaskExists] = useState({})
    //need ko malaman kung alltasks ay meron nang subtasks
    //check si alltasks base sa dept id at batch id
    //dept id to make sure na yung sub task ng main task ay pang same department lang
    //batch id to make sure kung same ipcr yung sub task na yun  


    async function loadDepartmentTasks(){
            setAllTasks([])
    
            var res = await getDepartmentTasks(props.dept_id).then(data => data.data)
            console.log(allAssignedID)
            var available = []
            var taste = {}
            for(const task of res){
                
                if(allAssignedID.includes(task.id)) continue;
                
                var doesSubTaskExists = false;
                
                for(const sub of task.sub_tasks){
                    console.log(batchID, sub.batch_id)
                    if(sub.batch_id == batchID){
                        doesSubTaskExists = true;
                        break
                    }
                }
                console.log(doesSubTaskExists)
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
        console.log(all_assigned_tasks)
            
        setAccountTasks(all_assigned_tasks)
        setAllAssignedID(ids)
    }


    async function loadIPCR(){
        var res = await getIPCR(props.ipcr_id).then(data => data.data)
        setIPCRInfo(res)
        console.log(res)
    
        var sub_tasks = res.sub_tasks
            
        var added_main_tasks_id = []
        for(const task of sub_tasks){
            setBatchID(task.batch_id)
            added_main_tasks_id.push(task.main_task.id)
        }
    }

    useEffect(()=> {
        console.log(tasksAndIfSubTaskExist)
    }, [tasksAndIfSubTaskExist])

    useEffect(()=> {
        if(batchID != ""){
            loadDepartmentTasks()
        }
    }, [batchID])

    useEffect(()=>{
        loadIPCR()
        loadUserTasks()
        

    }, [])
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
                                                    <button className="btn btn-danger">Remove</button>:
                                                     <button className="btn btn-primary">Add</button>}
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