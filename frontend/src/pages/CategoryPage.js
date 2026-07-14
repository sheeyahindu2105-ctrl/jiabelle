import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/category.css";
import "../styles/home.css";

import allBanner from "../assets/banners/all.jpg";
import newBanner from "../assets/banners/new.jpg";

import handbagBanner from "../assets/banners/handbag.jpg";
import handbagBanner1 from "../assets/banners/handbag1.jpg";
import handbagBanner2 from "../assets/banners/handbag2.jpg";

import slingBanner from "../assets/banners/sling.jpg";
import slingBanner1 from "../assets/banners/sling1.jpg";
import slingBanner2 from "../assets/banners/sling2.jpg";

import satchelBanner from "../assets/banners/satchel.jpg";
import satchelBanner1 from "../assets/banners/satchel1.jpg";
import satchelBanner2 from "../assets/banners/satchel2.jpg";

import toteBanner from "../assets/banners/tote.jpg";
import toteBanner1 from "../assets/banners/tote1.jpg";
import toteBanner2 from "../assets/banners/tote2.jpg";

import backpackBanner from "../assets/banners/backpack.jpg";
import backpackBanner1 from "../assets/banners/backpack1.jpg";
import backpackBanner2 from "../assets/banners/backpack2.jpg";

import clutchBanner from "../assets/banners/clutch.jpg";
import clutchBanner1 from "../assets/banners/clutch1.jpg";
import clutchBanner2 from "../assets/banners/clutch2.jpg";

function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const safeCategory = category?.toLowerCase() || "all";
  const categoryTitle = safeCategory.toUpperCase();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = useMemo(
    () => searchParams.get("search") || "",
    [searchParams]
  );

  const [sort, setSort] = useState("newest");
  const [priceFilter, setPriceFilter] = useState("");

  /* ================= ✅ FIXED FETCH ================= */
  useEffect(() => {
    axios
      .get("/products") // 🔥 FIX HERE (removed /api)
      .then((res) =>
        setProducts(Array.isArray(res.data) ? res.data : [])
      )
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  /* ================= BANNERS ================= */
  const bannerGroups = useMemo(
    () => ({
      handbag: [handbagBanner, handbagBanner1, handbagBanner2],
      sling: [slingBanner, slingBanner1, slingBanner2],
      satchel: [satchelBanner, satchelBanner1, satchelBanner2],
      tote: [toteBanner, toteBanner1, toteBanner2],
      backpack: [backpackBanner, backpackBanner1, backpackBanner2],
      clutch: [clutchBanner, clutchBanner1, clutchBanner2],
    }),
    []
  );

  const bannerMap = {
    all: allBanner,
    new: newBanner,
  };

  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const banners = bannerGroups[safeCategory];
    if (!banners) return;

    const interval = setInterval(() => {
      setBannerIndex((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [safeCategory, bannerGroups]);

  const banner =
    bannerGroups[safeCategory]?.[bannerIndex] ||
    bannerMap[safeCategory] ||
    bannerMap["all"];

  /* ================= FILTER ================= */

  const categoryMap = {
    clutch: ["clutch"],
    sling: ["sling"],
    handbag: ["handbag"],
    tote: ["tote"],
    backpack: ["backpack"],
    satchel: ["satchel"],
  };

  let filtered = [...products];

  if (safeCategory !== "all" && safeCategory !== "new") {
    filtered = filtered.filter((p) =>
      categoryMap[safeCategory]?.some((cat) =>
        (p.category || "").toLowerCase().includes(cat)
      )
    );
  }

  filtered = filtered.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (priceFilter === "low")
    filtered = filtered.filter((p) => p.price < 2000);
  if (priceFilter === "mid")
    filtered = filtered.filter(
      (p) => p.price >= 2000 && p.price <= 5000
    );
  if (priceFilter === "high")
    filtered = filtered.filter((p) => p.price > 5000);

  if (sort === "newest")
    filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  if (sort === "lowprice")
    filtered.sort((a, b) => a.price - b.price);
  if (sort === "highprice")
    filtered.sort((a, b) => b.price - a.price);

  /* ================= UI ================= */

  return (
    <div className="home">

      <div className="category-banner">
        <img src={banner} alt={safeCategory} className="banner-img" />
      </div>

      <h2 className="section-title">{categoryTitle}</h2>

      <div className="category-container">

        <div className="filter-sidebar">
          <h3>Refine By</h3>

          <p><strong>Price</strong></p>

          <label>
            <input type="radio" onChange={() => setPriceFilter("low")} />
            Under ₹2000
          </label>

          <label>
            <input type="radio" onChange={() => setPriceFilter("mid")} />
            ₹2000 - ₹5000
          </label>

          <label>
            <input type="radio" onChange={() => setPriceFilter("high")} />
            Above ₹5000
          </label>

          <button onClick={() => setPriceFilter("")}>
            Clear Filters
          </button>
        </div>

        <div className="products-section">

          <div className="top-bar">
            <p>{filtered.length} Products</p>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="lowprice">Low to High</option>
              <option value="highprice">High to Low</option>
            </select>
          </div>

          <div className="product-grid">
            {loading ? (
              <p>Loading...</p>
            ) : filtered.length === 0 ? (
              <p>No products found</p>
            ) : (
              filtered.map((p) => {
                const img = p?.images?.[0] || "";
                const imageUrl = img.startsWith("http")
                  ? img
: `${process.env.REACT_APP_API_URL}${img}`;
                return (
                  <div
                    key={p._id}
                    className="product-card"
                    onClick={() =>
                      navigate(`/product/${p._id}`, { state: p })
                    }
                  >
                    <img src={imageUrl} alt={p.name} />
                    <h4>{p.name}</h4>
                    <p>₹{p.price}</p>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CategoryPage;