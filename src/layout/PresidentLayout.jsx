import { Navigate, Outlet } from "react-router-dom";
import "../assets/styles/Main.css";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAccountNotification, readNotification } from "../services/userService";
import AccountSettings from "../components/UsersComponents/AccountSettings";

function PresidentLayout() {
  const token = localStorage.getItem("token");
  const [profilePictureLink, setProfile] = useState("");
  const [role, setRole] = useState(null);
  const [options, setOptions] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function loadNotification(user_id) {
    try {
      const res = await getAccountNotification(user_id).then((data) => data.data);
      setNotifications(res.toReversed());
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }

  // ✅ Mark notifications as read when opened
  async function handleNotificationToggle() {
    const newState = !openNotif;
    setOpenNotif(newState);

    // Only mark as read when opening the panel
    if (newState && notifications.length > 0) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        try {
          await readNotification(unreadIds);
          // Optimistically update UI
          setNotifications((prev) =>
            prev.map((n) => ({
              ...n,
              read: unreadIds.includes(n.id) ? true : n.read,
            }))
          );
        } catch (err) {
          console.error("Error marking notifications as read:", err);
        }
      }
    }
  }

  function readTokenInformation() {
    try {
      const payload = jwtDecode(token);
      console.log("token:", payload);
      setProfile(payload.profile_picture_link);
      setRole(payload.role || null);
      setUserInfo(payload);
      loadNotification(payload.id);
    } catch (err) {
      console.error(err);
    }
  }

  if (!token) return <Navigate to="/" replace />;
  if (role && role !== "president") window.location.href = "/unauthorized";

  function Logout() {
    Swal.fire({
      title: "Logout",
      text: "Do you want to logout?",
      showDenyButton: true,
      confirmButtonText: "Logout",
      denyButtonText: "No",
      icon: "warning",
      customClass: {
        actions: "my-actions",
        confirmButton: "order-2",
        denyButton: "order-1 right-gap",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.reload();
      }
    });
  }

  function detectCurrentPage(path) {
    const current = window.location.pathname.replaceAll("/", "").toLowerCase();
    return current.includes(path.toLowerCase())
      ? { backgroundColor: "rgba(85, 130, 255, 0.2)", color: "var(--primary-color)" }
      : {};
  }

  useEffect(() => {
    readTokenInformation();
  }, []);

  return (
    <div className={`main-layout-container ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      {/* Account Settings Modal */}
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
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {userInfo && <AccountSettings id={userInfo.id} />}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar-container ${sidebarOpen ? "open" : "closed"}`}>
        <div className="logo-container">
          <img src={`${import.meta.env.BASE_URL}CommitHub-Banner.png`} alt="Logo" />
        </div>

        <a className="pages" href="/president/dashboard" style={detectCurrentPage("dashboard")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>

        <a className="pages" href="/president/department" style={detectCurrentPage("department")}>
          <span className="material-symbols-outlined">apartment</span>
          <span>Offices</span>
        </a>

        <a className="pages" href="/president/tasks" style={detectCurrentPage("tasks")}>
          <span className="material-symbols-outlined">task</span>
          <span>Key Result Areas</span>
        </a>

        <a className="pages" href="/president/review" style={detectCurrentPage("review")}>
          <span className="material-symbols-outlined">pageview</span>
          <span>Pending Review</span>
        </a>

        <a className="pages" href="/president/approve" style={detectCurrentPage("approve")}>
          <span className="material-symbols-outlined">approval</span>
          <span>Pending Approval</span>
        </a>

        <a className="pages" href="/president/ipcr" style={detectCurrentPage("ipcr")}>
          <span className="material-symbols-outlined">assignment_ind</span>
          <span>IPCR</span>
        </a>

        <div className="pages logout" onClick={Logout}>
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </div>
      </aside>

      {/* Header */}
      <header className="header-container">
        <div className="current-location">
          <div className="menu-container" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-symbols-outlined">menu</span>
          </div>
          <div className="current-page-container">
            <span className="page">
              {window.location.pathname.split("/")[2]
                ? window.location.pathname.split("/")[2].charAt(0).toUpperCase() +
                  window.location.pathname.split("/")[2].slice(1)
                : "Dashboard"}
            </span>
          </div>
        </div>

        <div className="current-info">
          {/* Notifications */}
          <div className="notification-container">
            <span className="material-symbols-outlined" onClick={handleNotificationToggle}>
              notifications
            </span>

            <div
              className="all-notification"
              style={openNotif ? { display: "flex" } : { display: "none" }}
              onMouseLeave={() => setOpenNotif(false)}
            >
              <h3>Notifications</h3>
              {notifications.length > 0 ? (
                notifications.map((notif, i) => (
                  <div key={i} className={`notif ${notif.read ? "" : "unread"}`}>
                    <div className="notif-header">
                      {!notif.read && <span className="unread-dot"></span>}
                      <span>{notif.name}</span>
                    </div>
                    <span className="notif-date">{notif.created_at}</span>
                  </div>
                ))
              ) : (
                <div className="notif-empty">No notifications</div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="account-informations">
            <span>{userInfo?.first_name + " " + userInfo?.last_name}</span>
            <span className="current-department">{userInfo?.department?.name || ""}</span>
          </div>

          {/* Profile */}
          <div className="profile-containers" onClick={() => setOptions(!options)}>
            <div className="profile-image-container">
              <img src={profilePictureLink} alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      {/* Account Options */}
      {options && (
        <div className="header-options" onMouseLeave={() => setOptions(false)}>
          <div className="header-option" data-bs-toggle="modal" data-bs-target="#account-setting">
            <span className="material-symbols-outlined">manage_accounts</span>
            <span>Account Setting</span>
          </div>
          <div className="header-option" onClick={Logout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content-container">
        <Outlet />
      </main>
    </div>
  );
}

export default PresidentLayout;
