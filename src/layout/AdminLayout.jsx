import { Navigate, Outlet, NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { socket } from "../components/api";
import Swal from "sweetalert2";
import { getAccountInfo, getAccountNotification } from "../services/userService";
import AccountSettings from "../components/UsersComponents/AccountSettings";
import "../assets/styles/Main.css";

import "bootstrap/dist/css/bootstrap.min.css";
import NotificationModal from "../components/NotificationModal";

import Navigations from "../components/Navigations";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import TaskIcon from '@mui/icons-material/Task';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupIcon from '@mui/icons-material/Group';
import MonitorIcon from '@mui/icons-material/Monitor';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';

import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from "@mui/material/IconButton";
import AccountMenu from "../components/AccountMenu";

import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Avatar, Box, Stack, Toolbar } from "@mui/material";

function AdminLayout() {
  const token = localStorage.getItem("token");
  const [payloads, setPayload] = useState(null)
  const [role, setRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [profilePictureLink, setProfilePictureLink] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [options, setOptions] = useState(false);
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

  async function getUser(user_id) {
    try {
      var res = await getAccountInfo(user_id)
      console.log(res.data)
      setUserInfo(res.data)
      setProfilePictureLink(res.data.profile_picture_link);
      setRole(res.data.role || null)

    }
    catch (error) {
      console.error(error);
    }
  }

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
    if (!token) return;
    readTokenInformation();
    socket.on("user_modified", () => {
      readTokenInformation()
      console.log("USER UPDATED!!")

    });
    socket.on("user_updated", () => {
      readTokenInformation()
      console.log("USER UPDATED!!")
    });
    socket.on("notification_sent", () => readTokenInformation());

  }, []);

  if (!token) return <Navigate to="/" replace />;
  if (role && role !== "administrator" && role !== "president") return <Navigate to="/unauthorized" replace />;

  return (
    <div className="d-flex flex-column flex-md-row vh-100 overflow-scroll">
      <Navigations links={[
        { href: "/sadmin/dashboard", icon: <DashboardIcon></DashboardIcon>, text: "Dashboard" },
        { href: "/sadmin/department", icon: <ApartmentIcon></ApartmentIcon>, text: "Offices" },
        { href: "/sadmin/tasks", icon: <TaskIcon></TaskIcon>, text: "Key Result Areas" },
        { href: "/sadmin/ipcr", icon: <AssignmentIndIcon></AssignmentIndIcon>, text: "IPCR" },
        { href: "/sadmin/master", icon: <AssignmentIcon></AssignmentIcon>, text: "Master OPCR" },
        { href: "/sadmin/users", icon: <GroupIcon></GroupIcon>, text: "User Management" },
        { href: "/sadmin/logs", icon: <MonitorIcon></MonitorIcon>, text: "Audit Logs" },
        { href: "/sadmin/analytics", icon: <AnalyticsIcon></AnalyticsIcon>, text: "Performance Analytics" },
        { href: "/sadmin/settings", icon: <SettingsIcon></SettingsIcon>, text: "Settings" }
      ]}
        isOpen={sidebarCollapsed}
        closeNavigation={() => { setSidebarCollapsed(false) }}
      ></Navigations>


      {/* 🔹 Main Content */}

      <Box
        sx={{ flexGrow: 1 }}
      >
        <AppBar position="static" sx={{ backgroundColor: "white", color: "text.primary", zIndex: 1500, borderBottomStyle: "solid", borderWidth: "1px", borderColor: "lightgray" }}>
          <Toolbar sx={{ width: "100%", justifyContent: "space-between" }}>
            <Stack gap={2} direction={"horizontal"}>
              <IconButton
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <MenuIcon></MenuIcon>

              </IconButton>
              <img
                src={`${import.meta.env.BASE_URL}NC.png`}
                alt="College Logo"
                style={{ height: "50px", objectFit: "contain" }}
              />
            </Stack>


            <Stack gap={2} direction={"horizontal"}>
              <Badge
                badgeContent={notifications.filter((n) => !n.read).length} color="error"
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
                sx={{ backgroundColor: "white", borderStyle: "solid", borderWidth: "1px", borderColor: "primary.main" }}
                src={profilePictureLink}
              />



              <AccountMenu isOpen={options} anchorEl={menuAnchor} closeMenu={() => { setOptions(false) }} handleLogout={Logout}></AccountMenu>

            </Stack>

          </Toolbar>
        </AppBar>

        <main
          className="flex-grow-1"
          style={{ backgroundColor: "#ffffffff" }}
        >
          <div style={{ zoom: "0.9", padding: "2em", overflow:"scroll"}}>
            <Outlet />
          </div>
        </main>

      </Box>

      <div
        className="modal fade"
        id="account-setting"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
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

export default AdminLayout;
