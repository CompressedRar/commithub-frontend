import { useEffect, useState, useMemo } from "react";
import { readNotification } from "../services/userService";

function NotificationModal({ notifications = [], setNotifications }) {
  const [visibleCount, setVisibleCount] = useState(10);

  // sort notifications by created_at desc
  const sorted = useMemo(() => {
    return [...(notifications || [])].sort((a, b) => {
      const ta = new Date(a.created_at).getTime() || 0;
      const tb = new Date(b.created_at).getTime() || 0;
      return tb - ta;
    });
  }, [notifications]);

  const visible = sorted.slice(0, visibleCount);

  // mark unread notifications among visible ones as read only when the modal is actually shown
  useEffect(() => {
    const modalEl = document.getElementById("notification-modal");
    if (!modalEl) return;

    const handler = () => {
      const unreadIds = (visible || []).filter(n => !n.read).map(n => n.id);
      if (!unreadIds || unreadIds.length === 0) return;

      readNotification(unreadIds)
        .then(() => {
          setNotifications(prev =>
            prev.map(n => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
          );
        })
        .catch(err => console.error("Failed to read notifications:", err));
    };

    modalEl.addEventListener("shown.bs.modal", handler);
    return () => modalEl.removeEventListener("shown.bs.modal", handler);
  }, [visible, setNotifications]);

  return (
    <div
      className="modal fade"
      id="notification-modal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="notificationModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg rounded-4 overflow-hidden position-relative"
          style={{ backgroundColor: "#f9fafb" }}
        >
          {/* 🔹 Floating Close Button */}
          <button
            type="button"
            className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            data-bs-dismiss="modal"
            aria-label="Close"
            style={{
              width: "36px",
              height: "36px",
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* 🔹 Header */}
          <div className="bg-primary bg-opacity-10 px-4 py-3 border-0">
            <h5 className="modal-title fw-semibold d-flex align-items-center gap-2 text-primary mb-0">
              <span className="material-symbols-outlined">notifications</span>
              Notifications
            </h5>
          </div>

          {/* 🔹 Body */}
          <div
            className="modal-body p-4 bg-white"
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              borderTop: "1px solid #e9ecef",
            }}
          >
            {sorted.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {visible.map((notif, index) => (
                  <div
                    key={notif.id || index}
                    className={`p-3 border rounded-3 d-flex flex-column gap-1 ${
                      notif.read
                        ? "bg-white"
                        : "bg-primary bg-opacity-10 border-primary border-opacity-25"
                    }`}
                    style={{
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                          notifications_active
                        </span>
                        <strong>{notif.name}</strong>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-flex align-items-center gap-1">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "16px" }}
                          >
                            schedule
                          </span>
                          {notif.created_at}
                        </small>
                      </div>
                    </div>
                    {notif.message && (
                      <small className="text-secondary text-wrap">
                        {notif.message}
                      </small>
                    )}
                  </div>
                ))}

                {sorted.length > visibleCount && (
                  <div className="text-center mt-3">
                    <button className="btn btn-link" onClick={() => setVisibleCount(v => v + 10)}>
                      Load more
                    </button>
                    <button className="btn btn-link" onClick={() => setVisibleCount(sorted.length)}>
                      Show all
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                <span className="material-symbols-outlined fs-1 mb-2 text-secondary opacity-50">
                  notifications_off
                </span>
                <p className="m-0">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
