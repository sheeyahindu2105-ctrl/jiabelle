import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

import newImg from "../assets/categories/new.jpg";
import handbagImg from "../assets/categories/best.jpg";
import slingImg from "../assets/categories/sling.jpg";
import satchelImg from "../assets/categories/satchel.jpg";
import toteImg from "../assets/categories/tote.jpg";
import backpackImg from "../assets/categories/backpack.jpg";
import clutchImg from "../assets/categories/clutch.jpg";
import allImg from "../assets/categories/all.jpg";

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState({});

  const API = process.env.REACT_APP_API_URL || "https://jiabelle-backend.onrender.com";

  /* ================= USER ================= */
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || user?.id;

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API]);

  /* ================= LOAD WISHLIST ================= */
  useEffect(() => {
    if (!userId) return;

    const saved =
      JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];

    setWishlist(saved);
  }, [userId]);

  /* ================= TOGGLE WISHLIST (FIXED) ================= */
  const toggleWishlist = (product) => {
    if (!userId) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setWishlist((prev) => {
      let updated;

      const exists = prev.find((item) => item._id === product._id);

      if (exists) {
        updated = prev.filter((item) => item._id !== product._id);
      } else {
        updated = [...prev, product];
      }

      localStorage.setItem(
        `wishlist_${userId}`,
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  /* ================= CHECK WISHLIST ================= */
  const isWishlisted = (id) => {
    return wishlist?.some((item) => item._id === id);
  };

  /* ================= IMAGE SLIDER ================= */
  const changeImage = (id, dir) => {
    setImageIndexes((prev) => {
      const product = products.find((p) => p._id === id);
      if (!product?.images) return prev;

      const total = product.images.length;
      let next = (prev[id] || 0) + dir;

      if (next < 0) next = total - 1;
      if (next >= total) next = 0;

      return { ...prev, [id]: next };
    });
  };

  /* ================= UI ================= */

  return (
    <div className="home">
      <div className="home-container">

        {/* CATEGORY */}
        <section className="category-icons">
          {[
            { img: allImg, label: "All", path: "all" },
            { img: newImg, label: "New", path: "new" },
            { img: handbagImg, label: "Handbags", path: "handbag" },
            { img: slingImg, label: "Sling Bags", path: "sling" },
            { img: satchelImg, label: "Satchel Bags", path: "satchel" },
            { img: toteImg, label: "Tote Bags", path: "tote" },
            { img: backpackImg, label: "Backpacks", path: "backpack" },
            { img: clutchImg, label: "Clutches", path: "clutch" },
          ].map((cat, i) => (
            <div
              key={i}
              className="cat-item"
              onClick={() => navigate(`/category/${cat.path}`)}
            >
              <img src={cat.img} alt={cat.label} />
              <span>{cat.label}</span>
            </div>
          ))}
        </section>

        {/* PRODUCTS */}
        <h2 className="section-title">All Bags</h2>

        {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

        <div className="product-grid">
          {products.map((p) => {
            const index = imageIndexes[p._id] || 0;

            const productImage =
              p.images?.[index] || p.images?.[0] || "";

            const imageUrl =
              productImage?.startsWith("http")
                ? productImage
                : `${API}${productImage}`;

            return (
              <div
                className="product-card"
                key={p._id}
                onClick={() =>
                  navigate(`/product/${p._id}`, { state: p })
                }
              >

                {/* ❤️ WISHLIST */}
                <button
                  className="wishlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p);
                  }}
                >
                  {isWishlisted(p._id) ? "❤️" : "🤍"}
                </button>

                {/* IMAGE */}
                <div className="product-image-container">
                  <button
                    className="img-arrow left"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeImage(p._id, -1);
                    }}
                  >
                    ‹
                  </button>

                  <img src={imageUrl} alt={p.name} />

                  <button
                    className="img-arrow right"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeImage(p._id, 1);
                    }}
                  >
                    ›
                  </button>
                </div>

                <h4>{p.name}</h4>
                <p className="price">₹{p.price}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Home;