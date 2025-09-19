import { useState, useEffect, useRef } from "react"
import SubmissionsChart from "../Barchart"
import UsersPieChart from "../Piechart"


import { getPositions } from "../../services/positionService"
import { getDepartments } from "../../services/departmentService"
import { getAccountInfo, updateMemberInfo } from "../../services/userService"
import { objectToFormData } from "../api"
import Swal from "sweetalert2"


function MemberProfile(props){
    
    const [memberInformation, setMemberInformation] = useState({}) 
    const [positions, setPositions] = useState([])   
    const [allDepartments, setAllDepartments] = useState([])
    const [formData, setFormData] = useState({"id": 0, "department": 0})
    const [page, setPage] = useState(1)
    const [dataChanged, setDataChanged] = useState(false)
    
    const[preview, setPreview] = useState(null)
    const fileInput = useRef(null)

    async function loadUserInformation(){
        var res = await getAccountInfo(props.id).then(data => data.data)
        setMemberInformation(res)
        
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
        })

        console.log("lock and loaded")

    }

    //gawin yung reset password
    //gawin yung deactivate user

    

    async function loadDepartments(){
        var res = await getDepartments().then(data => data.data)
        setAllDepartments(res)
        console.log(res)
    }

    async function handleUpdate() {
        var converted_data = objectToFormData(formData)
        var res = await updateMemberInfo(converted_data).then(data => data.data.message)
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

        await loadUserInformation()
    }
    
    function detectChange(){
        var fname = document.getElementById("first_name")
        var mname = document.getElementById("middle_name")
        var lname = document.getElementById("last_name")
        var dept = document.getElementById("department")
        var position = document.getElementById("position")

        var res =  ((fname.value == memberInformation.first_name) && (mname.value == memberInformation.middle_name) && (lname.value == memberInformation.last_name) && (dept.value == memberInformation.department.id) && (position.value == memberInformation.position.id))
        setDataChanged(res)
        
    }

    const loadPositions = async () => {
            const result = await getPositions().then(data => {
                return data.data    
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
        
        
    };
    
    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})     
    }
    useEffect(()=> {
        console.log(preview == memberInformation.profile_picture_link)
        setDataChanged(preview == memberInformation.profile_picture_link)
    }, [preview])

    useEffect(()=>{
        console.log(dataChanged)
    }, [dataChanged])

    useEffect(()=>{
        console.log(formData)
        detectChange()
    }, [formData])

    useEffect(()=>{
        loadDepartments()
        loadPositions()
        loadUserInformation()
    }, [])



    return(
        <div className="member-profile-container">
            
            <div className="tabs-container">
                <div className={!page? "tab active": "tab"} onClick={()=>{setPage(0)}}>
                    User Info
                </div>
                <div className={page? "tab active": "tab"}  onClick={()=>{setPage(1)}}>
                    Edit Info
                </div>
            </div>

            <div className="tab-content-container">
                {page == 0? 
                <div style={{width: "100%"}}>
                    <div className="profile-container"> 
                        <div className="profile">
                            <div className="profile-image-container">
                                <div className="profile-picture" style={{backgroundImage:"url('dummy.jpg')"}}>.</div>
                            </div>
                            <div className="profile-name-container">
                                <div className="profile-name">{memberInformation.first_name + " " + memberInformation.last_name}</div>
                                <div className="profile-email">{memberInformation.email}</div>
                            </div>
                        </div>
                    </div>
                    <div className="basic-info-container">
                    <div className="graph-container">
                        <h6>IPCR Edit This Month</h6>
                        <SubmissionsChart></SubmissionsChart>
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
                        <span className="content">{memberInformation.role[0].toUpperCase() + memberInformation.role.slice(1)}</span>
                    </div>
                </div>
                <h2>IPCR Submitted</h2>
                <div className="ipcr-submitted-container">
                    <div className="ipcr-submitted">
                        <div className="ipcr-stat-container">
                            <div className="ipcr-stat">
                                <span className="material-symbols-outlined">article_person</span>
                                <span>IPCR #87126712</span>
                            </div>
                            <div className="ipcr-stat">
                                <span className="title">Date Submitted</span>
                                <span className="content">2025-09-05 22:18:51</span>
                            </div>
                        </div>
                    </div>
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
                        <label className="title" htmlFor="department">Department <span className="required">*</span></label>
                        <select name="department" id="department" onChange={handleDataChange}>
                            {allDepartments.map(dept => (
                                <option value = {dept.id} key={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pair">
                        <label className="title" htmlFor="position">Position <span className="required">*</span></label>
                        <select name="position" id="position" onChange={handleDataChange}>
                            {positions.map(pos => (
                                <option value = {pos.id} key={pos.id}>{pos.name}</option>
                            ))}
                            
                        </select>
                    </div>

                    <div className="changes-container">
                        <button className="btn btn-secondary" disabled = {dataChanged} onClick={()=>{loadUserInformation()}}>Cancel</button>
                        <button className="btn btn-success" disabled = {dataChanged} onClick={()=>{handleUpdate()}}>Save Changes</button>
                    </div>

                    <h4>Account Information</h4>
                    <div className="pair">
                        <label htmlFor="email" className="title">Email Address</label>
                        <input type="email" id = "email" name = "email" placeholder="John Doe"/>
                    </div> 
                    <div className="reset-password">
                        <button className="btn btn-warning">
                            <span className="material-symbols-outlined">restart_alt</span>
                            <span>Reset Password</span>
                        </button>
                        <button className="btn btn-danger">
                            <span className="material-symbols-outlined">account_circle_off</span>
                            <span>Deactivate Account</span>
                        </button>
                    </div>
                    
                    
                </div>
                }
            </div>
        </div>
    )
}

export default MemberProfile