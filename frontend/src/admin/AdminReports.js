import { useEffect, useState } from "react";
import {
LineChart,
Line,
BarChart,
Bar,
PieChart,
Pie,
Cell,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer
} from "recharts";

import "../styles/AdminReports.css";

function AdminReports(){

const API =
  process.env.REACT_APP_API_URL ||
  "https://jiabelle-backend.onrender.com";
const token = localStorage.getItem("token");

const [kpi,setKpi] = useState({});
const [sales,setSales] = useState([]);
const [orders,setOrders] = useState([]);
const [categories,setCategories] = useState([]);
const [sellers,setSellers] = useState([]);
const [products,setProducts] = useState([]);

const [loading,setLoading] = useState(true);
const [error,setError] = useState("");

const COLORS = ["#3498db","#2ecc71","#9b59b6","#f39c12","#e74c3c","#16a085"];

/* ================= EXPORT FUNCTIONS ================= */

const exportCSV = () => {
window.open(`${API}/api/admin/reports/export/orders`);
};

const exportPDF = () => {
window.open(`${API}/api/admin/reports/export/revenue`);
};

useEffect(()=>{

if(!token){
setError("Unauthorized");
setLoading(false);
return;
}

const headers = {
Authorization:`Bearer ${token}`
};

const fetchReports = async () => {

try{

const res = await fetch(`${API}/api/admin/reports`,{headers});

if(!res.ok) throw new Error("API error");

const data = await res.json();

setKpi(data.stats || {});
setSales(data.sales || []);
setOrders(data.ordersPerDay || []);
setCategories(data.categorySales || []);
setSellers(data.sellerRevenue || []);
setProducts(data.topProducts || []);

}catch(err){

console.error(err);
setError("Failed to load reports");

}finally{

setLoading(false);

}

};

fetchReports();

},[API,token]);

if(loading){
return(
<div className="report-container">
<h2>Reports & Analytics</h2>
<p className="empty">Loading reports...</p>
</div>
);
}

if(error){
return(
<div className="report-container">
<h2>Reports & Analytics</h2>
<p className="empty">{error}</p>
</div>
);
}

return(

<div className="report-container">

<h2>Reports & Analytics</h2>

{/* EXPORT BUTTONS */}

<div className="export-buttons">
<button className="export-btn" onClick={exportCSV}>
Export Orders CSV
</button>

<button className="export-btn" onClick={exportPDF}>
Export Revenue PDF
</button>
</div>

{/* KPI CARDS */}

<div className="report-cards">

<div className="report-card">
<p>Total Revenue</p>
<h3>₹{kpi.totalRevenue || 0}</h3>
</div>

<div className="report-card">
<p>Total Orders</p>
<h3>{kpi.totalOrders || 0}</h3>
</div>

<div className="report-card">
<p>Total Users</p>
<h3>{kpi.totalUsers || 0}</h3>
</div>

<div className="report-card">
<p>Products Sold</p>
<h3>{kpi.productsSold || 0}</h3>
</div>

</div>

{/* MONTHLY REVENUE */}

<div className="chart-box">

<h4>Monthly Revenue</h4>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={sales}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="month"/>

<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="revenue"
stroke="#3b82f6"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

{/* ORDERS PER DAY */}

<div className="chart-box">

<h4>Orders Per Day</h4>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={orders}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="day"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="count" fill="#22c55e"/>

</BarChart>

</ResponsiveContainer>

</div>

{/* CATEGORY SALES */}

<div className="chart-box">

<h4>Sales By Category</h4>

<ResponsiveContainer width="100%" height={300}>

<PieChart>

<Pie
data={categories}
dataKey="count"
nameKey="category"
cx="50%"
cy="50%"
outerRadius={100}
label
>

{categories.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]}/>
))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

{/* SELLER REVENUE */}

<div className="chart-box">

<h4>Seller Revenue</h4>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={sellers}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="seller"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="revenue" fill="#9b59b6"/>

</BarChart>

</ResponsiveContainer>

</div>

{/* TOP PRODUCTS */}

<div className="table-box">

<h4>Top Selling Products</h4>

<table>

<thead>
<tr>
<th>Product</th>
<th>Sold</th>
</tr>
</thead>

<tbody>

{products.length === 0 ? (
<tr>
<td colSpan="2" className="empty">No product data</td>
</tr>
) : (

products.map(p=>(
<tr key={p._id}>
<td>{p.name}</td>
<td>{p.sold}</td>
</tr>
))

)}

</tbody>

</table>

</div>

</div>

);

}

export default AdminReports;