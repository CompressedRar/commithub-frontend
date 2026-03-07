import { useEffect, useState, useMemo } from "react";
import { readNotification } from "../services/userService";
import { Box, Button, Icon, Paper, Stack, Typography } from "@mui/material";

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
          className="modal-content border-0 shadow-lgoverflow-hidden position-relative"
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

          <Box sx={{ width: '100%', mx: 'auto', borderRadius: 2, overflow: 'hidden' }}>
      
     
            <Box sx={{ 
              bgcolor: 'primary.lighter', 
              px: 4, 
              py: 3, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              width:"100%" 
            }} >
              <Icon className="material-symbols-outlined" sx={{ color: 'primary.main' }}>
                notifications
              </Icon>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 0 }}>
                Notifications
              </Typography>
            </Box>
          
            <Box sx={{ 
              p: 4, 
              bgcolor: 'background.paper', 
              maxHeight: '500px', 
              overflowY: 'auto', 
              borderTop: '1px solid',
              borderColor: 'divider' // Replaces #e9ecef
            }}>
              {sorted.length > 0 ? (
                <Stack spacing={3}>
                  {visible.map((notif, index) => (
                    <Paper
                      key={notif.id || index}
                      elevation={0}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        transition: 'all 0.2s ease',
                        // Conditional styling based on 'read' status
                        bgcolor: notif.read ? 'white' : 'primary.lighter',
                        borderColor: notif.read ? 'divider' : 'primary.light',
                        '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Icon className="material-symbols-outlined" sx={{ color: 'primary.main' }}>
                            notifications_active
                          </Icon>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {notif.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <Icon className="material-symbols-outlined" sx={{ fontSize: '16px' }}>
                            schedule
                          </Icon>
                          <Typography variant="caption">
                            {notif.created_at}
                          </Typography>
                        </Box>
                      </Box>

                      {notif.message && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: '34px' }}>
                          {notif.message}
                        </Typography>
                      )}
                    </Paper>
                  ))}

                  {/* Pagination Buttons */}
                  {sorted.length > visibleCount && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                      <Button variant="text" onClick={() => setVisibleCount(v => v + 10)}>
                        Load more
                      </Button>
                      <Button variant="text" onClick={() => setVisibleCount(sorted.length)}>
                        Show all
                      </Button>
                    </Box>
                  )}
                </Stack>
              ) : (
                /* Empty State */
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                  <Icon 
                    className="material-symbols-outlined" 
                    sx={{ fontSize: '3rem', mb: 2, opacity: 0.5 }}
                  >
                    notifications_off
                  </Icon>
                  <Typography variant="body1">No notifications yet</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
