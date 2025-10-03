import { useEffect, useState } from "react";
import "../assets/styles/Department.css"
import { getDepartments, registerDepartment } from "../services/departmentService";
import DepartmentInfo from "../components/DepartmentComponents/DepartmentInfo";
import AllDepartmentMember from "../components/DepartmentComponents/AllDepartmentMember";
import { objectToFormData } from "../components/api";
import Swal from "sweetalert2";


function Department(){
    const [departments, setDepartments] = useState([])
    const [currentDepartment, setCurrentDepartment] = useState(null)
    const [formData, setFormData] = useState({"department_name": "", "icon": ""})
    const [submitting, setSubmission] = useState(false)

    

    async function loadAllDepartments(){
        var res = await getDepartments().then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        setDepartments(res)
        return res
    }

    async function loadFirstDepartment() {
        loadAllDepartments().then(res => {
            console.log("loading first")
            if (res.length > 0) setCurrentDepartment(res[0].id);
        }).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        });
    }
    
    function loadAnotherDepartment(id){
        console.log("Loading another" + id)
        setCurrentDepartment(id)
    }

    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})        
    }

    const handleSubmission = async () => {
        const newFormData = objectToFormData(formData);
        setSubmission(true)
        var a = await registerDepartment(newFormData).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        
        if(a.data.message == "Department successfully created.") {
            Swal.fire({
                title:"Success",
                text: a.data.message,
                icon:"success"
            })
        }
        setSubmission(false)
        loadAllDepartments()
    }

    useEffect(()=>{
        if(departments.length == 0) return;
        //loadFirstDepartment()
    }, [departments])

    useEffect(()=>{
        loadFirstDepartment()
    },[])

    useEffect(()=>{
        console.log(formData)
    },[formData])

    return(

        <div className="department-container">
            <div className="modal fade" id="add-department" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Create Department</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="textboxes">
                                <label htmlFor="last_name">Department Name <span className="required">*</span></label>
                                <input type="department_name" id="department_name" name="department_name" onInput={handleDataChange} placeholder="Eg. Computing Studies"  required/>
                            </div>
                            <div className="textboxes" style={{display:"none"}}>
                                <label htmlFor="department_icon">Choose Icon <span className="required">*</span></label>
                                <div className="icons-container">
                                    <input type="radio" name = "icon" id = "cs" hidden onChange={handleDataChange} value = "computer"/>
                                    <label htmlFor="cs" className="icon">
                                        <span className="material-symbols-outlined">computer</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "ed" hidden onChange={handleDataChange} value = "auto_stories"/>
                                    <label htmlFor="ed" className="icon">
                                        <span className="material-symbols-outlined">auto_stories</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "hm" hidden onChange={handleDataChange} value = "flights_and_hotels"/>
                                    <label htmlFor="hm" className="icon">
                                        <span className="material-symbols-outlined">flights_and_hotels</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "reg" hidden onChange={handleDataChange} value = "checkbook"/>
                                     <label htmlFor="reg" className="icon">
                                        <span className="material-symbols-outlined">checkbook</span>
                                    </label>
                                    
                                    <input type="radio" name = "icon" id = "acc" hidden onChange={handleDataChange} value = "account_balance"/>
                                    <label htmlFor="acc" className="icon">
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </label>
                                    
                                    <input type="radio" name = "icon" id = "lib" hidden onChange={handleDataChange} value = "local_library"/>
                                    <label htmlFor="lib" className="icon">
                                        <span className="material-symbols-outlined">local_library</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "nc" hidden onChange={handleDataChange} value = "school"/>
                                    <label htmlFor="nc" className="icon">
                                        <span className="material-symbols-outlined">school</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "psy" hidden onChange={handleDataChange} value = "psychology"/>
                                    <label htmlFor="psy" className="icon">
                                        <span className="material-symbols-outlined">psychology</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "off" hidden onChange={handleDataChange} value = "supervisor_account"/>
                                    <label htmlFor="off" className="icon">
                                        <span className="material-symbols-outlined">supervisor_account</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "dom" hidden onChange={handleDataChange} value = "domain"/>
                                    <label htmlFor="dom" className="icon">
                                        <span className="material-symbols-outlined">domain</span>
                                    </label>
                                    
                                </div>
                            </div>
                            
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmission}>
                                 {submitting ?<span className="material-symbols-outlined loading">progress_activity</span> : <span>Create Department</span>}
                            </button>
                           
                        </div>
                    </div>
                </div>
            </div>

            <div className="all-departments-container">
                <div className="sidebar-title" >
                    Departments
                </div>
                <div className="add-container">
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-department">
                        <span className="material-symbols-outlined">add</span>
                        <span>Create Department</span>
                    </button>
                </div>
                <div className = "all-departments">
                    {departments.map(dept => (
                        <AllDepartmentMember dept={dept} key={dept.id} onClick={()=>{loadAnotherDepartment(dept.id)}} ></AllDepartmentMember>
                    ))}

                </div>  
            </div>
            
            {currentDepartment && <DepartmentInfo key = {currentDepartment} id = {currentDepartment} loadDepts = {()=>{loadAllDepartments()}} firstLoad = {()=>{loadFirstDepartment()}}></DepartmentInfo>}
        </div>
    )
}

export default Department