import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAccountNotification, readNotification } from "../services/userService";
import AccountSettings from "../components/UsersComponents/AccountSettings";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styles/Main.css";
import NotificationModal from "../components/NotificationModal";

function PresidentLayout() {
  const token = localStorage.getItem("token");
  const [role, setRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [profilePictureLink, setProfilePictureLink] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [options, setOptions] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Load Notifications
  async function loadNotification(user_id) {
    try {
      const res = await getAccountNotification(user_id);
      setNotifications(res.data.toReversed());
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }

  // ✅ Decode token
  function readTokenInformation() {
    try {
      const payload = jwtDecode(token);
      setRole(payload.role || null);
      setUserInfo(payload);
      setProfilePictureLink(payload.profile_picture_link);
      loadNotification(payload.id);
    } catch (err) {
      console.error("Token decoding failed:", err);
    }
  }

  useEffect(() => {
    if (!token) return;
    readTokenInformation();
  }, []);

  // ✅ Logout
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

  // ✅ Handle Notifications
  async function handleNotificationToggle() {
    const newState = !openNotif;
    setOpenNotif(newState);
    if (newState && notifications.length > 0) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        try {
          await readNotification(unreadIds);
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

  // ✅ Role-based guard
  if (!token) return <Navigate to="/" replace />;
  if (role && role !== "president") return <Navigate to="/unauthorized" replace />;

  return (
    <div className="d-flex flex-column flex-md-row vh-100 overflow-hidden bg-light">
      {/* Sidebar */}
      <nav
        className={`sidebar bg-white border-end shadow-sm d-flex flex-column justify-content-between position-fixed ${
          isMobile
            ? sidebarCollapsed
              ? "translate-x-full"
              : "translate-x-0"
            : ""
        }`}
        style={{
          width: sidebarCollapsed && !isMobile ? "70px" : "250px",
          left: isMobile && sidebarCollapsed ? "-250px" : "0",
          top: "0",
          bottom: "0",
          transition: "all 0.3s ease",
          zIndex: 1050,
        }}
      >
        <div>
          <div className="text-center my-3">
            <img
              src={`${import.meta.env.BASE_URL}CommitHub.png`}
              alt="CommitHub"
              className="img-fluid"
              style={{
                maxWidth: sidebarCollapsed && !isMobile ? "40px" : "180px",
                transition: "all 0.3s ease",
              }}
            />
          </div>

          <ul className="nav flex-column gap-2 sidebar-nav">
            {[
              { href: "/president/dashboard", icon: "dashboard", text: "Dashboard" },
              { href: "/president/department", icon: "apartment", text: "Offices" },
              { href: "/president/tasks", icon: "task", text: "Key Result Areas" },
              { href: "/president/ipcr", icon: "assignment_ind", text: "IPCR" },
            ].map((item, idx) => (
              <li key={idx}>
                <a
                  href={item.href}
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-3 ${
                    window.location.pathname === item.href ? "active-nav" : ""
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.text}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {!sidebarCollapsed && !isMobile && (
          <div className="text-center small text-muted mt-3 mb-3">
            CommitHub President © 2025
          </div>
        )}
      </nav>

      {/* Overlay for mobile */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-25"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: !isMobile ? (sidebarCollapsed ? "70px" : "250px") : "0",
          transition: "margin 0.3s ease",
        }}
      >
        {/* Header */}
        <header className="d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h5 className="fw-bold mb-0">
              {window.location.pathname.split("/")[2]
                ? window.location.pathname.split("/")[2].charAt(0).toUpperCase() +
                  window.location.pathname.split("/")[2].slice(1)
                : "Dashboard"}
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Notifications */}
            <div className="position-relative">
              <span
                className="material-symbols-outlined fs-4 cursor-pointer position-relative"
                data-bs-toggle="modal"
                data-bs-target="#notification-modal"
              >
                notifications
                {notifications.some((n) => !n.read) && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                    style={{ width: "10px", height: "10px" }}
                  ></span>
                )}
              </span>

              {openNotif && (
                <div
                  className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm p-3"
                  style={{ width: "300px", zIndex: "1000" }}
                >
                  <h6 className="fw-semibold mb-2">Notifications</h6>
                  <div
                    className="d-flex flex-column gap-2"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notif, index) => (
                        <div
                          key={index}
                          className={`p-2 border rounded ${
                            notif.read ? "bg-light" : "bg-primary bg-opacity-10"
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <strong>{notif.name}</strong>
                            {!notif.read && (
                              <span className="badge bg-danger rounded-circle p-2"></span>
                            )}
                          </div>
                          <small className="text-muted">{notif.created_at}</small>
                        </div>
                      ))
                    ) : (
                      <small className="text-muted">No notifications</small>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div
              className="d-flex align-items-center gap-2 cursor-pointer"
              onClick={() => setOptions(!options)}
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
                <div className="d-flex flex-column">
                  <span className="fw-semibold">
                    {userInfo?.first_name} {userInfo?.last_name}
                  </span>
                  <small className="text-muted">
                    {userInfo?.department?.name || ""}
                  </small>
                </div>
              )}
            </div>

            {/* Dropdown */}
            {options && (
              <div
                className="position-absolute bg-white border rounded shadow-sm p-2"
                style={{ top: "60px", right: "20px", width: "180px", zIndex: "1000" }}
                onMouseLeave={() => setOptions(false)}
              >
                <button
                  className="btn btn-light w-100 text-start d-flex align-items-center gap-2"
                  data-bs-toggle="modal"
                  data-bs-target="#account-setting"
                >
                  <span className="material-symbols-outlined">manage_accounts</span>
                  Account Settings
                </button>
                <button
                  className="btn btn-light w-100 text-start d-flex align-items-center gap-2 text-danger"
                  onClick={Logout}
                >
                  <span className="material-symbols-outlined">logout</span> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow-1 overflow-auto p-2" style={{ backgroundColor: "#f1f1f1ff" }}>
          <Outlet />
        </main>
      </div>

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
              <h5 className="modal-title">Account Settings</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
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

export default PresidentLayout;
