import { Navigate, Outlet, NavLink } from "react-router-dom";
import "../assets/styles/Main.css";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAccountInfo, getAccountNotification, readNotification } from "../services/userService";
import AccountSettings from "../components/UsersComponents/AccountSettings";
import NotificationModal from "../components/NotificationModal";
import { socket } from "../components/api";
import { getSettings } from "../services/settingsService";


function FacultyLayout() {
  const token = localStorage.getItem("token");
  const [role, setRole] = useState(null);
  const [profilePictureLink, setProfilePictureLink] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [options, setOptions] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 🔹 Handle responsive resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Fetch notifications
  async function loadNotification(user_id) {
    try {
      const res = await getAccountNotification(user_id);
      setNotifications(res.data.toReversed());
    } catch (error) {
      console.error(error);
    }
  }

  // 🔹 Decode token
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
        
      }
      catch(error){
        console.error(error);
      }
    }

  // 🔹 Logout
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
  if (role && role !== "faculty") return <Navigate to="/unauthorized" replace />;

  // ✅ Handle notification open (mark as read)
  const handleOpenNotification = () => {
    const newState = !openNotif;
    setOpenNotif(newState);

    if (newState && notifications.length > 0) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        readNotification(unreadIds)
          .then(() => {
            setNotifications((prev) =>
              prev.map((n) => ({
                ...n,
                read: unreadIds.includes(n.id) ? true : n.read,
              }))
            );
          })
          .catch((err) => console.error("Failed to mark notifications as read:", err));
      }
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row vh-100 overflow-scroll bg-light">
      {/* 🔹 Sidebar */}
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
              { href: "/faculty/ipcr", icon: "article", text: "My IPCR" }
            ].map((item, idx) => (
              <li key={idx}>
                <NavLink
                  to={item.href}
                  end
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-2 px-3 py-3 ${
                      isActive ? "active-nav" : ""
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.text}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {!sidebarCollapsed && !isMobile && (
          <div className="text-center small text-muted mt-3">
            CommitHub Faculty © 2025
          </div>
        )}
      </nav>

      {/* 🔹 Overlay for mobile */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-25"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}

      {/* 🔹 Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: !isMobile ? (sidebarCollapsed ? "70px" : "250px") : "0",
          transition: "margin 0.3s ease",
        }}
      >
        <header className="d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom shadow-sm w-100" style={{zIndex:1000}}>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
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
                style={{ top: "60px", right: "20px", width: "auto", zIndex: "1000" }}
                onMouseLeave={() => setOptions(false)}
              >
                <button
                  className="btn btn-light w-100 text-start d-flex align-items-center gap-2"
                  data-bs-toggle="modal"
                  data-bs-target="#account-setting"
                >
                  <span className="material-symbols-outlined">
                    manage_accounts
                  </span>
                  Account Settings
                </button>
                <button
                  className="btn btn-light w-100 text-start d-flex align-items-center gap-2 text-danger"
                  onClick={Logout}
                >
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 🔹 Content */}
        <main
          className="flex-grow-1"
          style={{ backgroundColor: "#ffffffff", zIndex:700}}
        >
          <div style={{scale:"0.9" }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Account Settings Modal */}
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

export default FacultyLayout;
