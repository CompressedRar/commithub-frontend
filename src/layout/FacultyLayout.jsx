import {Navigate, Outlet } from "react-router-dom";
import "../assets/styles/Main.css"
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

function FacultyLayout(){
    const token = localStorage.getItem("token")
    const [profilePictureLink, setProfile] = useState("")

    function readTokenInformation(){
        let payload = {}
        try {
            payload = jwtDecode(token)
            console.log("token: ",payload)
            setProfile(payload.profile_picture_link)
        }
        catch(err){
            console.log(err)
        }
    }
    
    if(!token){
        return <Navigate to="/" replace></Navigate>
    }

    function Logout(){
        localStorage.removeItem("token")
        window.location.reload()
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
                <a className="pages" href="/faculty/ipcr" style={detectCurrentPage("dashboard")}>
                    <span className="material-symbols-outlined">article_person</span>
                    <span>IPCR</span>
                </a>                
                <a className="pages" onClick={()=>{
                    Logout()
                }}>
                    <span className="material-symbols-outlined" style={detectCurrentPage("")}>logout</span>
                    <span>Logout</span>
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

export default FacultyLayout