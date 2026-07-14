import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "../styles/Navbar.css";

function Navbar({ search = "", setSearch, products = [] }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [showLogin, setShowLogin] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const loginRef = useRef(null);
  const socketRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);

  const API =
  process.env.REACT_APP_API_URL ||
  "https://jiabelle-backend.onrender.com";

  /* ================= LOGIN CHECK ================= */
  const requireLogin = (path) => {
    if (!token) {
      navigate("/login", { state: { redirectTo: path } });
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/home");
    window.location.reload();
  };

  /* ================= NOTIFICATIONS ================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/notifications/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setNotifCount(data.count || 0))
      .catch(() => {});
 }, [API, token]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io(API);

    socketRef.current.emit("join", user._id);

    socketRef.current.on("newNotification", () => {
      setNotifCount((prev) => prev + 1);
    });

    return () => socketRef.current.disconnect();
  }, [user, API]);

  /* ================= WISHLIST COUNT ================= */
  useEffect(() => {
    const userId = user?._id || user?.id;
    const key = userId ? `wishlist_${userId}` : "wishlist_guest";

    const saved = JSON.parse(localStorage.getItem(key)) || [];
    setWishlistCount(saved.length);
  }, [user]);

  /* ================= CART COUNT ================= */
  useEffect(() => {
    const userId = user?._id || user?.id;
    const key = userId ? `cart_${userId}` : "cart_guest";

    const saved = JSON.parse(localStorage.getItem(key)) || [];
    setCartCount(saved.length);
  }, [user]);

  /* ================= SEARCH ================= */
  const handleSearch = (value) => {
    setSearch(value);

    if (value.length > 0) {
      const filtered = products.filter((p) =>
        p.name?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setShowLogin(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      {/* LOGO */}
      <div className="logo" onClick={() => navigate("/home")}>
        JIA BELLE
      </div>

      {/* SEARCH */}
      <div className="search-container">
        <input
          className="search-bar"
          placeholder="Search handbags..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((item) => (
              <div
                key={item._id}
                className="suggestion-item"
                onClick={() =>
                  navigate(`/product/${item._id}`, { state: item })
                }
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">

        {/* 🔔 NOTIFICATION */}
        <div className="nav-icon" onClick={() => requireLogin("/notifications")}>
          🔔
          {notifCount > 0 && <span className="badge">{notifCount}</span>}
        </div>

        {/* ❤️ WISHLIST */}
        <div className="nav-icon" onClick={() => requireLogin("/wishlist")}>
          ❤️
          {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
        </div>

        {/* 👤 USER */}
        <div
          className="nav-user"
          ref={loginRef}
          onClick={() => setShowLogin(!showLogin)}
        >
          {token ? `Hello, ${user?.name}` : "Login"}

          {showLogin && (
            <div className="dropdown">
              {!token && (
                <div onClick={() => navigate("/signup")}>Sign Up</div>
              )}

              {token && (
                <>
                  <div onClick={() => navigate("/profile")}>My Profile</div>
                  <div onClick={() => navigate("/orders")}>Orders</div>
                </>
              )}

              {token && (
                <div className="logout" onClick={handleLogout}>
                  Logout
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🛒 CART (emoji only, clean UI) */}
        {user?.role !== "seller" && user?.role !== "admin" && (
          <div className="nav-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </div>
        )}

      </div>
    </div>
  );
}

export default Navbar;