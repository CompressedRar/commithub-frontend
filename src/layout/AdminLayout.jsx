import {Navigate, Outlet } from "react-router-dom";
import "../assets/styles/Main.css"
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

function AdminLayout(){
    const token = localStorage.getItem("token")
    const [profilePictureLink, setProfile] = useState("")

    function readTokenInformation(){
        let payload = {}
        try {
            payload = jwtDecode(token)
            //console.log(payload)
            setProfile(payload.profile_picture_link)
        }
        catch(err){
            console.log(err)
        }
    }
    
    if(!token){
        return <Navigate to="/" replace></Navigate>
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
                    <img src="CommitHub-Banner.png" alt="" />
                </div>
                <a className="pages" href="/dashboard" style={detectCurrentPage("dashboard")}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Dashboard</span>
                </a>
                <a className="pages" href="/department" style={detectCurrentPage("department")}>
                    <span className="material-symbols-outlined">apartment</span>
                    <span>Department Management</span>
                </a>
                <a className="pages" href = "/users" style={detectCurrentPage("users")}>
                    <span className="material-symbols-outlined">manage_accounts</span>
                    <span>User Management</span>
                </a>
                <a className="pages" href="/tasks" style={detectCurrentPage("tasks")}>
                    <span className="material-symbols-outlined">task</span>
                    <span>Category and Task</span>
                </a>
                <a className="pages" href = "/logs" style={detectCurrentPage("logs")}>
                    <span className="material-symbols-outlined">article_person</span>
                    <span>Audit Logs</span>
                </a>
                <a className="pages">
                    <span className="material-symbols-outlined" style={detectCurrentPage("")}>analytics</span>
                    <span>Performance Commitments and Review</span>
                </a>
            </div>
            <header className="header-container">
                <div className="menu-container">
                    <span className="material-symbols-outlined">menu</span>
                </div>
                <div className="current-page-container">
                    
                    <span className="page">
                        <span>{window.location.pathname.replaceAll("/", "")[0].toLocaleUpperCase() + window.location.pathname.substring(2)}</span>
                    </span>
                </div>

                <div className="notification-container">
                    <span className="material-symbols-outlined">notifications</span>
                </div>
                <div className="profile-container">
                    <div className="profile-image-container">
                        <img src={profilePictureLink} alt="" />
                    </div>
                </div>
            </header>

            

            <main className="main-content-container">
                <Outlet />
            </main>
            
        </div>
    )
}

export default AdminLayout