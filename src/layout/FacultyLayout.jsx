import {Navigate, Outlet } from "react-router-dom";
import "../assets/styles/Main.css"
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAccountNotification } from "../services/userService";

function FacultyLayout(){
    const token = localStorage.getItem("token")
    const [profilePictureLink, setProfile] = useState("")

    const [options, setOptions] = useState(false)
    const [userInfo, setUserInfo] = useState({})

    const [openNotif, setOpenNotif] = useState(false)
    
            const [notifications, setNotifications] = useState(null)
    
            async function loadNotification(user_id){
                var res = await getAccountNotification(user_id).then(data => data.data)
                setNotifications(res.toReversed())
                console.log("notification", res)
    
            }
    function readTokenInformation(){
        let payload = {}
        try {
            payload = jwtDecode(token)
            console.log("token: ",payload)
            setProfile(payload.profile_picture_link)
            setUserInfo(payload)

            loadNotification(payload.id)
        }
        catch(err){
            console.log(err)
        }
    }
    
    if(!token){
        return <Navigate to="/" replace></Navigate>
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
        <div className="main-layout-container" style={{gridTemplateColumns:"1fr"}}>
            <div className="sidebar-container" style={{display:"none"}}>
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
                <div className="current-location">
                    
                    <div className="current-page-container">                    
                        <span className="page">
                            <img src={`${import.meta.env.BASE_URL}CommitHub-Banner.png`} alt="" style={{
                                height:"100%",
                                width:"20%"
                            }}/>
                        </span>
                    </div>
                </div>

                <div className="current-info">
                    <div className="notification-container">
                        <span className="material-symbols-outlined" onClick={()=> {setOpenNotif(!openNotif)}}>notifications</span>

                        
                        <div className="all-notification" style={openNotif? {display:"flex"}: {display:"none"}}  onMouseLeave={(e)=> {
                                //setOpenNotif(false)
                            }}>
                            <h3>Notifications</h3>
                            {notifications && notifications.map(notif => (
                                <div className="notif">
                                    <span>{notif.name}</span>
                                    <span>{notif.created_at}</span>
                                </div>
                            ))}
                        </div>
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

export default FacultyLayout