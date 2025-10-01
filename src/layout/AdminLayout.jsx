import {Navigate, Outlet } from "react-router-dom";
import "../assets/styles/Main.css"
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { checkRole } from "../components/api";
import Swal from "sweetalert2";

function AdminLayout(){
    const token = localStorage.getItem("token")
    const [profilePictureLink, setProfile] = useState("")
    const [role, setRole] = useState(null)
    const [options, setOptions] = useState(false)
    const [userInfo, setUserInfo] = useState({})

    function readTokenInformation(){
        let payload = {}
        try {
            payload = jwtDecode(token)
            console.log("token: ",payload)
            setProfile(payload.profile_picture_link)
            setRole(payload.role || null)
            setUserInfo(payload)
            
        }
        catch(err){
            console.log(err)
        }
    }

    //gawin create ipcr bukas
    
    
    if(!token){
        return <Navigate to="/" replace></Navigate>
    }

    if(role && role !== "administrator"){
        console.log(role)
        window.location.href = "/unauthorized"
    }
    

    function Logout(){ 
        Swal.fire({
            title:"Logout",
            text:"Do you want to logout?",
            showDenyButton: true,
            confirmButtonText:"Logout",
            denyButtonText:"No",
            icon:"warning",
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-1 right-gap',
            },
        }).then((result)=> {
            if(result.isConfirmed){
                localStorage.removeItem("token")
                window.location.reload()
            }
        })  
    }

    function detectCurrentPage(detect){
        var current = window.location.pathname.replaceAll("/", "").toLocaleLowerCase()
        return String(detect).includes(current)? {backgroundColor: "rgba(85, 130, 255, 0.2)", color:"var(--primary-color)"}: {}
    }
    
    useEffect(()=>{
        
        readTokenInformation()
        detectCurrentPage("dashboard")
    }, [])

    return (
        <div className="main-layout-container">
            <div className="sidebar-container">
                <div className="logo-container">
                    <img src={`${import.meta.env.BASE_URL}CommitHub-Banner.png`} alt="" />
                </div>
                <a className="pages" href="/admin/dashboard" style={detectCurrentPage("dashboard")}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Dashboard</span>
                </a>
                <a className="pages" href="/admin/department" style={detectCurrentPage("department")}>
                    <span className="material-symbols-outlined">apartment</span>
                    <span>Department Management</span>
                </a>
                <a className="pages" href="/admin/tasks" style={detectCurrentPage("tasks")}>
                    <span className="material-symbols-outlined">task</span>
                    <span>Category and Task</span>
                </a>
                <a className="pages" href = "/admin/users" style={detectCurrentPage("users")}>
                    <span className="material-symbols-outlined">group</span>
                    <span>User Management</span>
                </a>
                
                <a className="pages" href = "/admin/logs" style={detectCurrentPage("logs")}>
                    <span className="material-symbols-outlined">article_person</span>
                    <span>Audit Logs</span>
                </a>
            </div>
            <header className="header-container">
                <div className="current-location">
                    <div className="menu-container">
                        <span className="material-symbols-outlined">menu</span>
                    </div>
                    <div className="current-page-container">                    
                        <span className="page">
                            <span>{window.location.pathname.replaceAll("/", "")[0].toLocaleUpperCase() + window.location.pathname.substring(2)}</span>
                        </span>
                    </div>
                </div>

                <div className="current-info">
                    <div className="notification-container">
                        <span className="material-symbols-outlined">notifications</span>
                    </div>
                    <div className="account-informations">
                        <span>{userInfo.first_name + " " + userInfo.last_name}</span>
                        <span className="current-department">{userInfo.department ? userInfo.department.name :""}</span>
                    </div>

                    <div className="profile-containers" onClick={()=>{setOptions(!options)}}>                        
                        <div className="profile-image-container">
                            <img src={profilePictureLink} alt="" />
                        </div>
                    </div>
                </div>
            </header>
            {
                options && <div className="header-options" onMouseLeave={()=>{setOptions(false)}}>
                    <div className="header-option">
                        <span className="material-symbols-outlined" style={detectCurrentPage("")}>manage_accounts</span>
                        <span>Account Setting</span>
                    </div>
                    <div className="header-option" onClick={()=>{
                        Logout()
                    }}>
                        <span className="material-symbols-outlined">logout</span>
                        <span>Logout</span>
                    </div>
                </div>
            }

            

            <main className="main-content-container">
                <Outlet />
            </main>
            
        </div>
    )
}

export default AdminLayout