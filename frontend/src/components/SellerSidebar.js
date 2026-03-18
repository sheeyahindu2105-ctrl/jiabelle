import { Link } from "react-router-dom";

function SellerSidebar(){

return(

<div style={{
width:"240px",
background:"#0f172a",
color:"white",
height:"100vh",
padding:"25px",
position:"fixed"
}}>

<h2 style={{
color:"#ef4444",
marginBottom:"35px"
}}>
Seller Panel
</h2>

<div style={{
display:"flex",
flexDirection:"column",
gap:"18px"
}}>

<Link className="side-link" to="/seller-dashboard">📊 Dashboard</Link>

<Link className="side-link" to="/seller/products">📦 Products</Link>

<Link className="side-link" to="/seller/orders">🛒 Orders</Link>

<Link className="side-link" to="/seller/analytics">📈 Analytics</Link>

<Link className="side-link" to="/notifications">🔔 Notifications</Link>

</div>

</div>

);

}

export default SellerSidebar;