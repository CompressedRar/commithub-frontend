import { useState, useEffect, useRef } from "react"



import { getPositions } from "../../services/positionService"
import {  getDepartments } from "../../services/departmentService"
import { archiveAccount, getAccountInfo, updateMemberInfo, unarchiveAccount, resetAccountPasssword } from "../../services/userService"
import { objectToFormData } from "../api"
import Swal from "sweetalert2"
import { Modal } from "bootstrap/js/dist/modal"
import { socket } from "../api";
import { UserTaskPerformanceCharts } from "../Charts/CategoryPerformance"


function MemberProfile(props){
    
    const [memberInformation, setMemberInformation] = useState({}) 
    const [positions, setPositions] = useState([])   
    const [allDepartments, setAllDepartments] = useState([])
    const [formData, setFormData] = useState({"id": 0, "department": 0})
    const [page, setPage] = useState(0)
    const [dataChanged, setDataChanged] = useState(false)
    const [archiving, setArchiving] = useState(false)
    
    const[preview, setPreview] = useState(null)
    const fileInput = useRef(null)

    const [updating, SetUpdating] = useState(false)
    const [resetting, setResetting] = useState(false)

    const [allIPCRs, setIPCRs] = useState(null)

    async function loadUserInformation(){
        var res = await getAccountInfo(props.id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setMemberInformation(res)
        console.log("MEMBER INFO", res)
        setIPCRs(res.ipcrs)

        
        
        var fname = document.getElementById("first_name")
        fname.value= res.first_name
        var mname = document.getElementById("middle_name")
        mname.value= res.middle_name
        var lname = document.getElementById("last_name")
        lname.value= res.last_name
        var dept = document.getElementById("department")
        dept.value = res.department.id
        var position = document.getElementById("position")
        position.value = res.position.id
        var email = document.getElementById("email")
        email.value = res.email
        console.log(res)
        setPreview(res.profile_picture_link)
        setFormData({
            "id": props.id,
            "department": res.department.id,
            "position": res.position.id,
            "first_name": res.first_name,
            "midde_name": res.middle_name,
            "last_name": res.last_name,
            "position": res.position
        })

        console.log("lock and loaded")

    }

    const Reactivate = async () => {
        var res = await unarchiveAccount(props.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "User successfully reactivated") {
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
    }
    const handleReactivate = async () => {
        Swal.fire({
            title: 'Do you want to reactivate this account?',
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
                Reactivate()
            } else if (result.isDenied) {
                                   
            }
        })
                
        
        const modalEl = document.getElementById("user-profile");
        const modal = Modal.getOrCreateInstance(modalEl);

        modal.hide();

            // Cleanup leftover backdrop if any
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = ""; // reset scroll lock
        
        setArchiving(false)
    }

    const handleArch = async () => {
        var res = await archiveAccount(props.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "User successfully deactivated") {
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

    const handleArchive = async () => {
        
       Swal.fire({
            title: 'Do you want to deactivate this account?',
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
        

        const modalEl = document.getElementById("user-profile");
        const modal = Modal.getOrCreateInstance(modalEl);

        modal.hide();

            // Cleanup leftover backdrop if any
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = ""; // reset scroll lock

        setArchiving(false)
        props.firstLoad();
    }

    //gawin yung reset password
    //gawin yung deactivate user

    const ResetPassword = async () => {
        setResetting(true)
        var res = await resetAccountPasssword(props.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "Password successfully reset.") {
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
        setResetting(false)
    }

    const handleResetPassword = async () => {
        
       Swal.fire({
            title: 'Reset Password?',
            showDenyButton: true,
            text:"Do you want to reset the password of this account",
            confirmButtonText: 'Yes',
            confirmButtonColor:"red",
            icon:"warning",
            denyButtonText: 'No',
            denyButtonColor:"grey",
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2'
                },
                       }).then(async (result) => {
                       if (result.isConfirmed) {
                           ResetPassword()
                       } else if (result.isDenied) {
                           
                       }
                   })
        

        setArchiving(false)
    }

    

    async function loadDepartments(){
        var res = await getDepartments().then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setAllDepartments(res)
        console.log(res)
    }

    async function handleUpdate() {
        var converted_data = objectToFormData(formData)
        if (fileInput != null){
            converted_data.set("profile_picture_link", fileInput.current.files[0])
        }
        console.log("FORM DATA", converted_data)
        SetUpdating(true)
        var res = await updateMemberInfo(converted_data).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log(res)
        if(res == "User successfully updated") {
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
        SetUpdating(false)

        await loadUserInformation()
    }
    
    function detectChange(){
        if(page != 1) return;
        var fname = document.getElementById("first_name")
        var mname = document.getElementById("middle_name")
        var lname = document.getElementById("last_name")
        var dept = document.getElementById("department")
        var position = document.getElementById("position")
        var role = document.getElementById("role")

        var res =  ((role.value == memberInformation.role)&&(fname.value == memberInformation.first_name) && (mname.value == memberInformation.middle_name) && (lname.value == memberInformation.last_name) && (dept.value == memberInformation.department.id) && (position.value == memberInformation.position.id) && (preview == memberInformation.profile_picture_link))
        setDataChanged(res)
        
    }

    const loadPositions = async () => {
            const result = await getPositions().then(data => {
                return data.data    
            }).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            setPositions(result)
        }

    const handleImageChange = () => {
        const file = fileInput.current.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
        }

        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);

        setFormData((prev) => ({
            ...prev,
            "profile_picture_link": file
        }));
        
         
    };
    
    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})     
    }
    useEffect(()=> {
        console.log("is data changed", preview == memberInformation.profile_picture_link)
        setDataChanged(false)
    }, [preview])

    useEffect(()=>{
        console.log(dataChanged)
    }, [dataChanged])

    useEffect(()=> {
        loadUserInformation()
    }, [page])

    useEffect(()=>{
        console.log(formData)
        detectChange()
    }, [formData])

    useEffect(()=>{
        loadDepartments()
        loadPositions()
        

        socket.on("user_modified", ()=>{
            loadUserInformation()
        })
    }, [])



    return(
        <div className="member-profile-container">

            <div className="modal fade" id="archive-account" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Archive Department</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">                            
                            Do you want to deactivate this account?
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
            
            <div className="tabs-container">
                <div className={!page? "tab selected": "tab"} onClick={()=>{setPage(0)}}>
                    User Info
                </div>
                <div className={page? "tab selected": "tab"}  onClick={()=>{setPage(1)}}>
                    Edit Info
                </div>
            </div>

            <div className="tab-content-container">
                {page == 0? 
                <div style={{width: "100%"}}>
                    <div className="profile-container"> 
                        <div className="profile">
                            <div className="profile-image-container">
                                <div className="profile-picture" style={{backgroundImage:`url('${memberInformation.profile_picture_link}')`}}>.</div>
                            </div>
                            <div className="profile-name-container">
                                <div className="profile-name">{memberInformation.first_name + " " + memberInformation.last_name}</div>
                                <div className="profile-email">{memberInformation.email}</div>
                            </div>
                        </div>
                    </div>
                    <div className="basic-info-container">
                    <div className="graph-container">
                        <UserTaskPerformanceCharts userTaskID={props.id}></UserTaskPerformanceCharts>
                    </div>
                    <div className="pair">
                        <span className="title">Joined at</span>
                        <span className="content">{memberInformation.created_at}</span>
                    </div>
                    <div className="pair">
                        <span className="title">Number of Tasks Assigned</span>
                        <span className="content">{memberInformation.main_tasks_count}</span>
                    </div>
                    <div className="pair">
                        <span className="title">IPCR Submitted</span>
                        <span className="content">{memberInformation.ipcrs_count}</span>
                    </div>
                    <div className="pair">
                        <span className="title">Department</span>
                        <span className="content">{memberInformation.department? memberInformation.department.name:""}</span>
                    </div>
                    <div className="pair">
                        <span className="title">Position</span>
                        <span className="content">{memberInformation.position? memberInformation.position.name:""}</span>
                    </div>
                    <div className="pair">
                        <span className="title">Role</span>
                        <span className="content">{memberInformation.role?memberInformation.role[0].toUpperCase() + memberInformation.role.slice(1):""}</span>
                    </div>
                </div>
                <h2>IPCR Submitted</h2>
                <div className="ipcr-submitted-container">
                    {allIPCRs && allIPCRs.map(ipcr => (
                               <div className="ipcr-submitted">
                        <div className="ipcr-stat-container">
                            <div className="ipcr-stat">
                                        <span className="material-symbols-outlined">article_person</span>
                                        <span>IPCR #{ipcr.id}</span>
                                    </div>
                                    <div className="ipcr-stat">
                                        <span className="content">{ipcr.created_at}</span>
                                    </div>
                            
                            
                            
                            
                        </div>
                    </div> 
                ))}
                    
                </div>
                </div>: 
                <div className="profile-edit-container">
                    <h3>Edit Profile</h3>
                    <div className="edit-profile-image-container">
                        <label htmlFor="profile-image" className="profile-image" style={{backgroundImage:`url('${preview}')`}}>+</label>
                        <input type="file" id = "profile-image" name = "profile-image" onChange={handleImageChange} ref={fileInput} accept="image/*" hidden />
                    </div>
                    <h3>Personal Information</h3>
                    <div className="pair">
                        <label htmlFor="first_name" className="title">First Name</label>
                        <input type="text" id = "first_name" name = "first_name" placeholder="John" onInput={handleDataChange}/>
                    </div>

                    <div className="pair">
                        <label htmlFor="middle_name" className="title">Middle Name</label>
                        <input type="text" id = "middle_name" name = "middle_name" placeholder="Doe" onInput={handleDataChange}/>
                    </div> 

                    <div className="pair">
                        <label htmlFor="last_name" className="title">Last Name</label>
                        <input type="text" id = "last_name" name = "last_name" placeholder="Doe" onInput={handleDataChange}/>
                    </div> 

                    <div className="pair">
                        <label className="title" htmlFor="department">Department</label>
                        <select name="department" id="department" onChange={handleDataChange}>
                            {allDepartments.map(dept => (
                                <option value = {dept.id} key={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pair">
                        <label className="title" htmlFor="position">Position</label>
                        <select name="position" id="position" onChange={handleDataChange}>
                            {positions.map(pos => (
                                <option value = {pos.id} key={pos.id}>{pos.name}</option>
                            ))}
                            
                        </select>
                    </div>

                    <div className="pair">
                        <label className="title" htmlFor="role">Role </label>
                        <select name="role" id="role" onChange={handleDataChange}>
                            <option value="faculty">Faculty</option>
                            <option value="head">Head</option>
                            <option value="president">President</option>
                            <option value="administrator">Administrator</option>
                            
                        </select>
                    </div>



                    <div className="changes-container">
                        <button className="btn btn-secondary" disabled = {dataChanged} onClick={()=>{loadUserInformation()}}>Cancel</button>
                        <button className="btn btn-success" disabled = {dataChanged || updating} onClick={()=>{handleUpdate()}}>{updating ? <span className="material-symbols-outlined">refresh</span>: "Save Changes"}</button>
                    </div>

                    <h4>Account Information</h4>
                    <div className="pair">
                        <label htmlFor="email" className="title">Email Address</label>
                        <input type="email" id = "email" name = "email" placeholder="John Doe"/>
                    </div> 
                    <div className="reset-password" >
                        <button className="btn btn-warning" disabled = {resetting} onClick={()=> {
                            handleResetPassword()
                        }}>
                            {resetting?
                            <span className="material-symbols-outlined">restart_alt</span> :
                            <div style={{alignItems:"center", display:"flex", flexDirection:"row"}}><span className="material-symbols-outlined">restart_alt</span>
                            <span>Reset Password</span></div>}
                        </button>
                        <button className={memberInformation.account_status == 0? "btn btn-success": "btn btn-danger"} onClick={()=>{
                            if(memberInformation.account_status) {
                                handleArchive()
                            }
                            else {
                                handleReactivate()
                            }
                        }}>
                            <span className="material-symbols-outlined">{memberInformation.account_status == 0? "account_circle": "account_circle_off"}</span>
                            <span>{memberInformation.account_status == 0? "Reactivate": "Deactivate"}</span>
                        </button>
                    </div>
                    
                    
                </div>
                }
            </div>
        </div>
    )
}

export default MemberProfile