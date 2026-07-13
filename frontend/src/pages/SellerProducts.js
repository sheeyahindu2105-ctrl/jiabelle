import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SellerSidebar from "../components/SellerSidebar";
import "../styles/SellerProducts.css";
import "../styles/AddProduct.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SellerProducts() {
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [page] = useState(1);
  const productsPerPage = 5;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [images] = useState([]);
    /* ================= URL FILTER ================= */

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const filter = query.get("filter");

    if (filter === "low") {
      setStockFilter("low");
    } else if (filter === "out") {
      setStockFilter("out");
    } else {
      setStockFilter("all");
    }
  }, [location.search]);

  /* ================= AUTO PRICE ================= */

  useEffect(() => {
    if (originalPrice && discount >= 0) {
      const sell =
        Number(originalPrice) -
        (Number(originalPrice) * Number(discount)) / 100;

      setPrice(Math.round(sell));
    }
  }, [originalPrice, discount]);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products/my-products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProducts();
  }, [token]);

  /* ================= EDIT ================= */

  const handleEdit = (product) => {
    setShowForm(true);
    setEditingId(product._id);

    setName(product.name);
    setDescription(product.description);
    setOriginalPrice(product.originalPrice);
    setDiscount(product.discount);
    setPrice(product.price);
    setStock(product.stock);
    setCategory(product.category);
  };
    /* ================= FILTER ================= */

  const filteredProducts = products
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }

      if (stockFilter === "low" && !(p.stock > 0 && p.stock <= 5)) {
        return false;
      }

      if (stockFilter === "out" && p.stock !== 0) {
        return false;
      }

      return true;
    });

  /* ================= PAGINATION ================= */

  const start = (page - 1) * productsPerPage;

  const paginatedProducts = filteredProducts.slice(
    start,
    start + productsPerPage
  );

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await fetch(`${API}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log(err);
    }
  };
    /* ================= SUBMIT ================= */



  /* ================= UI ================= */

  return (
    <div className="admin-layout">
      <SellerSidebar />

      <div className="admin">
        <div className="seller-container">

          <div className="products-header">
            <h2>My Products</h2>

            <button
              className="add-product-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Close Form" : "+ Add Product"}
            </button>
          </div>

          <div className="products-topbar">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Handbag">Handbag</option>
              <option value="Sling">Sling</option>
              <option value="Satchel">Satchel</option>
              <option value="Tote">Tote</option>
              <option value="Backpack">Backpack</option>
              <option value="Clutch">Clutch</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] && (
                      <img
                        src={
                          p.images[0].startsWith("http")
                            ? p.images[0]
                            : `${API}${p.images[0]}`
                        }
                        alt={p.name}
                        className="table-img"
                      />
                    )}
                  </td>

                  <td>{p.name}</td>

                  <td>₹{p.price}</td>

                  <td
                    style={{
                      color:
                        p.stock === 0
                          ? "red"
                          : p.stock <= 5
                          ? "orange"
                          : "green",
                    }}
                  >
                    {p.stock}
                  </td>

                  <td>{p.category}</td>

                  <td>
                    <button onClick={() => handleEdit(p)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default SellerProducts;