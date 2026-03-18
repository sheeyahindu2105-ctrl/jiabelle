import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BecomeSeller.css";

function BecomeSeller() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= GET FRESH USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage("❌ Unable to load user data");
          setLoading(false);
          return;
        }

        // 🔥 ALWAYS update localStorage
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);

        if (data.role === "seller") {
          setMessage(
            "✅ You are already a seller. Please use the seller dashboard."
          );
        } else if (data.sellerStatus === "pending") {
          setMessage("⏳ Your seller request is under review.");
        } else if (data.sellerStatus === "approved") {
          setMessage("✅ Your seller request has been approved.");
        } else if (data.sellerStatus === "rejected") {
          setMessage("❌ Your seller request was rejected.");
        }

        setLoading(false);
      } catch (err) {
        setMessage("❌ Server error");
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  /* ================= LOADING ================= */
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  /* ================= MESSAGE ONLY ================= */
  if (
    user?.role === "seller" ||
    user?.sellerStatus === "pending" ||
    user?.sellerStatus === "approved" ||
    user?.sellerStatus === "rejected"
  ) {
    return (
      <div className="become-seller-container">
        <h2>Become a Seller</h2>
        <p className="message">{message}</p>

        {user?.role === "seller" && (
          <button onClick={() => navigate("/seller-dashboard")}>
            Go to Seller Dashboard
          </button>
        )}
      </div>
    );
  }

  /* ================= ONLY NEW USER SEES FORM ================= */
  return (
    <div className="become-seller-container">
      <h2>Become a Seller</h2>
      <p>Apply to start selling your products.</p>

      <form
        className="become-seller-form"
        onSubmit={async (e) => {
          e.preventDefault();

          const formData = {
            shopName: e.target.shopName.value,
            phone: e.target.phone.value,
          };

          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/seller-requests`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(formData),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            setMessage(data.message || "Request failed");
            return;
          }

          setMessage("✅ Seller request submitted. Please wait for approval.");
        }}
      >
        <input name="shopName" placeholder="Shop Name" required />
        <input name="phone" placeholder="Phone (optional)" />
        <button type="submit">Submit Request</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default BecomeSeller;
