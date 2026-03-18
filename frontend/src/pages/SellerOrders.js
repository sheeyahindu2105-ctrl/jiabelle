import { useEffect, useState, useCallback } from "react";
import "../styles/SellerOrders.css";
import SellerSidebar from "../components/SellerSidebar";

function SellerOrders(){

const [orders,setOrders] = useState([]);

const token = localStorage.getItem("token");

/* ===== FETCH ORDERS ===== */

const fetchOrders = useCallback(async () => {

try{

const res = await fetch(
"http://localhost:5000/api/orders/seller",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const data = await res.json();

setOrders(Array.isArray(data) ? data : []);

}catch(err){

console.log(err);

}

},[token]);


/* LOAD ORDERS */

useEffect(()=>{

fetchOrders();

},[fetchOrders]);



return(

<div className="admin-layout">

<SellerSidebar/>

<div className="admin">

<div className="seller-container">

<h2>Seller Orders</h2>

<div className="product-table-card">

<table className="product-table">

<thead>

<tr>
<th>Order</th>
<th>Product</th>
<th>Customer</th>
<th>Qty</th>
<th>Price</th>
<th>Status</th>
<th>Date</th>
</tr>

</thead>

<tbody>

{orders.length === 0 && (
<tr>
<td colSpan="7">No orders yet</td>
</tr>
)}

{orders.map(order =>

order.products.map((item,index)=>(

<tr key={order._id + index}>

<td>{order._id.slice(-6)}</td>

<td>{item.product?.name}</td>

<td>{order.user?.name || order.user?.email}</td>

<td>{item.qty}</td>

<td>₹{item.price}</td>

<td>
<span className="order-status-text">
{item.orderStatus}
</span>
</td>

<td>
{new Date(order.createdAt).toLocaleDateString()}
</td>

</tr>

))

)}

</tbody>

</table>

</div>

</div>

</div>

</div>

);

}

export default SellerOrders;