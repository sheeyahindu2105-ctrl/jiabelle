import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "../styles/notifications.css";

function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

const API =
  process.env.REACT_APP_API_URL ||
  "https://jiabelle-backend.onrender.com";  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= SOCKET CONNECTION ================= */

  useEffect(() => {

    const newSocket = io(API);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };

 }, [API]);

  /* ================= JOIN USER ROOM ================= */

  useEffect(() => {

    if (socket && user?._id) {
      socket.emit("join", user._id);
    }

  }, [socket, user]);

  /* ================= REAL TIME LISTENER ================= */

  useEffect(() => {

    if (!socket) return;

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off("newNotification");
    };

  }, [socket]);

  /* ================= FETCH NOTIFICATIONS ================= */

  const fetchNotifications = useCallback(async () => {

    try {

      const res = await fetch(`${API}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setNotifications(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("Notification fetch error", err);

    }

  }, [API, token]);

  useEffect(() => {

    fetchNotifications();

  }, [fetchNotifications]);

  /* ================= MARK SINGLE AS READ ================= */

  const markSingleAsRead = async (id) => {

    try {

      await fetch(`${API}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

    } catch (err) {

      console.error("Mark read error", err);

    }

  };

  /* ================= MARK ALL AS READ ================= */

  const markAllAsRead = async () => {

    try {

      await fetch(`${API}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

    } catch (err) {

      console.error("Mark all read error", err);

    }

  };

  /* ================= ICON TYPES ================= */

  const getIcon = (type) => {

    if (type === "wishlist") return "❤️";
    if (type === "cart") return "🛒";
    if (type === "order") return "📦";
    if (type === "product") return "🆕";
    if (type === "stock") return "⚠️";
    if (type === "admin") return "🛑";

    return "🔔";
  };

  /* ================= CLICK HANDLER ================= */

  const handleNotificationClick = (n) => {

    markSingleAsRead(n._id);

    if (n.type === "order") {
      window.location.href = "/orders";
    }

    if (n.type === "product") {
      window.location.href = "/seller/products";
    }

  };

  return (

    <div className="notifications-container">

      <div className="notifications-header">

        <h2 className="notifications-title">Notifications</h2>

        <button
          className="mark-read-btn"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>

      </div>

      {notifications.length === 0 && (
        <p className="empty-text">No notifications yet.</p>
      )}

      <div className="notifications-list">

        {notifications.map((n) => (

          <div
            key={n._id}
            className={`notification-card ${n.isRead ? "" : "notification-unread"}`}
            onClick={() => handleNotificationClick(n)}
          >

            <div className="notification-icon">
              {getIcon(n.type)}
            </div>

            <div className="notification-body">

              <p className="notification-message">
                {n.message}
              </p>

              <span className="notification-time">
                {new Date(n.createdAt).toLocaleString()}
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Notifications;