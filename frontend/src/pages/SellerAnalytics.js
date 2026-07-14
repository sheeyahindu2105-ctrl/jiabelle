import { useEffect,useState } from "react";
import SellerSidebar from "../components/SellerSidebar";
import { Bar } from "react-chartjs-2";

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
);

function SellerAnalytics(){

const [orders, setOrders] = useState([]);

const token = localStorage.getItem("token");

const API =
  process.env.REACT_APP_API_URL ||
  "https://jiabelle-backend.onrender.com";

useEffect(() => {
fetch(
`${API}/api/orders/seller`,
{
headers:{Authorization:`Bearer ${token}`}
}
)
.then(res=>res.json())
.then(data=>setOrders(data || []));

}, [API, token]);

/* CALCULATE MONTHLY REVENUE */

const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const revenue=new Array(12).fill(0);

orders.forEach(order=>{

const m=new Date(order.createdAt).getMonth();

revenue[m]+=order.totalAmount;

});

const data={
labels:months,
datasets:[
{
label:"Monthly Revenue",
data:revenue,
backgroundColor:"#6366f1"
}
]
};

return(

<div className="admin-layout">

<SellerSidebar/>

<div className="admin">

<h2>Sales Analytics</h2>

<div style={{
background:"white",
padding:"30px",
borderRadius:"10px"
}}>

<Bar data={data}/>

</div>

</div>

</div>

);

}

export default SellerAnalytics;