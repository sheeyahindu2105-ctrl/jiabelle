import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "../styles/Navbar.css";

function Navbar({ search = "", setSearch, products = [] }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [showLogin, setShowLogin] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [showPopup, setShowPopup] = useState("");

  const loginRef = useRef(null);
  const moreRef = useRef(null);
  const socketRef = useRef(null);

  /* ⭐ SEARCH STATES */
  const [suggestions, setSuggestions] = useState([]);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const requireLogin = (path) => {
    if (!token) {
      navigate("/login", { state: { redirectTo: path } });
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/home", { replace: true });
    window.location.reload();
  };

  /* ================= FETCH NOTIFICATION COUNT ================= */

  useEffect(() => {

    const fetchCount = async () => {

      if (!token) return;

      try {

        const res = await fetch(`${API}/api/notifications/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setNotifCount(data.count || 0);

      } catch (err) {

        console.error("Notification count error", err);

      }

    };

    fetchCount();

  }, [token, API]);

  /* ================= SOCKET CONNECTION ================= */

  useEffect(() => {

    if (!user?._id) return;

    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("join", user._id);

    socketRef.current.on("newNotification", () => {
      setNotifCount((prev) => prev + 1);
    });

    return () => {
      socketRef.current.disconnect();
    };

  }, [user]);

  /* ================= CLOSE DROPDOWN WHEN CLICK OUTSIDE ================= */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setShowLogin(false);
      }

      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setShowMore(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  /* ================= OPEN NOTIFICATIONS ================= */

  const openNotifications = () => {

    setNotifCount(0);

    requireLogin("/notifications");

  };

  /* ⭐ SEARCH FUNCTION */

const handleSearch = (value) => {

  setSearch(value);

  if (value.length > 0) {

    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered.slice(0,5));

  } else {

    setSuggestions([]);

  }

};
  return (

    <div className="navbar">

      {/* LOGO */}

      <div className="logo" onClick={() => navigate("/home")}>
        JIA BELLE
      </div>

      {/* ⭐ SEARCH BAR WITH SUGGESTIONS */}

      <div style={{ position: "relative" }}>

        <input
          className="search-bar"
          placeholder="Search handbags..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {suggestions.length > 0 && (

          <div className="search-suggestions">

            {suggestions.map(item => (
              <div
                key={item._id}
                className="suggestion-item"
onClick={() => navigate(`/product/${item._id}`, { state: item })}              >
                {item.name}
              </div>
            ))}

          </div>

        )}

      </div>

      <div className="nav-right">

        {/* NOTIFICATIONS */}

        <div
          className="nav-item"
          style={{ position: "relative", cursor: "pointer" }}
          onClick={openNotifications}
        >
          🔔

          {notifCount > 0 && (
            <span className="notif-badge">
              {notifCount}
            </span>
          )}

        </div>

        {/* LOGIN */}

        <div
          className="nav-item"
          ref={loginRef}
          onClick={() => setShowLogin(!showLogin)}
        >

          {token ? `Hello, ${user?.name}` : "Login"}

          {showLogin && (

            <div className="dropdown">

              {!token && (
                <div className="signup">
                  New customer?
                  <span onClick={() => navigate("/signup")}>
                    Sign Up
                  </span>
                </div>
              )}

              {token && (
                <>
                  <div onClick={() => requireLogin("/profile")}>
                    My Profile
                  </div>

                  <div onClick={() => requireLogin("/orders")}>
                    Orders
                  </div>

                  {user?.role === "user" && (
                    <div onClick={() => requireLogin("/wishlist")}>
                      Wishlist
                    </div>
                  )}
                </>
              )}

              {user?.role === "user" && (
                <div onClick={() => requireLogin("/become-seller")}>
                  Become a Seller
                </div>
              )}

              {user?.role === "seller" && (
                <div onClick={() => navigate("/seller-dashboard")}>
                  Seller Dashboard
                </div>
              )}

              {user?.role === "admin" && (
                <div onClick={() => navigate("/admin/dashboard")}>
                  Admin Dashboard
                </div>
              )}

              {token && (
                <div
                  style={{ color: "red", fontWeight: "bold" }}
                  onClick={handleLogout}
                >
                  Logout
                </div>
              )}

            </div>

          )}

        </div>

        {/* MORE */}

        <div
          className="nav-item"
          ref={moreRef}
          onClick={() => setShowMore(!showMore)}
        >

          More

          {showMore && (
            <div className="dropdown">

              <div onClick={() => { setShowPopup("notifications"); setShowMore(false); }}>
                🔔 Notification Settings
              </div>

              <div onClick={() => { setShowPopup("support"); setShowMore(false); }}>
                📞 24x7 Customer Care
              </div>

              <div onClick={() => { setShowPopup("advertise"); setShowMore(false); }}>
                📢 Advertise
              </div>

            </div>
          )}

        </div>

        {/* CART */}

        {user?.role !== "seller" && user?.role !== "admin" && (
          <div
            className="nav-item"
            onClick={() => navigate("/cart")}
          >
            Cart
          </div>
        )}

      </div>

      {/* POPUPS */}

      {showPopup === "notifications" && (
        <div className="popup" onClick={() => setShowPopup("")}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Notification Settings</h3>
            <p>Manage alerts and updates.</p>
            <ul>
              <li>Order Updates</li>
              <li>Delivery Notifications</li>
              <li>Promotional Offers</li>
            </ul>
            <button onClick={() => setShowPopup("")}>Close</button>
          </div>
        </div>
      )}

      {showPopup === "support" && (
        <div className="popup">
          <div className="popup-box">
            <h3>24x7 Customer Care</h3>

            <p>
              <strong>Phone:</strong> +91 9876543210
            </p>

            <p>
              <strong>Email:</strong> support@jiabelle.com
            </p>

            <button onClick={() => setShowPopup("")}>
              Close
            </button>
          </div>
        </div>
      )}

      {showPopup === "advertise" && (
        <div className="popup" onClick={() => setShowPopup("")}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Advertise With Us</h3>
            <p>Promote your products to thousands of customers.</p>
            <button onClick={() => navigate("/become-seller")}>
              Start Advertising
            </button>
            <br />
            <button onClick={() => setShowPopup("")}>Close</button>
          </div>
        </div>
      )}

    </div>

  );
}

export default Navbar;