import { useEffect, useState } from "react";
import { objectToFormData, socket } from "../api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import { archiveCategory, getCategory, updateCategory } from "../../services/categoryService";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



import { getDepartments } from "../../services/departmentService";
import { convert_tense } from "../../services/tenseConverted";
import CategoryTask from "./CategoryTask";
import CategoryTaskAverages from "../Charts/CategoryTaskAverage";
import CategoryPerformanceCharts from "../Charts/CategoryPerformance";
import { createMainTask } from "../../services/taskService";

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
                    "time_measurement": "minute",   // default value
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
    }, [archiving])


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

        var converted_tense = await convert_tense(String(pastTense)).catch(error => {
            Swal.fire({
                title: "Error",
                text: "There is an error while processing description.",
                icon: "error"
            })

            setSubmission(false)
        })
        
        

        const newFormData = objectToFormData(formData);
        newFormData.append("past_task_desc", converted_tense)

        if(formData["task_name"] == ""){
            Swal.fire({
                title:"Error",
                text: "Fill the output title field",
                icon:"error"
            })
            setSubmission(false)
            return
        }

        if(formData["task_desc"] == ""){
            Swal.fire({
                title:"Error",
                text: "Fill the output name field",
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
            setSubmission(false)
        })
            
        if(a.data.message == "Output successfully created.") {
            Swal.fire({
                title:"Success",
                text: a.data.message,
                icon:"success"
            })
            setSubmission(false)
        }
         else {
            Swal.fire({
                title:"Error",
                text: a.data.message,
                icon:"error"
            })
            setSubmission(false)
        }

        // gawin bukas yung past tense ng description
        // gawin din yung graphs at create sub tasks sa backend
        // update ng category at nung task

        
        
        await loadCategoryTasks(props.id)
        closeModal()


    }

    const openModal = () => {
        const el = document.getElementById("add-task");
        const modal = new Modal(el);
        modal.show();
  };

    function closeModal(){
        const el = document.getElementById("add-task");
        const modal = Modal.getInstance(el);
        modal.hide();
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
            if(a.data.message == "Key Result Area successfully archived.") {
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
                title: 'Do you want to archive the Key Result Area?',
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
            if(a.data.message == "Key Result Area updated.") {
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
            <div
                className="modal fade"
                id="add-task"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="createTaskLabel"
                aria-hidden="true"
                >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content shadow-lg border-0 rounded-3">
                    
                    {/* Header */}
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-semibold" id="createTaskLabel">
                        <span className="material-symbols-outlined me-2 align-middle">add_task</span>
                        Create Output
                        </h5>
                        <button
                        type="button"
                        className="btn-close btn-close-white"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 py-3">
                        <form className="needs-validation" noValidate>
                        {/* Task Name */}
                        <div className="mb-3">
                            <label htmlFor="task_name" className="form-label fw-semibold">
                            Output Title <span className="text-danger">*</span>
                            </label>
                            <input
                            type="text"
                            id="task_name"
                            name="task_name"
                            className="form-control"
                            placeholder="e.g., Board Trustees Meeting"
                            onInput={handleDataChange}
                            required
                            />
                        </div>

                        {/* Department */}
                        <div className="mb-3">
                            <label htmlFor="department" className="form-label fw-semibold">
                            Office <span className="text-danger">*</span>
                            </label>
                            <select
                            id="department"
                            name="department"
                            className="form-select"
                            onChange={handleDataChange}
                            >
                            <option value={0}>General</option>
                            {allDepartments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                {dept.name}
                                </option>
                            ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="mb-3">
                            <label htmlFor="task_desc" className="form-label fw-semibold">
                            Output Description
                            </label>
                            <textarea
                            id="task_desc"
                            name="task_desc"
                            className="form-control"
                            placeholder="Describe the task..."
                            rows={5}
                            onInput={(e) => {
                                handleDataChange(e);
                                setPastTense(e.target.value);
                            }}
                            required
                            ></textarea>
                        </div>

                        {/* Measurement Row */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                            <label htmlFor="time_measurement" className="form-label fw-semibold">
                                Time Measurement
                            </label>
                            <select
                                id="time_measurement"
                                name="time_measurement"
                                className="form-select"
                                onChange={handleDataChange}
                            >
                                <option value="minute">Minute</option>
                                <option value="hour">Hour</option>
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="semester">Semester</option>
                                <option value="year">Year</option>
                            </select>
                            </div>

                            <div className="col-md-6 mb-3">
                            <label htmlFor="modification" className="form-label fw-semibold">
                                Modifications
                            </label>
                            <select
                                id="modification"
                                name="modification"
                                className="form-select"
                                onChange={handleDataChange}
                            >
                                <option value="correction">Correction</option>
                                <option value="revision">Revision</option>
                                <option value="error">Error</option>
                            </select>
                            </div>
                        </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between">
                        <button
                        type="button"
                        className="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                        >
                        Close
                        </button>

                        <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={handleSubmission}
                        disabled={submitting}
                        >
                        {submitting || translating ? (
                            <span className="material-symbols-outlined spin me-2 align-middle">
                            progress_activity
                            </span>
                        ) : (
                            <span className="me-2 align-middle material-symbols-outlined">add_circle</span>
                        )}
                        {submitting? "":"Create Output"}
                        </button>
                    </div>
                    </div>
                </div>
                </div>

            <div style={{display: "flex", alignItems:"center", gap: "10px", justifyContent:"flex-end"}}>
                <button className="btn btn-danger" style={{display: "flex", alignItems:"center", gap: "10px", justifyContent:"flex-end"}} onClick={handleArchive}>
                    <span className="material-symbols-outlined">archive</span>
                    <span>Archive</span>
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
                        <span>Outputs</span>
                        <div className="create-task-btn">
                            <button className="btn btn-primary"  onClick={()=> {openModal()}
                        }>
                                <span className="material-symbols-outlined">add</span>
                                <span>Create Output</span>
                            </button>
                        </div>
                    </span>
                    {categoryTasks.length == 0? <div className="empty-tasks">There is no existing outputs.</div>:""}
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