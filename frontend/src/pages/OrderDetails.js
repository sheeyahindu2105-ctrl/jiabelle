import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/orderDetails.css";

function OrderDetails(){

const { id } = useParams();
const navigate = useNavigate();

const [order,setOrder] = useState(null);

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

useEffect(()=>{

const fetchOrder = async ()=>{

try{

const res = await fetch(`${API}/api/orders/my`,{
headers:{ Authorization:`Bearer ${token}` }
});

const data = await res.json();
const found = data.find(o=>o._id===id);

setOrder(found);

}catch(err){
console.log(err);
}

};

fetchOrder();

},[API,id,token]);

if(!order) return <p style={{padding:"40px"}}>Loading...</p>;

const status = order.orderStatus || "processing";

const steps = [
"processing",
"placed",
"shipped",
"out_for_delivery",
"delivered"
];

const currentStep = steps.indexOf(status);

/* DELIVERY DATE */

const deliveryDate = new Date(order.createdAt);
deliveryDate.setDate(deliveryDate.getDate()+3);

/* STATUS MESSAGE */

const statusMessages = {
processing:"Your order is being prepared.",
placed:"Your order has been confirmed.",
shipped:"Your order has been shipped.",
out_for_delivery:"Your package is out for delivery.",
delivered:"Your order has been delivered.",
cancelled:"You cancelled this order."
};

/* CANCEL LOGIC */

const isAfterShipped =
status === "shipped" ||
status === "out_for_delivery" ||
status === "delivered";

/* CANCEL FUNCTION */

const cancelOrder = async () => {

if(isAfterShipped){
alert("Order already shipped. Cannot cancel.");
return;
}

try{

const res = await fetch(`${API}/api/orders/cancel/${order._id}`,{
method:"PUT",
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();

alert(data.message);

navigate("/orders");

}catch(err){
console.log(err);
alert("Cancel failed");
}

};

return(

<div className="order-details-page">

<button
className="back-btn"
onClick={()=>navigate("/orders")}
>
← Back to Orders
</button>

<h2 className="page-title">Order Tracking</h2>

{/* CANCELLED MESSAGE */}

{status==="cancelled" && (
<div className="cancel-alert">
❌ You cancelled this order.
</div>
)}

{/* ORDER SUMMARY */}

<div className="order-summary">

<div>
<strong>Customer</strong>
<p>{order.user?.name || "Customer"}</p>
</div>

<div>
<strong>Order ID</strong>
<p>#{order._id.slice(-8)}</p>
</div>

<div>
<strong>Total</strong>
<p>₹{order.totalAmount}</p>
</div>

<div>
<strong>Date</strong>
<p>{new Date(order.createdAt).toLocaleDateString()}</p>
</div>

</div>

{/* ADDRESS */}

<div className="address-box">

<h3>Delivery Address</h3>

<p>{order.shippingAddress?.name}</p>
<p>{order.shippingAddress?.address}</p>
<p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
<p>{order.shippingAddress?.pincode}</p>

</div>

{/* DELIVERY DATE */}

{status !== "cancelled" && (

<div className="delivery-box">

<strong>Estimated Delivery</strong>
<p>{deliveryDate.toDateString()}</p>

</div>

)}

<p className="status-message">
{statusMessages[status]}
</p>

{/* TRACKING BAR */}

{status !== "cancelled" && (

<div className="tracking-bar">

<div
className="progress"
style={{
width:`${(currentStep/(steps.length-1))*100}%`
}}
></div>

{steps.map((step,index)=>(

<div key={step} className="tracking-step">

<div className={`circle ${index<=currentStep?"active":""}`}>
{index<=currentStep ? "✓" : ""}
</div>

<p className={index<=currentStep?"active-text":""}>

{step === "out_for_delivery"
? "Out for Delivery"
: step.charAt(0).toUpperCase()+step.slice(1)}

</p>

</div>

))}

</div>

)}

{/* ORDER TIMELINE */}

<div className="timeline">

<h3>Order Updates</h3>

<ul>

<li>
<strong>{new Date(order.createdAt).toLocaleDateString()}</strong> — Order Placed
</li>

{status==="cancelled" ? (

<li className="cancel-text">
You cancelled this order
</li>

) : (

<>
<li>Order confirmed and preparing</li>

{["shipped","out_for_delivery","delivered"].includes(status) && (
<li>Order shipped from warehouse</li>
)}

{["out_for_delivery","delivered"].includes(status) && (
<li>Package is out for delivery</li>
)}

{status==="delivered" && (
<li>Package delivered successfully</li>
)}

</>

)}

</ul>

</div>

{/* CANCEL BUTTON */}

{!isAfterShipped && status !== "cancelled" && (

<div className="cancel-section">

<p className="cancel-info">
You can cancel this order until it is shipped.
</p>

<button className="cancel-btn" onClick={cancelOrder}>
Cancel Order
</button>

</div>

)}

{/* PRODUCTS */}

<h3 className="products-title">Products</h3>

<div className="products-list">

{order.products.map((item,index)=>{

const image =
item.product?.images?.[0] ||
item.product?.image ||
"";

return(

<div className="product-row" key={index}>

<img src={image} alt="product"/>

<div className="product-info">

<h4>{item.product?.name}</h4>

<p>Quantity: {item.qty}</p>

<p>Price: ₹{item.price}</p>

<p>Total: ₹{item.qty*item.price}</p>

</div>

</div>

);

})}

</div>

{/* REVIEW */}

{status==="delivered" && (

<div className="review-box">

<h3>Rate Your Product</h3>

<button className="review-btn">
Write a Review
</button>

</div>

)}

</div>

);

}

export default OrderDetails;