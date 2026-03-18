import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

function Account() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <p>Please login</p>;

  return (
    <div className="profile-page">
      <h2>My Account</h2>

      <div className="profile-card">
        <button onClick={() => navigate("/profile")}>
          👤 Edit Profile
        </button>

        <button onClick={() => navigate("/orders")}>
          📦 My Orders
        </button>

        <button onClick={() => navigate("/wishlist")}>
          ❤️ Wishlist
        </button>

        <button onClick={() => navigate("/cart")}>
          🛒 Cart
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Account;
