import { useState, useEffect } from "react"
import { getCategoriesWithTasks } from "../../services/categoryService"
import { assignDepartment, getDepartment, removeTask } from "../../services/departmentService"
import Swal from "sweetalert2"
import { socket } from "../api"



function AddDepartmentTask(props) {
    const [allCategories, setAllCategories] = useState([])
    const [departmentInfo, setDepartmentInfo] = useState({})
    const [archiving, setArchiving] = useState(false)

    async function loadAllCategories(){
        var res = await getCategoriesWithTasks().then(data => data.data)
        setAllCategories(res)
        console.log(res)
    }

    async function loadDepartmentInfo(){
        var res = await getDepartment(props.dept_id).then(data => data.data)
        setDepartmentInfo(res)
        console.log(res)
    }

    const Remove = async (task_id) => {
            var res = await removeTask(task_id).then(data => data.data.message)
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
        const handleRemove = async (task_id) => {
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
                                Remove(task_id)
                            } else if (result.isDenied) {
                                   
                            }
                        })
        
            setArchiving(false)
        }

    const assignTask = async (task_id) => {
            var res = await assignDepartment(task_id, props.dept_id).then(data => data.data.message)
            
            if(res == "Task successfully assigned.") {
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
    const handleAssign = async (task_id) => {
        Swal.fire({
            title: 'Do you want to assign this task to this department?',
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
                            assignTask(task_id)
                        } else if (result.isDenied) {
                                   
                        }
                    })
        
            setArchiving(false)
        }

    useEffect(()=>{
        loadAllCategories()
        loadDepartmentInfo()

        socket.on("department_assigned", ()=>{
            loadAllCategories()
        })

        return () => {
            socket.off("department_assigned");
        }
    }, [])
    
    return (
        <div className="add-department-task-container">
            
            <div className="tasks-container">
                {allCategories.map(category => (
                    
                    <div className="category">
                        <div className="category-name">
                            <span>{category.name}</span>                        
                        </div>
                        <div className="category-task-container">
                            {category.main_tasks.map(tasks => (
                                tasks.status?
                                <div className="category-task" onClick={()=>{
                                    
                                    if(tasks.department == departmentInfo.name){
                                        handleRemove(tasks.id)
                                    }
                                    else {
                                        handleAssign(tasks.id)
                                    }
                                }}>
                                    <div className="task-name">
                                        <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                        <span>{tasks.name}</span>
                                    </div>
                                    <div className={tasks.department == "General"? "department-assigned general": "department-assigned"}>
                                        {tasks.department}
                                    </div>
                                </div>
                                :""
                            ))}
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AddDepartmentTask