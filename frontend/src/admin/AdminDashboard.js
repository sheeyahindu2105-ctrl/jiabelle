import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminChart from "../components/AdminChart";
import "../styles/admin.css";

function AdminDashboard() {

const navigate = useNavigate();
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

/* ================= ROLE PROTECTION ================= */

useEffect(() => {

const user = JSON.parse(localStorage.getItem("user"));

if (!token || user?.role !== "admin") {
navigate("/login", { replace: true });
}

}, [token, navigate]);

const [stats, setStats] = useState({});
const [recentProducts, setRecentProducts] = useState([]);
const [pendingProducts, setPendingProducts] = useState([]);
const [orders, setOrders] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");

const [notification, setNotification] = useState("");

const [selectedProduct, setSelectedProduct] = useState(null);

useEffect(() => {

if (!token) return;

const fetchData = async () => {

try {

const headers = { Authorization: `Bearer ${token}` };

/* ===== DASHBOARD STATS ===== */

const statsRes = await fetch(`${API}/api/admin/stats`, { headers });
const statsData = await statsRes.json();
setStats(statsData || {});

/* ===== PRODUCTS ===== */

const prodRes = await fetch(`${API}/api/admin/products`, { headers });
const data = await prodRes.json();

const products = Array.isArray(data) ? data : data.products || [];

setRecentProducts(products.slice(0, 8));

const pending = products.filter(p => p.status === "pending");
setPendingProducts(pending.slice(0,5));

/* ===== LATEST ORDERS ===== */

const orderRes = await fetch(`${API}/api/admin/orders/latest`,{headers});
const orderData = await orderRes.json();

setOrders(orderData);

} catch (err) {

console.error(err);
setError("Failed to load dashboard data.");

} finally {

setLoading(false);

}

};

fetchData();

}, [API, token]);

/* ===== APPROVE PRODUCT ===== */

const approveProduct = async (id) => {

try {

const res = await fetch(
`${API}/api/products/${id}/approve`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`
}
}
);

if (res.ok) {

setPendingProducts(prev =>
prev.filter(p => p._id !== id)
);

setNotification("Product approved successfully!");

setTimeout(() => {
setNotification("");
}, 3000);

}

} catch (err) {

console.error(err);

}

};

/* ===== LOADING ===== */

if (loading) {

return (

<div className="dashboard-container">
<h2>Admin Dashboard</h2>
<p className="empty">Loading dashboard...</p>
</div>
);

}

/* ===== ERROR ===== */

if (error) {

return (

<div className="dashboard-container">
<h2>Admin Dashboard</h2>
<p className="empty">{error}</p>
</div>
);

}

return (

<div className="dashboard-container">

<h2>Admin Dashboard</h2>

{notification && (

<div className="admin-notification">
{notification}
</div>
)}

{/* ===== DASHBOARD CARDS ===== */}

<div className="dashboard-cards">

<div
className="dashboard-card"
onClick={() => navigate("/admin/users")}
>
<p>Total Users</p>
<h3>{stats.totalUsers || 0}</h3>
</div>

<div
className="dashboard-card"
onClick={() => navigate("/admin/sellers?tab=approved")}
>
<p>Approved Sellers</p>
<h3>{stats.approvedSellers || 0}</h3>
</div>

<div
className="dashboard-card warning"
onClick={() => navigate("/admin/sellers?tab=pending")}
>
<p>Pending Sellers</p>
<h3>{stats.pendingSellers || 0}</h3>
</div>

<div
className="dashboard-card"
onClick={() => navigate("/admin/products")}
>
<p>Total Products</p>
<h3>{stats.totalProducts || 0}</h3>
</div>

</div>

{/* ===== ANALYTICS CHART ===== */}

<AdminChart stats={stats} />

{/* ===== SECTIONS ===== */}

<div className="dashboard-sections">

{/* ===== PENDING PRODUCTS ===== */}

<div className="dashboard-box">

<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>

<h4>Pending Product Approvals</h4>

<button
className="tab-btn"
onClick={() => navigate("/admin/products?tab=pending")}

>

View All </button>

</div>

{pendingProducts.length === 0 ? (

<p className="empty">No pending products</p>

) : (

<table className="admin-product-table">

<thead>
<tr>
<th>Product</th>
<th>Seller</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{pendingProducts.map(p => (

<tr key={p._id}>

<td>{p.name}</td>

<td>{p.seller?.name || "Unknown"}</td>

<td>

<button
className="approve-btn"
onClick={() => setSelectedProduct(p)}

>

Approve </button>

</td>

</tr>

))}

</tbody>

</table>

)}

</div>

{/* ===== RECENT PRODUCTS ===== */}

<div className="dashboard-box">

<h4>Recently Added Products</h4>

<input
type="text"
placeholder="Search product..."
value={search}
onChange={(e) => setSearch(e.target.value)}
className="admin-search"
/>

{recentProducts.length === 0 ? (

<p className="empty">No products added yet</p>

) : (

<table className="admin-product-table">

<thead>
<tr>
<th>Product</th>
<th>Seller</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{recentProducts
.filter(p =>
p.name.toLowerCase().includes(search.toLowerCase())
)
.map((p) => (

<tr key={p._id}>

<td>{p.name}</td>

<td>{p.seller?.name || "Unknown Seller"}</td>

<td>
<span className={`status ${p.status}`}>
{p.status}
</span>
</td>

</tr>

))}

</tbody>

</table>

)}

</div>

{/* ===== LATEST ORDERS ===== */}

<div className="dashboard-box">

<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>

<h4>Latest Orders</h4>

<button
className="tab-btn"
onClick={()=>navigate("/admin/orders")}

>

View All </button>

</div>

{orders.length === 0 ? (

<p className="empty">No orders yet</p>

) : (

<table className="admin-product-table">

<thead>
<tr>
<th>Order</th>
<th>Customer</th>
<th>Total</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{orders.map(o => (

<tr key={o._id}>

<td>{o._id.slice(-6)}</td>

<td>{o.user?.name}</td>

<td>₹{o.totalAmount}</td>

<td>
<span className={`status ${o.products?.[0]?.orderStatus}`}>
{o.products?.[0]?.orderStatus || "placed"}
</span>
</td>
</tr>

))}

</tbody>
</table>

)}

</div>

</div>

{/* ===== APPROVE MODAL ===== */}

{selectedProduct && (

<div className="admin-modal">

<div className="modal-box">

<h3>Approve Product</h3>

<p>{selectedProduct.name}</p>

<button
className="approve-btn"
onClick={() => {

approveProduct(selectedProduct._id);
setSelectedProduct(null);

}}

>

Confirm </button>

<button
className="cancel-btn"
onClick={() => setSelectedProduct(null)}

>

Cancel </button>

</div>

</div>

)}

</div>

);

}

export default AdminDashboard;
