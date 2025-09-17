import { useEffect, useState } from "react";
import SubmissionsChart from "../Barchart";
import { objectToFormData } from "../api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import { archiveCategory, getCategory } from "../../services/categoryService";

import { getDepartments } from "../../services/departmentService";
import { createMainTask } from "../../services/taskService";

function CategoryTasks(props){

    const [categoryTasks, setCategoryTasks] = useState({})
    const [allDepartments, setAllDepartments] = useState([])
    
    const [formData, setFormData] = useState({"category_name": ""})

    const [submitting, setSubmission] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const [open, setOpen] = useState(false)

    async function loadDepartments(){
        var res = await getDepartments().then(data => data.data)
        setAllDepartments(res)
        console.log(res)
    }

    async function loadCategoryTasks(id){
        var res = await getCategory(id).then(data => data.data)
        console.log(res.main_tasks)
        await setCategoryTasks(res.main_tasks)
        setFormData({"task_name": "",
                    "department": "0",
                    "task_desc": "",
                    "time_measurement": "day",   // default value
                    "modification": "correction", // default value
                    "accomplishment_editable": 0,
                    "time_editable": 0,
                    "modification_editable": 0,
                    "id": id})
        
    }

    
    
    useEffect(()=>{
        loadCategoryTasks(props.id)
        loadDepartments()
    },[props.id])

    useEffect(()=>{
    }, [formData])


    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})        
    }

    const handleSwitchChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.checked?1:0})        
    }


    
    const handleSubmission = async () => {
        const newFormData = objectToFormData(formData);

        if(formData["task_name"] == ""){
            Swal.fire({
                title:"Error",
                text: "Fill the task name field",
                icon:"error"
            })
            setSubmission(false)
            return
        }


        setSubmission(true)
        var a = await createMainTask(newFormData)
            
        if(a.data.message == "Task successfully created.") {
            Swal.fire({
                title:"Success",
                text: a.data.message,
                icon:"success"
            })
        }
         else {
            Swal.fire({
                title:"Error",
                text: a.data.message,
                icon:"error"
            })
        }

        // gawin bukas yung past tense ng description
        // gawin din yung graphs at create sub tasks sa backend
        //update delete ng category at nung task

        
        await loadCategoryTasks(props.id)

        const modalEl = document.getElementById("add-task");
        const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
        modal.hide();

        setSubmission(false)
    }

    const handleArch = async () => {
            var a = await archiveCategory(props.id)
            console.log(a)
            if(a.data.message == "Category successfully archived.") {
                Swal.fire({
                    title:"Success",
                    text: a.data.message,
                    icon:"success"
                })
                props.reloadAll()
            }
            else {
                Swal.fire({
                    title:"Error",
                    text: a.data.message,
                    icon:"error"
                })
            }
            
        }

    const handleArchive = async ()=>{
            
            Swal.fire({
                title: 'Do you want to archive the category?',
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
        }

    

    return (
        <div className="category-main-container">
            <div className="modal fade" id="add-task" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{width: "", maxWidth: "60%"}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Create Task</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="textboxes">
                                <label htmlFor="task_name">Task Name <span className="required">*</span></label>
                                <input type="task_name" id="task_name" name="task_name" placeholder="Eg. Board Trustees Meeting" onInput={handleDataChange} required/>
                            </div>
                            <div className="textboxes">
                                <label htmlFor="department">Department <span className="required">*</span></label>
                                <select name="department" id="department" onChange={handleDataChange}>
                                    {allDepartments.map(dept => (
                                        <option value = {dept.id} key={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="textboxes">
                                <label htmlFor="task_desc" className="editables">
                                    <span>Task Description</span>
                                    <div class="form-check form-switch custom-switch">
                                        <input class="form-check-input" type="checkbox" id="accomplishment_editable" name ="accomplishment_editable" onChange={handleSwitchChange} />
                                        <label class="form-check-label" htmlFor="accomplishment_editable">Editable</label>
                                    </div>
                                </label>
                                <textarea type="task_desc" id="task_desc" name="task_desc" placeholder="Describe the task." rows={5} onInput={handleDataChange} required/>
                            </div>
                            
                            <div className="task-measurement-container">
                                    <div className="textboxes">
                                        <label htmlFor="time_measurement" className="editables">
                                            <span>Time Measurement</span>
                                            <div class="form-check form-switch custom-switch">
                                                <input class="form-check-input" type="checkbox" id="time_editable" name ="time_editable" onChange={handleSwitchChange} />
                                                <label class="form-check-label" htmlFor="time_editable">Editable</label>
                                            </div>
                                        </label>
                                        <select name="time_measurement" id="time_measurement" onChange={handleDataChange}>
                                            <option value="minute">Minute</option>
                                            <option value="hour">Hour</option>
                                            <option value="day">Day</option>
                                            <option value="week">Week</option>
                                            <option value="month">Month</option>
                                            <option value="semester">Semester</option>
                                            <option value="year">Year</option>
                                        </select>
                                    </div>

                                    <div className="textboxes">
                                        <label htmlFor="modification" className="editables">
                                            <span>Modifications</span>
                                            <div class="form-check form-switch custom-switch">
                                                <input class="form-check-input" type="checkbox" id="modification_editable" name ="modification_editable" onChange={handleSwitchChange} />
                                                <label class="form-check-label" htmlFor="modification_editable">Editable</label>
                                            </div>
                                        </label>
                                        <select name="modification" id="modification" onChange={handleDataChange}>
                                            <option value="correction">Correction</option>
                                            <option value="revision">Revision</option>
                                            <option value="error">Error</option>
                                        </select>
                                    </div>
                            </div>
                            
                            
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmission}>
                                 {submitting ?<span className="material-symbols-outlined loading">progress_activity</span> : <span>Create Task</span>}
                            </button>
                           
                        </div>
                    </div>
                </div>
            
            </div>
            <div style={{display: "flex", alignItems:"center", gap: "10px", justifyContent:"flex-end"}}>
                <button className="btn btn-danger" style={{display: "flex", alignItems:"center", gap: "10px", justifyContent:"flex-end"}} onClick={handleArchive}>
                    <span className="material-symbols-outlined">archive</span>
                    <span>Archive Category</span>
                </button>  
            </div>
                <div className="tasks-average-rating">
                    <span className="graph-title">Average Rating per Task</span>
                    <SubmissionsChart></SubmissionsChart>
                </div>
                
                <div className="all-tasks-container">
                    <span className="all-tasks-title">   
                        <span>Tasks</span>
                        <div className="create-task-btn">
                            <button className="btn btn-primary"  data-bs-toggle="modal" data-bs-target="#add-task">
                                <span className="material-symbols-outlined">add</span>
                                <span>Create Task</span>
                            </button>
                        </div>
                    </span>
                    {categoryTasks.length == 0? <div className="empty-tasks">There is no existing tasks.</div>:""}
                    <div className="all-tasks">
                    
                    {Array.isArray(categoryTasks) && categoryTasks.map(category =>(
                        
                        category.status == 1?<div className="task" key={category.id} onClick={()=>{props.changeTaskID(category.id)}}>
                            <div className="department-name" style={category.department == "General"? {backgroundImage: "linear-gradient(to left, rgb(143, 143, 250), var(--lighter-primary-color), var(--primary-color))"}: {backgroundImage: "linear-gradient(to left,var(--secondary-color), rgb(255, 136, 0), rgb(255, 136, 0))"}}>
                                {category.department}
                            </div>
                            <div className="task-title">
                                <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                <span>{category.name}</span>
                            </div>
                            
                            <div className="task-description">
                                <div className="title">Description</div>
                                <div className="description">{category.target_accomplishment}</div>	
                            </div>

                            <div className="tasks-measurements">
                                <div className="time-measurement">
                                    <div className="title">Time Measurement</div>
                                    <div className="description">{category.time_measurement.charAt(0).toUpperCase() + category.time_measurement.slice(1)}</div>
                                </div>
                                <div className="modification-measurement">
                                    <div className="title">Modification</div>
                                    <div className="description">{category.modifications.charAt(0).toUpperCase() + category.modifications.slice(1)}</div>
                                </div>
                            </div>

                            <div className="assigned-users">
                                <div className="title">Assigned Users</div>
                                <div className="container">
                                    <div className="assigned-pic">.</div>
                                    <div className="assigned-pic">.</div>
                                    <div className="assigned-pic">.</div>
                                    <div className="assigned-pic">.</div>
                                    <div className="assigned-pic">.</div>
                                    <div className="assigned-pic">.</div>
                                </div>
                            </div>
                        </div>:""
                    ))}
                        
                        
                    </div>
                </div>

            </div>
    )
}

export default CategoryTasks