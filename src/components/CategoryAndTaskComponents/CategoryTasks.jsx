import { useEffect, useState } from "react";
import { objectToFormData, socket } from "../api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import { archiveCategory, getCategory, updateCategory } from "../../services/categoryService";


import { getDepartments } from "../../services/departmentService";
import { createMainTask } from "../../services/taskService";
import { convert_tense } from "../../services/tenseConverted";
import CategoryTask from "./CategoryTask";
import CategoryTaskAverages from "../Charts/CategoryTaskAverage";
import CategoryPerformanceCharts from "../Charts/CategoryPerformance";

function CategoryTasks(props){

    const [categoryTasks, setCategoryTasks] = useState({})
    const [allDepartments, setAllDepartments] = useState([])
    const [categoryInfo, setCategoryInfo] = useState({})
    
    const [formData, setFormData] = useState({"category_name": "", "id": props.id})

    const [submitting, setSubmission] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const [open, setOpen] = useState(false)
    const [titleEditable, setTitleEditable] = useState(false)
    

    const [pastTense , setPastTense] = useState("")
    const [translating, setTranslating] = useState(false)

    async function loadDepartments(){
        var res = await getDepartments().then(data => data.data)
        setAllDepartments(res)
        console.log(res)
    }

    async function loadCategoryTasks(id){
        var res = await getCategory(id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log(res.main_tasks)
        setCategoryInfo(res)
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

        socket.on("category", ()=> {
            loadCategoryTasks(props.id)
            loadDepartments()
        })
    },[props.id])

    useEffect(()=>{
        console.log(formData)
    }, [formData])

    useEffect(()=> {
        if(pastTense == "") {
            return 
        }
        const debounce = setTimeout(async ()=>{
            setTranslating(true)
            var converted_tense = await convert_tense(String(pastTense)).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: "There is an error while processing description.",
                icon: "error"
            })
        })
            setFormData({...formData, ["past_task_desc"]: converted_tense})       
            console.log(converted_tense)
            setTranslating(false)
        }, 500)
        
        return ()=> clearTimeout(debounce)
    }, [pastTense])


    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})        
    }

    const handleTitleChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.textContent})        
    }

    const handleSwitchChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.checked?1:0})        
    }


    
    const handleSubmission = async () => {
        setSubmission(true)
        
        

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

        console.log(newFormData)


        setSubmission(true)
        var a = await createMainTask(newFormData).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            
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
        // update ng category at nung task

        
        await loadCategoryTasks(props.id)

        const modalEl = document.getElementById("add-task");
            const modal = Modal.getOrCreateInstance(modalEl);

            modal.hide();

            // Cleanup leftover backdrop if any
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            document.body.classList.remove("modal-open");
            document.body.style.overflow = ""; // reset scroll lock

        setSubmission(false)
    }

    const handleArch = async () => {
            var a = await archiveCategory(props.id).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
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

    const handleUpdate = async () => {
            var a = await updateCategory(formData).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            console.log(a)
            if(a.data.message == "Category updated.") {
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
                                    <option value={0}>General</option>
                                    {allDepartments.map(dept => (
                                        <option value = {dept.id} key={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="textboxes">
                                <label htmlFor="task_desc" className="editables">
                                    <span>Task Description</span>
                                    
                                </label>
                                <textarea type="task_desc" id="task_desc" name="task_desc" placeholder="Describe the task." rows={5} onInput={(e)=> {
                                    handleDataChange(e)
                                    setPastTense(e.target.value)
                                }} required/>
                            </div>
                            
                            <div className="task-measurement-container">
                                    <div className="textboxes">
                                        <label htmlFor="time_measurement" className="editables">
                                            <span>Time Measurement</span>
                                            
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
                            <button type="button" className="btn btn-primary" onClick={handleSubmission} disabled = {translating}>
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
                    <div className="category-title">
                        <h2 contentEditable ={titleEditable} id = "title" onInput={handleTitleChange} style={{fontSize: "2.5rem", fontWeight:"700"}}>{categoryInfo && categoryInfo["name"]}</h2>
                        <span className="material-symbols-outlined" onClick={()=>{
                                setTitleEditable(!titleEditable);
                                console.log(titleEditable)
                                if (titleEditable) handleUpdate();
                                }}>edit</span>
                    </div>
                    <CategoryTaskAverages cat_id = {props.id}></CategoryTaskAverages>
                    <CategoryPerformanceCharts categoryId={props.id}></CategoryPerformanceCharts>
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
                        
                        category.status == 1?
                        <CategoryTask key = {category.id} category = {category} onClick = {()=>{
                            props.changeTaskID(category.id)
                        }}></CategoryTask>:""
                    ))}
                        
                        
                    </div>
                </div>

            </div>
    )
}

export default CategoryTasks