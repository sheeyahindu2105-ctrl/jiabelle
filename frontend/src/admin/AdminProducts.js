import { useEffect, useState } from "react";
import "../styles/admin.css";
import Pagination from "../components/Pagination";

function AdminProducts() {

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pending");

  const [page, setPage] = useState(1);
  const perPage = 6;

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const res = await fetch(`${API}/api/products/admin/products`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        const list = Array.isArray(data) ? data : data.products || [];

        setProducts(list);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

    };

    fetchProducts();

  }, [API, token]);



  /* ================= RESET PAGE WHEN TAB CHANGES ================= */

  useEffect(() => {
    setPage(1);
  }, [activeTab]);



  /* ================= APPROVE PRODUCT ================= */

  const approveProduct = async (id) => {

    await fetch(`${API}/api/products/${id}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, status: "approved" } : p
      )
    );
  };



  /* ================= REJECT PRODUCT ================= */

  const rejectProduct = async (id) => {

    await fetch(`${API}/api/products/${id}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, status: "rejected" } : p
      )
    );
  };



  /* ================= BLOCK PRODUCT ================= */

  const blockProduct = async (id) => {

    await fetch(`${API}/api/products/${id}/block`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, status: "blocked" } : p
      )
    );
  };



  /* ================= UNBLOCK PRODUCT ================= */

  const unblockProduct = async (id) => {

    await fetch(`${API}/api/products/${id}/unblock`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, status: "approved" } : p
      )
    );
  };



  /* ================= DELETE PRODUCT ================= */

  const deleteProduct = async (id) => {

    if (!window.confirm("Delete this product?")) return;

    await fetch(`${API}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setProducts(prev => prev.filter(p => p._id !== id));
  };



  /* ================= FILTER PRODUCTS ================= */

  const filteredProducts = products.filter(p =>
    p.status === activeTab &&
    (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.seller?.email?.toLowerCase().includes(search.toLowerCase())
    )
  );



  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredProducts.length / perPage);

  const start = (page - 1) * perPage;

  const paginatedProducts = filteredProducts.slice(start, start + perPage);



  /* ================= LOADING ================= */

  if (loading) {
    return <p className="empty">Loading products...</p>;
  }



  /* ================= RENDER ================= */

  return (

    <div className="admin-page">

      <h2>Products</h2>

      {/* ================= TABS ================= */}

      <div className="tab-bar">

        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          PENDING
        </button>

        <button
          className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          APPROVED
        </button>

        <button
          className={`tab-btn ${activeTab === "blocked" ? "active" : ""}`}
          onClick={() => setActiveTab("blocked")}
        >
          BLOCKED
        </button>

        <button
          className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          REJECTED
        </button>

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

            {paginatedProducts.map(product => (

              <tr key={product._id}>

                {/* ================= IMAGE ================= */}

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



                <td>{product.name}</td>

                <td>{product.seller?.name}</td>

                <td>₹{product.price}</td>



                {/* ================= STATUS ================= */}

                <td>

                  <span className={`status ${product.status}`}>
                    {product.status}
                  </span>

                </td>



                {/* ================= ACTION ================= */}

                <td>

                  <div className="action-buttons">

                    {product.status === "pending" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => approveProduct(product._id)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => rejectProduct(product._id)}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {product.status === "approved" && (
                      <button
                        className="block-btn"
                        onClick={() => blockProduct(product._id)}
                      >
                        Block
                      </button>
                    )}

                    {product.status === "blocked" && (
                      <button
                        className="unblock-btn"
                        onClick={() => unblockProduct(product._id)}
                      >
                        Unblock
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {/* ================= PAGINATION ================= */}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />

    </div>

  );

}

export default AdminProducts;