import { Navigate, Outlet, NavLink } from "react-router-dom";
import "../assets/styles/Main.css";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAccountInfo, getAccountNotification, readNotification } from "../services/userService";
import AccountSettings from "../components/UsersComponents/AccountSettings";
import NotificationModal from "../components/NotificationModal";
import { socket } from "../components/api";



import Navigations from "../components/Navigations";
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AnalyticsIcon from '@mui/icons-material/Analytics';


import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from "@mui/material/IconButton";
import AccountMenu from "../components/AccountMenu";


import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Avatar, Box, Stack, Toolbar } from "@mui/material";

function HeadLayout() {
  const token = localStorage.getItem("token");
  const [profilePictureLink, setProfilePictureLink] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [role, setRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [options, setOptions] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [menuAnchor, setAnchor] = useState(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function loadNotification(user_id) {
    try {
      const res = await getAccountNotification(user_id);
      setNotifications(res.data.toReversed());
    } catch (error) {
      console.error(error);
    }
  }

  function readTokenInformation() {
      try {
        const payload = jwtDecode(token);
        setUserInfo(payload);
        setRole(payload.role || null);
        setProfilePictureLink(payload.profile_picture_link);
        loadNotification(payload.id);
        getUser(payload.id)
      } catch (err) {
        console.error(err);
      }
    }
  
    async function getUser(user_id){
      try {
        var res = await getAccountInfo(user_id)
        console.log(res.data)
        setUserInfo(res.data)
        setProfilePictureLink(res.data.profile_picture_link);
        setRole(res.data.role || null)
        console.log("CURRENT ROLE", res.data.role)
      }
      catch(error){
        console.error(error);
      }
    }

  const handleOpenNotification = () => {
    const newState = !openNotif;
    setOpenNotif(newState);

    if (newState && notifications.length > 0) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        readNotification(unreadIds)
          .then(() => {
            setNotifications((prev) =>
              prev.map((n) =>
                unreadIds.includes(n.id) ? { ...n, read: true } : n
              )
            );
          })
          .catch((err) => console.error("Failed to mark notifications:", err));
      }
    }
  };

  function Logout() {
    Swal.fire({
      title: "Logout",
      text: "Do you want to logout?",
      showDenyButton: true,
      confirmButtonText: "Logout",
      denyButtonText: "Cancel",
      icon: "warning",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.reload();
      }
    });
  }

  useEffect(() => {
    if (token) readTokenInformation();
  }, []);

  useEffect(() => {
      if (!token) return;
      readTokenInformation();
      socket.on("user_modified", ()=> {
        readTokenInformation()
        console.log("USER UPDATED!!")
        
      });
      socket.on("user_updated", ()=> {
        readTokenInformation()
        console.log("USER UPDATED!!")
      });
      socket.on("notification_sent", () => readTokenInformation());
  
  }, []);



  if (!token) return <Navigate to="/" replace />;
  if (role && role !== "head") return <Navigate to="/unauthorized" replace />;

  return (
    <div className="d-flex flex-column flex-md-row vh-100 overflow-scroll">

      <Navigations links = {[
          { href: "/head/department", icon: <ApartmentIcon></ApartmentIcon>, text: "Office" },
          { href: "/head/ipcr", icon: <AssignmentIndIcon></AssignmentIndIcon>, text: "IPCR" },
        ]}
        isOpen={sidebarCollapsed}
        closeNavigation={()=> {setSidebarCollapsed(false)}}
      ></Navigations>
      

      {/* 🔹 Main Content */}
      <Box 
       sx={{ flexGrow: 1 }}
      >  
        <AppBar position="static" sx={{backgroundColor:"white", color: "text.primary", zIndex:1500, borderBottomStyle:"solid", borderWidth:"1px", borderColor:"lightgray"}}>
          <Toolbar sx={{width:"100%", justifyContent:"space-between"}}>
            <IconButton 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <MenuIcon></MenuIcon>
            </IconButton>

          
            <Stack gap={2} direction={"horizontal"}>
              <Badge 
                badgeContent = {notifications.filter((n) => !n.read).length} color="error" 
                data-bs-toggle="modal"
                data-bs-target="#notification-modal">
                  <IconButton>
                    <NotificationsIcon></NotificationsIcon>
                  </IconButton>
              </Badge>     

             
                  
                {!isMobile && (
                  <Box display={"flex"} alignItems={"flex-end"} flexDirection={"column"}>
                    <span className="fw-semibold">
                      {userInfo?.first_name} {userInfo?.last_name}
                    </span>
                    <small className="text-muted">
                      {userInfo?.department?.name || ""}
                    </small>
                  </Box>
                )}   
              <Avatar 
                id="avatar"              
                onClick={(event) => {
                  setOptions(!options)
                  console.log("Setting anchor", event.currentTarget)
                  setAnchor(event.currentTarget)
                }}
                sx={{backgroundColor:"white", borderStyle:"solid", borderWidth:"1px", borderColor:"primary.main"}}
                src={profilePictureLink}
              />

              

              <AccountMenu isOpen={options} anchorEl={menuAnchor} closeMenu={()=> {setOptions(false)}} handleLogout={Logout}></AccountMenu>
              
            </Stack>

          </Toolbar>
        </AppBar>

        <main
          className="flex-grow-1"
          style={{ backgroundColor: "#ffffffff"}}
        >
          <div style={{padding:"2em"}}>
            <Outlet />
          </div>
        </main>

      </Box>

      {/* 🔹 Account Settings Modal */}
      <div
        className="modal fade"
        id="account-setting"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Account Settings</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {userInfo && <AccountSettings id={userInfo.id} />}
            </div>
          </div>
        </div>
      </div>
      <NotificationModal
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
}

export default HeadLayout;
