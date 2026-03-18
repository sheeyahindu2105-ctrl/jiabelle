import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

function AdminOrders(){

const navigate = useNavigate();
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

const [orders,setOrders] = useState([]);
const [loading,setLoading] = useState(true);
const [error,setError] = useState("");

/* ===== CHECK ADMIN ===== */

useEffect(()=>{

const user = JSON.parse(localStorage.getItem("user"));

if(!token || user?.role !== "admin"){
navigate("/login",{replace:true});
}

},[token,navigate]);

/* ===== FETCH ORDERS ===== */

useEffect(()=>{

if(!token) return;

const fetchOrders = async ()=>{

try{

const res = await fetch(`${API}/api/admin/orders/latest`,{
headers:{Authorization:`Bearer ${token}`}
});

const data = await res.json();

setOrders(Array.isArray(data) ? data : []);

}catch(err){

console.error(err);
setError("Failed to load orders");

}finally{
setLoading(false);
}

};

fetchOrders();

const interval = setInterval(fetchOrders,3000);

return ()=> clearInterval(interval);

},[API,token]);

/* ===== LOADING ===== */

if(loading){

return(

<div className="admin-page">
<h2>Orders</h2>
<p className="empty">Loading orders...</p>
</div>
);

}

/* ===== ERROR ===== */

if(error){

return(

<div className="admin-page">
<h2>Orders</h2>
<p className="empty">{error}</p>
</div>
);

}

/* ===== GET SELLER NAMES ===== */

const getSellerNames = (products)=>{

if(!products) return "-";

const names = products
.map(p => p?.seller?.name)
.filter(Boolean);

return [...new Set(names)].join(", ") || "-";

};

/* ===== UI ===== */

return(

<div className="admin-page">

<h2>Orders</h2>

<div className="table-wrapper">

<table className="admin-product-table">

<thead>
<tr>
<th>Order</th>
<th>Customer</th>
<th>Total</th>
<th>Seller</th>
<th>Payment</th>
<th>Status</th>
<th>Date</th>
</tr>
</thead>

<tbody>

{orders.length === 0 ? (

<tr>
<td colSpan="7" className="empty">No orders found</td>
</tr>

):(orders.map(o=>(

<tr key={o._id}>

<td>{o._id.slice(-6)}</td>

<td>{o.user?.name || "-"}</td>

<td>₹{o.totalAmount}</td>

<td>{getSellerNames(o.products)}</td>

<td>{o.paymentStatus}</td>

<td>
<span className={`order-status ${o.orderStatus}`}>
{o.products?.[0]?.orderStatus || "placed"}
</span>
</td>

<td>
{new Date(o.createdAt).toLocaleDateString()}
</td>

</tr>

)))}

</tbody>

</table>

</div>

</div>

);

}

export default AdminOrders;
