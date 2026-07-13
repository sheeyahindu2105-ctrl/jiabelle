import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SellerSidebar from "../components/SellerSidebar";
import "../styles/SellerProducts.css";
import "../styles/AddProduct.css";

function SellerProducts() {

  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const productsPerPage = 5;

  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);

  /* ================= URL FILTER (🔥 IMPORTANT) ================= */

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const filter = query.get("filter");

    if (filter === "low") setStockFilter("low");
    else if (filter === "out") setStockFilter("out");
    else setStockFilter("all");

  }, [location.search]);

  /* ================= AUTO PRICE ================= */

  useEffect(() => {
    if (originalPrice && discount >= 0) {
      const sell =
        originalPrice - (originalPrice * discount) / 100;
      setPrice(Math.round(sell));
    }
  }, [originalPrice, discount]);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    fetch("http://localhost:5000/api/products/my-products", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.log(err));
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

    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )

    .filter(p => {
      if (categoryFilter !== "all" && p.category !== categoryFilter)
        return false;

      if (stockFilter === "low" && !(p.stock > 0 && p.stock <= 5))
        return false;

      if (stockFilter === "out" && p.stock !== 0)
        return false;

      return true;
    });

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const start = (page - 1) * productsPerPage;

  const paginatedProducts = filteredProducts.slice(
    start,
    start + productsPerPage
  );

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setProducts(products.filter(p => p._id !== id));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("originalPrice", originalPrice);
    formData.append("discount", discount);
    formData.append("stock", stock);
    formData.append("category", category);

    images.forEach(img => formData.append("images", img));

    const url = editingId
      ? `http://localhost:5000/api/products/${editingId}`
      : "http://localhost:5000/api/products";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    window.location.reload();
  };

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

          {/* FILTER BAR */}
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

          {/* TABLE */}
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
              {paginatedProducts.map(p => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] && (
                      <img
                        src={
                          p.images[0].startsWith("http")
                            ? p.images[0]
                            : `http://localhost:5000${p.images[0]}`
                        }
                        className="table-img"
                        alt=""
                      />
                    )}
                  </td>

                  <td>{p.name}</td>
                  <td>₹{p.price}</td>

                  <td style={{
                    color:
                      p.stock === 0 ? "red" :
                      p.stock <= 5 ? "orange" :
                      "green"
                  }}>
                    {p.stock}
                  </td>

                  <td>{p.category}</td>

                  <td>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
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