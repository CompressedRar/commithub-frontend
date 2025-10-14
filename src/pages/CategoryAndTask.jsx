import { useEffect, useState } from "react";
import "../assets/styles/CategoryAndTask.css"
import { getCategories, registerCategory } from "../services/categoryService";
import { objectToFormData } from "../components/api";
import CategoryTasks from "../components/CategoryAndTaskComponents/CategoryTasks";

import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import TaskInfo from "../components/CategoryAndTaskComponents/TaskInfo";
function CategoryAndTask(){
    const [allCategory, setAllCategory] = useState([])
    const [submitting, setSubmission] = useState(false)
    const [formData, setFormData] = useState({"category_name": ""})

    const [pageNumber, setPageNumber] = useState(1)
    const [firstCategoryID, setFirst] = useState(1)

    const [currentTaskID, setCurrentTaskID] = useState()

    

    async function loadCategories(){
        var res = await getCategories().then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setAllCategory(res)
        
        return res
    }

    function reloadAllCategories(){
        loadCategories().then(data => {
            if(data.length == 0) return;

            setFirst(data[0].id)
            console.log(data[0].id)
        })
    }

    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})        
    }

    const handleSubmission = async () =>{
        var converted_data = objectToFormData(formData)
        setSubmission(true)

        var res = await registerCategory(converted_data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        if(res.data.message == "Category created.") {
                    Swal.fire({
                        title:"Success",
                        text: res.data.message,
                        icon:"success"
                    })
                }
                else {
                    Swal.fire({
                        title:"Error",
                        text: res.data.message,
                        icon:"error"
                    })
                }
        const modalEl = document.getElementById("add-category");
            const modal = Modal.getOrCreateInstance(modalEl);

            modal.hide();

            // Cleanup leftover backdrop if any
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            document.body.classList.remove("modal-open");
            document.body.style.overflow = ""; // reset scroll lock
        setSubmission(false)
        loadCategories()
    }

    useEffect(()=>{
        console.log(formData)
    }, [formData])

    useEffect(()=>{
        loadCategories().then(data => {
            if(data.length == 0) return;

            setFirst(data[0].id)
            console.log(data[0].id)
        })
    }, [])

    return (
        <div className="category-task-container">
            <div className="modal fade" id="add-category" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Create Category</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="textboxes">
                                <label htmlFor="category_name">Category Name <span className="required">*</span></label>
                                <input type="category_name" id="category_name" name="category_name" placeholder="Eg. Research Services" onInput={handleDataChange} required/>
                            </div>
                            
                            
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmission}>
                                 {submitting ?<span className="material-symbols-outlined loading">progress_activity</span> : <span>Create Category</span>}
                            </button>
                           
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="view-task-info" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-xl" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Output Information</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <TaskInfo id = {currentTaskID} key = {currentTaskID} backAfterArchive = {()=> {setFirst(firstCategoryID); setPageNumber(1)}} backToPage = {()=>{setPageNumber(1)}}></TaskInfo>                                                        
                        </div>
                        
                    </div>
                </div>
            </div>

            <div className="all-categories-container">
                <div className="sidebar-title">
                    Categories
                </div>
                <div className="add-category-container">
                    <button className="add-category btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-category">
                        <span className="material-symbols-outlined">add</span>
                        <span>Add Category</span>
                    </button>
                </div>
                <div className = "all-categories">
                    
                    {allCategory.map(category => (
                        <div className="department" onClick={()=>{setFirst(category.id)}}>
                            <span className="material-symbols-outlined"></span>
                            <span>{category.name}</span>
                        </div>    
                    ))}

                </div>  
            </div>

            <CategoryTasks id = {firstCategoryID} key={firstCategoryID} changeTaskID = {(id)=>{setCurrentTaskID(id); setPageNumber(2)}} reloadAll = {()=>{reloadAllCategories()}} reloadCategory = {(id)=>{setFirst(id);}}></CategoryTasks>        
        </div>
    )
}

export default CategoryAndTask