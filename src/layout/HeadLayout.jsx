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


import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from "@mui/material/IconButton";
import AccountMenu from "../components/AccountMenu";


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
          { href: "/head/department", icon: <ApartmentIcon></ApartmentIcon>, text: "Offices" },
          { href: "/head/ipcr", icon: <AssignmentIndIcon></AssignmentIndIcon>, text: "IPCR" },
        ]}
        isOpen={sidebarCollapsed}
        closeNavigation={()=> {setSidebarCollapsed(false)}}
      ></Navigations>
      

      {/* 🔹 Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
      >
        {/* Header */}
        <header className="d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom shadow-sm w-100" style={{zIndex:1000}}>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h5 className="mb-0 fw-semibold text-primary">
              {window.location.pathname.split("/")[2]
                ? window.location.pathname.split("/")[2].charAt(0).toUpperCase() +
                  window.location.pathname.split("/")[2].slice(1)
                : "Dashboard"}
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3 position-relative">
            <Badge 
              badgeContent = {notifications.filter((n) => !n.read).length} color="error" 
              data-bs-toggle="modal"
              data-bs-target="#notification-modal">
                <IconButton>
                  <NotificationsIcon></NotificationsIcon>
                </IconButton>
            </Badge>            
            

            {/* User Menu */}
            <div
              className="d-flex align-items-center gap-2 cursor-pointer flex-row-reverse"
              onClick={(event) => {
                setOptions(!options)
                console.log("Setting anchor", event.currentTarget)
                setAnchor(event.currentTarget)
              }}
            >
              <div
                className="rounded-circle overflow-hidden border"
                style={{ width: "40px", height: "40px" }}
              >
                <img
                  src={profilePictureLink}
                  alt="Profile"
                  className="w-100 h-100 object-fit-cover"
              />
              </div>
              {!isMobile && (
                <div className="d-flex flex-column align-items-end">
                  <span className="fw-semibold">
                    {userInfo?.first_name} {userInfo?.last_name}
                  </span>
                  <small className="text-muted">
                    {userInfo?.department?.name || ""}
                  </small>
                </div>
              )}
            </div>

            <AccountMenu isOpen={options} anchorEl={menuAnchor} closeMenu={()=> {setOptions(false)}} handleLogout={Logout}></AccountMenu>
          </div>
        </header>

        {/* Main content area */}
        <main
          className="flex-grow-1"
          style={{ backgroundColor: "#ffffffff", padding:"2vw"}}
        >
          <div>
            <Outlet />
          </div>
        </main>
      </div>

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
