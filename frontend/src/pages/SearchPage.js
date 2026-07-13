import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/home.css";

function SearchPage() {
  const { query } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ✅ YOUR PORT */
  const API = "http://localhost:5000";

  /* ================= IMAGE FIX ================= */
  const getImage = (img) => {
    if (!img) return "/placeholder.png";

    return img.startsWith("http")
      ? img
      : `${API}/${img}`;
  };

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();

        const list = Array.isArray(data) ? data : [];

        const safeQuery = query?.toLowerCase().trim() || "";

        const filtered = list.filter((p) =>
          p.name?.toLowerCase().includes(safeQuery)
        );

        setProducts(filtered);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="home">

      <h2 className="section-title">
        Search Results for "{query}"
      </h2>

      {/* LOADING */}
      {loading && (
        <p style={{ textAlign: "center" }}>
          Loading...
        </p>
      )}

      {/* EMPTY */}
      {!loading && products.length === 0 && (
        <p style={{ textAlign: "center" }}>
          No products found
        </p>
      )}

      {/* PRODUCTS */}
      <div className="product-grid">
        {products.map((p) => (
          <div
            key={p._id}
            className="product-card"
            onClick={() => navigate(`/product/${p._id}`)}
          >
            <img
              src={getImage(p.images?.[0])}
              alt={p.name}
            />

            <h4>{p.name}</h4>
            <p className="price">₹{p.price}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default SearchPage;