import { useEffect, useState } from "react";
import "../styles/admin.css";

function AdminProducts() {

  const API =
  process.env.REACT_APP_API_URL ||
  "https://jiabelle-backend.onrender.com";
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {

    const fetchProducts = async () => {
      try {
        setLoading(true);

        // ✅ FIXED API
        const res = await fetch(`${API}/api/admin/products`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : data.products || [];

        setProducts(list);

      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, [API, token]);

  /* ================= FILTER ================= */

  const filteredProducts = products.filter(p =>
    p.status === activeTab &&
    (
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.seller?.name?.toLowerCase().includes(search.toLowerCase())
    )
  );

  /* ================= UI ================= */

  return (
    <div className="admin-page">

      <h2>Products</h2>

      {/* ================= TABS ================= */}
      <div className="tab-bar">

        {["pending", "approved", "blocked", "rejected"].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}

      </div>

      {/* ================= SEARCH ================= */}
      <input
        className="admin-search"
        placeholder="Search product name or seller..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}
      <div className="table-wrapper">

        <table className="admin-product-table">

          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="6" className="empty">
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product._id}>

                  {/* IMAGE */}
                  <td>
                    <img
                      src={
                        product.images?.[0]?.startsWith("http")
                          ? product.images[0]
                          : `${API}/${product.images?.[0]}`
                      }
                      alt={product.name}
                      className="admin-product-img"
                    />
                  </td>

                  {/* NAME */}
                  <td>{product.name}</td>

                  {/* SELLER */}
                  <td>{product.seller?.name || "N/A"}</td>

                  {/* PRICE */}
                  <td>₹{product.price}</td>

                  {/* STATUS */}
                  <td>
                    <span className={`status ${product.status}`}>
                      {product.status}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td>

                    {product.status === "pending" && (
                      <>
                        <button className="approve-btn">
                          Approve
                        </button>
                        <button className="reject-btn">
                          Reject
                        </button>
                      </>
                    )}

                    {product.status === "approved" && (
                      <button className="block-btn">
                        Block
                      </button>
                    )}

                    {product.status === "blocked" && (
                      <button className="unblock-btn">
                        Unblock
                      </button>
                    )}

                    <button className="delete-btn">
                      Delete
                    </button>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminProducts;