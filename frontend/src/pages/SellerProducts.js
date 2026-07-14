import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerSidebar from "../components/SellerSidebar";
import "../styles/SellerProducts.css";
import "../styles/AddProduct.css";

function SellerProducts() {

 
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [page] = useState(1);
  const productsPerPage = 5;

  
  

  

  /* ================= AUTO PRICE ================= */

 

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
fetch(`${process.env.REACT_APP_API_URL}/api/products/my-products`, {      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.log(err));
  }, [token]);

  /* ================= EDIT ================= */

  

  /* ================= FILTER ================= */

  const filteredProducts = products

    .filter(
  (p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
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

    
  const start = (page - 1) * productsPerPage;

  const paginatedProducts = filteredProducts.slice(
    start,
    start + productsPerPage
  );

  /* ================= DELETE ================= */

const handleDelete = async (id) => {
  if (!window.confirm("Delete this product?")) return;

  await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  setProducts((prev) =>
    prev.filter((p) => p._id !== id)
  );
};

/* ================= UI ================= */

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
  onClick={() => navigate("/seller/add-product")}
>
  + Add Product
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
                            : `${process.env.REACT_APP_API_URL}${p.images[0]}`
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
                    <button disabled>Edit</button>
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