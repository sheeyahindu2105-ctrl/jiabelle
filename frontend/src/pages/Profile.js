import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch {
    user = null;
  }

  const API =
    process.env.REACT_APP_API_URL ||
    "https://jiabelle-backend.onrender.com";

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const userId = user?._id || user?.id;

  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cart: 0,
  });

  const [showSection, setShowSection] = useState("menu");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    newPassword: "",
    oldPassword: "",
    avatarFile: null,
    removeAvatar: false,
  });

  /* ================= LOAD STATS ================= */

  useEffect(() => {
    if (!userId) return;

    const wishlistData = JSON.parse(
      localStorage.getItem(`wishlist_${userId}`) || "[]"
    );

    const cartData = JSON.parse(
      localStorage.getItem(`cart_${userId}`) || "[]"
    );

    fetch(`${API}/api/orders/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          orders: Array.isArray(data) ? data.length : 0,
          wishlist: wishlistData.length,
          cart: cartData.length,
        });
      })
      .catch(() => {
        setStats({
          orders: 0,
          wishlist: wishlistData.length,
          cart: cartData.length,
        });
      });
  }, [API, token, userId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
    /* ================= IMAGE UPLOAD ================= */

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      avatar: URL.createObjectURL(file),
      avatarFile: file,
      removeAvatar: false,
    }));
  };

  /* ================= REMOVE IMAGE ================= */

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      avatar: "",
      avatarFile: null,
      removeAvatar: true,
    }));
  };

  /* ================= SAVE PROFILE ================= */

  const saveProfile = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);

      if (form.avatarFile) {
        formData.append("avatar", form.avatarFile);
      }

      if (form.removeAvatar) {
        formData.append("removeAvatar", "true");
      }

      const res = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Profile update failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      setForm({
        name: data.name,
        email: data.email,
        avatar: data.avatar || "",
        newPassword: "",
        oldPassword: "",
        avatarFile: null,
        removeAvatar: false,
      });

      alert("Profile updated successfully");

      setShowSection("menu");
    } catch (err) {
      console.error(err);
      alert("Profile update failed");
    }
  };

  /* ================= CHANGE PASSWORD ================= */

  const changePassword = async () => {
    if (!form.oldPassword || !form.newPassword) {
      alert("All password fields required");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Password updated successfully");

      setForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
      }));

      setShowSection("menu");
    } catch (err) {
      console.error(err);
      alert("Password change failed");
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (!user) return null;

  const avatarImage =
    form.removeAvatar ? "" : form.avatar || user?.avatar;
      return (
    <div className="account-container">

      {/* LEFT */}
      <div className="profile-card">

        {avatarImage ? (
          <img
            src={avatarImage}
            alt="Profile"
            className="profile-photo"
          />
        ) : (
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}

        <h3>{form.name}</h3>
        <p>{form.email}</p>

        <button
          className="edit-btn"
          onClick={() => setShowSection("edit")}
        >
          Edit Profile
        </button>

        <div className="profile-stats">

          <div>
            <h2>{stats.orders}</h2>
            <p>Orders</p>
          </div>

          <div>
            <h2>{stats.wishlist}</h2>
            <p>Wishlist</p>
          </div>

          <div>
            <h2>{stats.cart}</h2>
            <p>Cart</p>
          </div>

        </div>

      </div>

      {/* RIGHT */}

      <div className="account-box">

        <h2>My Account</h2>

        {/* EDIT PROFILE */}

        {showSection === "edit" && (

          <div className="profile-section">

            <button
              className="back-btn"
              onClick={() => setShowSection("menu")}
            >
              ← Back
            </button>

            <h3>Edit Profile</h3>

            <div className="edit-profile-form">

              <input
                type="file"
                onChange={handleImageUpload}
              />

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              {avatarImage && (
                <button
                  type="button"
                  className="remove-img-btn"
                  onClick={removeImage}
                >
                  Remove Photo
                </button>
              )}

              <input
                type="email"
                value={form.email}
                disabled
              />

              <button onClick={saveProfile}>
                Save Changes
              </button>

            </div>

          </div>

        )}

        {/* CHANGE PASSWORD */}

        {showSection === "password" && (

          <div className="profile-section">

            <button
              className="back-btn"
              onClick={() => setShowSection("menu")}
            >
              ← Back
            </button>

            <h3>Change Password</h3>

            <input
              type="password"
              name="oldPassword"
              placeholder="Current Password"
              value={form.oldPassword}
              onChange={handleChange}
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
            />

            <button onClick={changePassword}>
              Update Password
            </button>

          </div>

        )}
                {/* MENU */}

        {showSection === "menu" && (

          <div className="account-menu">

            <div onClick={() => navigate("/orders")}>
              👜 My Orders
            </div>

            <div onClick={() => navigate("/wishlist")}>
              ❤️ Wishlist
            </div>

            <div onClick={() => navigate("/cart")}>
              🛒 Cart
            </div>

            <div onClick={() => setShowSection("password")}>
              🔒 Change Password
            </div>

          </div>

        )}

        <button
          className="logout"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;