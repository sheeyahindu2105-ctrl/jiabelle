import { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import LogoutButton from "../components/LogoutButton";
import "../styles/SellerDashboard.css";
import SellerSidebar from "../components/SellerSidebar";
import { useNavigate } from "react-router-dom";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
);

function SellerDashboard(){

const [products,setProducts]=useState([]);
const [orders,setOrders]=useState([]);
const [sellerNotifCount,setSellerNotifCount]=useState(0);

const socketRef=useRef(null);
const navigate = useNavigate();
const token=localStorage.getItem("token");

/* ROLE PROTECTION */

useEffect(()=>{

const user=JSON.parse(localStorage.getItem("user"));

if(!token || user?.role!=="seller"){
window.location.href="/login";
}

},[token]);

/* SOCKET */

useEffect(()=>{

const user=JSON.parse(localStorage.getItem("user"));

if(!user?._id) return;

socketRef.current=io("http://localhost:5000");

socketRef.current.emit("join",user._id);

socketRef.current.on("newNotification",()=>{
setSellerNotifCount(prev=>prev+1);
});

return ()=>socketRef.current.disconnect();

},[]);

/* FETCH PRODUCTS */

const fetchMyProducts=useCallback(async()=>{

try{

const res=await fetch(
"http://localhost:5000/api/products/my-products",
{
headers:{Authorization:`Bearer ${token}`}
}
);

const data=await res.json();

setProducts(Array.isArray(data)?data:[]);

}catch(err){
console.log(err);
}

},[token]);

/* FETCH ORDERS */

const fetchOrders=useCallback(async()=>{

try{

const res=await fetch(
"http://localhost:5000/api/orders/seller",
{
headers:{Authorization:`Bearer ${token}`}
}
);

const data=await res.json();

setOrders(Array.isArray(data)?data:[]);

}catch(err){
console.log(err);
}

},[token]);

useEffect(()=>{

if(token){
fetchMyProducts();
fetchOrders();
}

},[token,fetchMyProducts,fetchOrders]);

/* STATS */

const totalProducts=products.length;

const lowStock=products.filter(
p=>p.stock>0 && p.stock<=5
).length;

const outStock=products.filter(
p=>p.stock===0
).length;

const totalStock=products.reduce(
(a,b)=>a+b.stock,0
);

const totalOrders=orders.length;

const totalRevenue=orders.reduce(
(sum,o)=>sum+o.totalAmount,
0
);

/* CHART DATA */

const chartData={
labels:orders.map(o=>new Date(o.createdAt).toLocaleDateString()),
datasets:[
{
label:"Order Revenue",
data:orders.map(o=>o.totalAmount),
backgroundColor:"#4F46E5"
}
]
};

return(

<div className="admin-layout">

<SellerSidebar/>

<div className="admin">

<div className="seller-container">

<div className="seller-header">

<h2>Seller Dashboard</h2>

<div style={{display:"flex",gap:"20px",alignItems:"center"}}>

<div
style={{position:"relative",fontSize:"20px",cursor:"pointer"}}
onClick={()=>window.location.href="/notifications"}
>

🔔

{sellerNotifCount>0 &&(
<span className="notif-badge">
{sellerNotifCount}
</span>
)}

</div>

<LogoutButton/>

</div>

</div>

{/* QUICK ACTIONS */}

<div className="quick-actions">

<button onClick={()=>navigate("/seller/products")}>
+ Add Product
</button>

<button onClick={()=>navigate("/seller/orders")}>
View Orders
</button>

<button onClick={()=>navigate("/seller/analytics")}>
Analytics
</button>

</div>
{/* STATS */}

<div className="seller-stats">

<div className="stat-box stat-products">
<div className="stat-icon">📦</div>
<div>
<h3>{totalProducts}</h3>
<p>Total Products</p>
</div>
</div>

<div className="stat-box stat-low">
<div className="stat-icon">⚠️</div>
<div>
<h3>{lowStock}</h3>
<p>Low Stock</p>
</div>
</div>

<div
className="stat-box stat-orders"
onClick={()=>window.location.href="/seller/orders"}
>
<div className="stat-icon">🛒</div>
<div>
<h3>{totalOrders}</h3>
<p>Total Orders</p>
</div>
</div>

<div className="stat-box stat-revenue">
<div className="stat-icon">💰</div>
<div>
<h3>₹{totalRevenue}</h3>
<p>Total Revenue</p>
</div>
</div>

<div className="stat-box stat-out">
<div className="stat-icon">❌</div>
<div>
<h3>{outStock}</h3>
<p>Out of Stock</p>
</div>
</div>

<div className="stat-box stat-inventory">
<div className="stat-icon">📊</div>
<div>
<h3>{totalStock}</h3>
<p>Total Inventory</p>
</div>
</div>

</div>

{/* SALES CHART */}

<div className="chart-card">

<h3>Sales Overview</h3>

<Bar data={chartData}/>

</div>

{/* TOP PRODUCTS */}

<div className="top-products">

<h3>Top Selling Products</h3>

<div className="top-product-list">

{products.slice(0,5).map((p,index)=>(
<div key={p._id} className="top-product-item">

<span className="top-rank">#{index+1}</span>

<span className="top-name">{p.name}</span>

<span className="top-stock">Stock: {p.stock}</span>

</div>
))}

</div>

</div>
{/* RECENT ORDERS */}

<div className="product-table-card">

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>

<h3>Recent Orders</h3>

<button
className="edit-btn"
onClick={()=>window.location.href="/seller/orders"}
>
View All
</button>

</div>

{orders.length===0?(
<p>No orders yet</p>
):( 

<table className="product-table">

<thead>

<tr>
<th>Order</th>
<th>Customer</th>
<th>Total</th>
<th>Status</th>
<th>Date</th>
</tr>

</thead>

<tbody>

{orders.slice(0,5).map(order=>(

<tr key={order._id}>

<td>{order._id.slice(-6)}</td>

<td>
{order.user?.name || order.user?.email}
</td>

<td>₹{order.totalAmount}</td>

<td>
<span className={`status ${order.orderStatus}`}>
{order.products?.[0]?.orderStatus || "placed"}
</span>
</td>

<td>
{new Date(order.createdAt).toLocaleDateString()}
</td>

</tr>

))}

</tbody>

</table>

)}

</div>

</div>

</div>

</div>

);

}

export default SellerDashboard;