import { useEffect, useState } from "react";
import { updateDepartment, getDepartment, archiveDepartment } from "../../services/departmentService";
import DepartmentMemberTable from "./DepartmentMemberTable";
import { objectToFormData, socket } from "../api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import DepartmentTasksTable from "./DepartmentTasksTable";
import DepartmentAssignHead from "./DepartmentAssignHead";
import PerformanceReviews from "./PerformanceReview";
import CreateOPCRModal from "./CreateOPCRModal";
import GeneralTasksTable from "./GeneralTasksTable";
import UserPerformanceInDepartment from "../Charts/UserPerformanceInDepartment";

function DepartmentInfo(props){

    const [deptInfo, setDeptinfo] = useState({})
    const [managerInfo, setManagerInfo] = useState(null)
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({"department_name": "", "icon": ""})
    const [submitting, setSubmission] = useState(false)
    const [archiving, setArchiving] = useState(false)

    const [currentPage, setCurrentPage] = useState(0)


    async function loadDepartmentInfo(id){
        var res = await getDepartment(id).then(data => data.data).catch(error => {
                    console.log(error.response.data.error)
                    Swal.fire({
                        title: "Error",
                        text: error.response.data.error,
                        icon: "error"
                    })
                })
        await setDeptinfo(res)
        setManagerInfo(null)

        for(const user of res.users){
            
            if(user.role == "head"){
                setManagerInfo(user)
                console.log(user)
            }
        }

        
        setFormData({"id":id, "department_name": res.name, "icon": res.icon })
        
    }
    
    useEffect(()=>{
        loadDepartmentInfo(props.id)
    },[props.id])

    useEffect(()=>{
        socket.on("department", ()=>{
            loadDepartmentInfo(props.id)
        })

        return ()=> socket.off("department")
    }, [])

    useEffect(()=>{
        console.log(formData)
    }, [formData])

    

    const handleDataChange = (e) => {
            setFormData({...formData, [e.target.name]: e.target.value})        
        }
    
    const handleSubmission = async () => {
        const newFormData = objectToFormData(formData);

        if(formData["department_name"] == ""){
            Swal.fire({
                title:"Error",
                text: "Fill the department name field",
                icon:"error"
            })
        }


        setSubmission(true)
        var a = await updateDepartment(newFormData).catch(error => {
                    console.log(error.response.data.error)
                    Swal.fire({
                        title: "Error",
                        text: error.response.data.error,
                        icon: "error"
                    })
                })
            
        if(a.data.message == "Department successfully updated.") {
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
        
        await loadDepartmentInfo(props.id)

        const modalEl = document.getElementById("edit-department");
        const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
        modal.hide();

        setSubmission(false)
        props.loadDepts();
    }

    const handleArchive = async () => {
        
        var a = await archiveDepartment(props.id).catch(error => {
                    console.log(error.response.data.error)
                    Swal.fire({
                        title: "Error",
                        text: error.response.data.error,
                        icon: "error"
                    })
                })
        setArchiving(true)
        if(a.data.message == "Department successfully archived.") {
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
        

        const modalEl = document.getElementById("archive-department");
        const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
        modal.hide();

        setArchiving(false)
        props.firstLoad();
    }

    

    return (
        <div className="department-info-container">
            <CreateOPCRModal deptid ={props.id}></CreateOPCRModal>
            <div className="modal fade" id="archive-department" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Archive Department</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">                            
                            Do you want to archive this department?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-danger" onClick={handleArchive}>
                                {archiving ? <span className="material-symbols-outlined loading">progress_activity</span> : <span>Archive Department</span>}
                            </button>
                           
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="assign-head" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" >
                    <div className="modal-content " >
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Assign Department Head</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">                            
                            <DepartmentAssignHead dept_id = {props.id}></DepartmentAssignHead>
                        </div>
                        <div className="modal-footer">
                            
                           
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="modal fade" id="edit-department" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Create Department</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="textboxes">
                                <label htmlFor="last_name">Department Name <span className="required">*</span></label>
                                <input type="text" id="department_name" name="department_name" onInput={handleDataChange}  placeholder={deptInfo.name}  required/>
                            </div>
                            <div className="textboxes" style={{display:"none"}}>
                                <label htmlFor="department_icon">Choose Icon <span className="required">*</span></label>
                                <div className="icons-container">
                                    <input type="radio" name = "icon" id = "a" hidden onChange={handleDataChange} value = "computer"/>
                                    <label htmlFor="a" className="icon">
                                        <span className="material-symbols-outlined">computer</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "b" hidden onChange={handleDataChange} value = "auto_stories"/>
                                    <label htmlFor="b" className="icon">
                                        <span className="material-symbols-outlined">auto_stories</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "c" hidden onChange={handleDataChange} value = "flights_and_hotels"/>
                                    <label htmlFor="c" className="icon">
                                        <span className="material-symbols-outlined">flights_and_hotels</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "d" hidden onChange={handleDataChange} value = "checkbook"/>
                                     <label htmlFor="d" className="icon">
                                        <span className="material-symbols-outlined">checkbook</span>
                                    </label>
                                    
                                    <input type="radio" name = "icon" id = "e" hidden onChange={handleDataChange} value = "account_balance"/>
                                    <label htmlFor="e" className="icon">
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </label>
                                    
                                    <input type="radio" name = "icon" id = "f" hidden onChange={handleDataChange} value = "local_library"/>
                                    <label htmlFor="f" className="icon">
                                        <span className="material-symbols-outlined">local_library</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "g" hidden onChange={handleDataChange} value = "school"/>
                                    <label htmlFor="g" className="icon">
                                        <span className="material-symbols-outlined">school</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "h" hidden onChange={handleDataChange} value = "psychology"/>
                                    <label htmlFor="h" className="icon">
                                        <span className="material-symbols-outlined">psychology</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "i" hidden onChange={handleDataChange} value = "supervisor_account"/>
                                    <label htmlFor="i" className="icon">
                                        <span className="material-symbols-outlined">supervisor_account</span>
                                    </label>

                                    <input type="radio" name = "icon" id = "j" hidden onChange={handleDataChange} value = "domain"/>
                                    <label htmlFor="j" className="icon">
                                        <span className="material-symbols-outlined">domain</span>
                                    </label>
                                    
                                </div>
                            </div>
                            
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmission}>
                                 {submitting ?<span className="material-symbols-outlined loading">progress_activity</span> : <span>Update Department</span>}
                            </button>
                           
                        </div>
                    </div>
                </div>
            </div>

                <div className="department-overview">
                    
                    <div className="image-container">
                        <div className="image" style={{backgroundImage: `url('${import.meta.env.BASE_URL}nc-splash-new.jpg')`}}></div>
                    </div>
                    
                    <div  className="department-stats">
                        <div className="profile-image-container">
                            
                            <span className="profile-title">

                                <div className="dept-name">
                                    {deptInfo? deptInfo.name: ""}
                                    <span className="material-symbols-outlined settings" onClick={()=>{setOpen(!open)}}>settings</span>

                                    {open && 
                                    <div className="member-options" onMouseLeave={()=>{setOpen(false)}}>
                                        <span className="option" data-bs-toggle="modal" data-bs-target="#assign-head">
                                            <span className="material-symbols-outlined">assignment_ind</span>
                                            <span>Assign Head</span>
                                        </span>
                                        <span className="option" data-bs-toggle="modal" data-bs-target="#edit-department">
                                            <span className="material-symbols-outlined">edit</span>
                                            <span>Edit Info</span>
                                        </span>
                                        <span className="option" data-bs-toggle="modal" data-bs-target="#archive-department">
                                            <span className="material-symbols-outlined">remove</span>
                                            <span>Archive</span>
                                        </span>
                                    </div>}
                                </div>
                                <span className="dept-head-container">
                                    <div style={{fontWeight:"light"}}>Department Head: </div>
                                    {managerInfo? <div className="dept-head">
                                        <div className="img-container">
                                            <img src={managerInfo.profile_picture_link} alt="" />
                                        </div>
                                        <div className="dept-head-name">
                                            {managerInfo.first_name + " " + managerInfo.last_name}
                                        </div>
                                    </div>: <span>None</span> }
                                </span>
                                
                            </span>
                           
                        </div>
                        
                        <div className="main-stats">
                            <div className="stats">
                                <span className="material-symbols-outlined">assignment_globe</span>
                                <span className="count">{deptInfo? deptInfo.opcr_count: ""}</span>
                                <span className="type">OPCR</span>
                            </div>
                            <div className="stats">
                                <span className="material-symbols-outlined">article_person</span>
                                <span className="count">{deptInfo? deptInfo.ipcr_count: ""}</span>
                                <span className="type">IPCR</span>
                            </div>

                            <div className="stats">
                                <span className="material-symbols-outlined">group</span>
                                <span className="count">{deptInfo? deptInfo.user_count: ""}</span>
                                <span className="type">Members</span>
                            </div>

                            <div className="stats">
                                <span className="material-symbols-outlined">task</span>
                                <span className="count">{deptInfo? deptInfo.main_tasks_count: ""}</span>
                                <span className="type">Tasks</span>
                            </div>                            
                        </div>
                        <div>
                            <button className="btn btn-primary" style={{display:"flex", flexDirection:"row", gap:"10px", alignItems:"center"}} data-bs-toggle="modal" data-bs-target="#create-opcr">
                                <span className="material-symbols-outlined">assignment_globe</span>
                                <span>Create OPCR</span>
                            </button>
                        </div>
                        

                        

                                                
                    </div>
                </div>

                
                <div className="pages-container">
                    <div className={currentPage == 0? "select": ""} onClick={()=>{setCurrentPage(0)}}>
                        Tasks 
                    </div>
                    <div className={currentPage == 1? "select": ""} onClick={()=>{setCurrentPage(1)}}>
                        Members 
                    </div>

                    <div className={currentPage == 2? "select": ""} onClick={()=>{setCurrentPage(2)}}>
                        Performance Review Forms
                    </div>
                </div>
                {currentPage == 1? <div style={{backgroundColor:"white", padding:"10px"}}>
                    <UserPerformanceInDepartment dept_id = {props.id}></UserPerformanceInDepartment>
                </div>: ""}
                                       
                <div style={{height:"500px"}}>
                    {currentPage == 0? <DepartmentTasksTable id = {props.id}></DepartmentTasksTable>: ""}
                    {currentPage == 0? <GeneralTasksTable id = {props.id}></GeneralTasksTable>: ""}
                    {currentPage == 1? <DepartmentMemberTable deptid ={props.id} ></DepartmentMemberTable>: ""}
                    {currentPage == 2? <PerformanceReviews deptid ={props.id} ></PerformanceReviews>:""}
                    
                </div>
            </div>
    )
}

export default DepartmentInfo