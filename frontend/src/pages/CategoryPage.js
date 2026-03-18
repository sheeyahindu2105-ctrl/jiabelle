import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/category.css";
import "../styles/home.css";

import allBanner from "../assets/banners/all.jpg";
import newBanner from "../assets/banners/new.jpg";
import handbagBanner from "../assets/banners/handbag.jpg";
import slingBanner from "../assets/banners/sling.jpg";
import satchelBanner from "../assets/banners/satchel.jpg";
import toteBanner from "../assets/banners/tote.jpg";
import backpackBanner from "../assets/banners/backpack.jpg";
import clutchBanner from "../assets/banners/clutch.jpg";

function CategoryPage(){

const { name } = useParams();
const navigate = useNavigate();

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const [products,setProducts] = useState([]);
const [wishlist,setWishlist] = useState([]);
const [search,setSearch] = useState("");
const [sort,setSort] = useState("newest");
const [priceFilter,setPriceFilter] = useState("");

/* FETCH PRODUCTS */

useEffect(()=>{

const fetchProducts = async () => {

try{

const res = await fetch(`${API}/api/products`);
const data = await res.json();

setProducts(Array.isArray(data) ? data : []);

}catch(err){
console.log(err);
}

};

fetchProducts();

},[API]);

/* WISHLIST */

useEffect(()=>{
const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
setWishlist(saved);
},[]);

const toggleWishlist = (product,e)=>{

e.stopPropagation();

let updated;

if(wishlist.find(w=>w._id===product._id)){
updated = wishlist.filter(w=>w._id!==product._id);
}else{
updated = [...wishlist,product];
}

setWishlist(updated);
localStorage.setItem("wishlist",JSON.stringify(updated));

};

/* BANNERS */

const bannerMap = {
all:allBanner,
new:newBanner,
handbag:handbagBanner,
sling:slingBanner,
satchel:satchelBanner,
tote:toteBanner,
backpack:backpackBanner,
clutch:clutchBanner
};

/* FILTER */

let filtered = products;

if(name !== "all" && name !== "new"){
filtered = filtered.filter(
p => p.category?.toLowerCase() === name.toLowerCase()
);
}

/* SEARCH */

filtered = filtered.filter(p =>
(p.name || "").toLowerCase().includes(search.toLowerCase())
);

/* PRICE FILTER */

if(priceFilter==="low"){
filtered = filtered.filter(p=>p.price < 2000);
}

if(priceFilter==="mid"){
filtered = filtered.filter(p=>p.price >=2000 && p.price<=5000);
}

if(priceFilter==="high"){
filtered = filtered.filter(p=>p.price >5000);
}

/* SORT */

if(sort==="newest"){
filtered=[...filtered].sort(
(a,b)=>new Date(b.createdAt) - new Date(a.createdAt)
);
}

if(sort==="lowprice"){
filtered=[...filtered].sort((a,b)=>a.price-b.price);
}

if(sort==="highprice"){
filtered=[...filtered].sort((a,b)=>b.price-a.price);
}

/* CATEGORY LIST FOR NEW PAGE */

const categories = [
"handbag",
"sling",
"satchel",
"tote",
"backpack",
"clutch"
];

return(

<div className="home">

<header className="home-header">

<div className="logo" onClick={()=>navigate("/home")}>
JIA BELLE
</div>

<input
className="search-bar"
placeholder="Search handbags..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<div className="header-actions">

<button onClick={()=>navigate("/wishlist")}>❤️</button>
<button onClick={()=>navigate("/cart")}>🛒</button>
<button onClick={()=>navigate("/profile")}>👤</button>

</div>

</header>

{/* BANNER */}

<div className="category-banner">
<img src={bannerMap[name] || bannerMap["all"]} alt={name}/>
</div>

<div className="category-layout">

{/* FILTER */}

<div className="filters">

<h3>Filters</h3>

<h4>Price</h4>

<label>
<input type="radio" name="price"
onChange={()=>setPriceFilter("low")}/>
Under ₹2000
</label>

<label>
<input type="radio" name="price"
onChange={()=>setPriceFilter("mid")}/>
₹2000 - ₹5000
</label>

<label>
<input type="radio" name="price"
onChange={()=>setPriceFilter("high")}/>
Above ₹5000
</label>

<button onClick={()=>setPriceFilter("")}>
Clear Filters
</button>

</div>

{/* PRODUCTS */}

<div className="products-section">

<div className="sort-bar">

<span>{filtered.length} Products</span>

<select onChange={(e)=>setSort(e.target.value)}>

<option value="newest">Newest</option>
<option value="lowprice">Price Low → High</option>
<option value="highprice">Price High → Low</option>

</select>

</div>

{/* ===== NEW CATEGORY PAGE LOGIC ===== */}

{name === "new" ? (

categories.map((cat)=>{

const latestProducts = products
.filter(p => p.category?.toLowerCase() === cat)
.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
.slice(0,12);

if(latestProducts.length===0) return null;

return(

<div key={cat} style={{marginBottom:"40px"}}>

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"15px"
}}>

<h3 style={{textTransform:"capitalize"}}>
Latest {cat} Bags
</h3>

<button
onClick={()=>navigate(`/category/${cat}`)}
style={{
background:"#c1121f",
color:"#fff",
border:"none",
padding:"6px 14px",
borderRadius:"6px",
cursor:"pointer"
}}
>
View All →
</button>

</div>

<div className="product-grid">

{latestProducts.map((p)=>{

const productImage =
p?.images?.length>0 ? p.images[0] : "";

const imageUrl =
productImage.startsWith("http")
? productImage
: `${API}${productImage}`;

return(

<div
className="product-card"
key={p._id}
onClick={()=>navigate(`/product/${p._id}`,{state:p})}
>

{p.discount > 0 && (
<div className="discount-badge">
{p.discount}% OFF
</div>
)}

<button
className="wishlist-btn"
onClick={(e)=>toggleWishlist(p,e)}
>
{wishlist.some(w=>w._id===p._id) ? "❤️":"🤍"}
</button>

<img src={imageUrl} alt={p.name}/>

<h4>{p.name}</h4>

<div style={{fontSize:"14px",marginBottom:"6px",color:"#f5a623"}}>
{"★".repeat(Math.round(p.ratings||0))}
{"☆".repeat(5-Math.round(p.ratings||0))}
<span style={{color:"#555",marginLeft:"6px"}}>
{p.ratings||0} ({p.numReviews||0} reviews)
</span>
</div>

<div className="price-row">

<span className="sell-price">
₹{p.price}
</span>

{p.originalPrice > 0 && (
<span className="original-price">
₹{p.originalPrice}
</span>
)}

{p.discount > 0 && (
<span className="discount-text">
{p.discount}% OFF
</span>
)}

</div>
</div>

);

})}

</div>

</div>

);

})

) : (

<div className="product-grid">

{filtered.map((p)=>{

const productImage =
p?.images?.length>0 ? p.images[0] : "";

const imageUrl =
productImage.startsWith("http")
? productImage
: `${API}${productImage}`;

return(

<div
className="product-card"
key={p._id}
onClick={()=>navigate(`/product/${p._id}`,{state:p})}
>

{p.discount > 0 && (
<div className="discount-badge">
{p.discount}% OFF
</div>
)}

<button
className="wishlist-btn"
onClick={(e)=>toggleWishlist(p,e)}
>
{wishlist.some(w=>w._id===p._id) ? "❤️":"🤍"}
</button>

<img src={imageUrl} alt={p.name}/>

<h4>{p.name}</h4>

<div style={{fontSize:"14px",marginBottom:"6px",color:"#f5a623"}}>
{"★".repeat(Math.round(p.ratings||0))}
{"☆".repeat(5-Math.round(p.ratings||0))}
<span style={{color:"#555",marginLeft:"6px"}}>
{p.ratings||0} ({p.numReviews||0} reviews)
</span>
</div>

<div className="price-row">

<span className="sell-price">
₹{p.price}
</span>

{p.originalPrice > 0 && (
<span className="original-price">
₹{p.originalPrice}
</span>
)}

{p.discount > 0 && (
<span className="discount-text">
{p.discount}% OFF
</span>
)}

</div>

</div>

);

})}

</div>

)}

</div>

</div>

</div>

);

}

export default CategoryPage;