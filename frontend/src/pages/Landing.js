import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Landing.css";
import bgImage from "../assets/bg.png";

function Landing() {
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const closeModal = () => {
    setActiveCategory(null);
  };

  // 🔥 SMART BECOME SELLER HANDLER
  const handleBecomeSellerClick = () => {
    // not logged in
    if (!token || !user) {
  navigate("/login", {
    state: { redirectTo: "/become-seller" },
  });
  return;
}


    // already seller
    if (user.role === "seller") {
      navigate("/seller-dashboard");
      return;
    }

    // request pending
    if (user.sellerStatus === "pending") {
      alert("⏳ Your seller request is under review.");
      return;
    }

    // rejected
    if (user.sellerStatus === "rejected") {
      alert("❌ Your seller request was rejected.");
      return;
    }

    // normal user
    navigate("/become-seller");
  };

  return (
    <>
      {/* HERO SECTION */}
      <div
        className="landing"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="overlay"></div>

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="logo">JIABELLE</div>

          <ul className="nav-links">
            <li onClick={() => setActiveCategory("bags")}>Bags</li>
            <li onClick={() => setActiveCategory("handbags")}>Handbags</li>
            <li onClick={() => setActiveCategory("clutches")}>Clutches</li>
            <li onClick={() => setActiveCategory("sling")}>Sling Bags</li>
            <li onClick={() => setActiveCategory("tote")}>Tote Bags</li>
          </ul>

          <Link to="/login" className="login-btn">Login</Link>
        </nav>

        {/* HERO TEXT */}
        <div className="hero-text">
          <h1>Elegant Bags for Every Style</h1>
          <p>Discover premium handbags crafted for modern women</p>
        </div>
      </div>

      {/* MODAL POPUP */}
      {activeCategory && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="close-btn" onClick={closeModal}>×</span>

            <h2>{activeCategory}</h2>
            <p>
              Explore our premium collection.
              Want to know more? Browse the website!
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2026 JIABELLE. All Rights Reserved.</p>

          {/* ✅ SMART LINK */}
          <span
            className="footer-link"
            style={{ cursor: "pointer" }}
            onClick={handleBecomeSellerClick}
          >
            Become a Seller
          </span>
        </div>
      </footer>
    </>
  );
}

export default Landing;
