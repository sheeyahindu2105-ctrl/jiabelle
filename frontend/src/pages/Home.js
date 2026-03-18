import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

import newImg from "../assets/categories/new.jpg";
import handbagImg from "../assets/categories/best.jpg";
import slingImg from "../assets/categories/sling.jpg";
import satchelImg from "../assets/categories/satchel.jpg";
import toteImg from "../assets/categories/tote.jpg";
import backpackImg from "../assets/categories/backpack.jpg";
import clutchImg from "../assets/categories/clutch.jpg";
import allImg from "../assets/categories/all.jpg";

import Navbar from "../components/Navbar";

function Home() {

const navigate = useNavigate();

const [products, setProducts] = useState([]);
const [wishlist, setWishlist] = useState([]);
const [loading, setLoading] = useState(true);

/* ⭐ IMAGE SLIDER STATE */

const [imageIndexes,setImageIndexes] = useState({});

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const [search, setSearch] = useState("");

const filteredProducts = products.filter((p) =>
  p.name?.toLowerCase().includes(search.toLowerCase())
);
/* USER INFO */

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?._id || user?.id;

/* ================= ROLE PROTECTION ================= */

useEffect(()=>{

if(user?.role==="seller"){
navigate("/seller-dashboard",{replace:true});
}

if(user?.role==="admin"){
navigate("/admin/dashboard",{replace:true});
}

},[navigate,user]);

/* ================= FETCH PRODUCTS ================= */

useEffect(()=>{

const fetchProducts=async()=>{

try{

const res=await fetch(`${API}/api/products`);
const data=await res.json();

setProducts(Array.isArray(data)?data:[]);

}catch(err){

console.error("Product fetch error:",err);
setProducts([]);

}finally{

setLoading(false);

}

};

fetchProducts();

},[API]);

/* ================= WISHLIST LOAD ================= */

useEffect(()=>{

if(!userId) return;

const saved=
JSON.parse(localStorage.getItem(`wishlist_${userId}`))||[];

setWishlist(saved);

},[userId]);

/* ================= WISHLIST TOGGLE ================= */

const toggleWishlist=(product)=>{

const token=localStorage.getItem("token");

if(!token||!userId){
alert("Please login to use wishlist");
navigate("/login");
return;
}

let saved=
JSON.parse(localStorage.getItem(`wishlist_${userId}`))||[];

const exists=saved.find(item=>item._id===product._id);

if(exists){
saved=saved.filter(item=>item._id!==product._id);
}else{
saved.push(product);
}

setWishlist(saved);

localStorage.setItem(
`wishlist_${userId}`,
JSON.stringify(saved)
);

};

const isWishlisted=(id)=>
wishlist.some(item=>item._id===id);

/* ================= IMAGE CHANGE ================= */

const changeImage=(id,dir)=>{

setImageIndexes(prev=>{

const product=products.find(p=>p._id===id);
if(!product||!product.images) return prev;

const total=product.images.length;

const current=prev[id]||0;

let next=current+dir;

if(next<0) next=total-1;
if(next>=total) next=0;

return {...prev,[id]:next};

});

};

return(

<div className="home">

<Navbar search={search} setSearch={setSearch} products={products}/>{/* CATEGORY ICONS */}

<section className="category-icons">

<div className="cat-item" onClick={()=>navigate("/category/all")}>
<img src={allImg} alt="All"/>
<span>All</span>
</div>

<div className="cat-item" onClick={()=>navigate("/category/new")}>
<img src={newImg} alt="New"/>
<span>New</span>
</div>

<div className="cat-item" onClick={()=>navigate("/category/handbag")}>
<img src={handbagImg} alt="Handbags"/>
<span>Handbags</span>
</div>

<div className="cat-item" onClick={()=>navigate("/category/sling")}>
<img src={slingImg} alt="Sling Bags"/>
<span>Sling Bags</span>
</div>

<div className="cat-item" onClick={()=>navigate("/category/satchel")}>
<img src={satchelImg} alt="Satchel Bags"/>
<span>Satchel Bags</span>
</div>

<div className="cat-item" onClick={()=>navigate("/category/tote")}>
<img src={toteImg} alt="Tote Bags"/>
<span>Tote Bags</span>
</div>

<div className="cat-item" onClick={()=>navigate("/category/backpack")}>
<img src={backpackImg} alt="Backpacks"/>
<span>Backpacks</span>
</div>

<div className="cat-item" onClick={()=>navigate("/category/clutch")}>
<img src={clutchImg} alt="Clutches"/>
<span>Clutches</span>
</div>

</section>

{/* PRODUCTS */}

<h2 className="section-title">All Bags</h2>

{loading &&(
<p style={{textAlign:"center"}}>Loading products...</p>
)}

<div className="product-grid">

{filteredProducts.map((p)=>{
const index=imageIndexes[p._id]||0;

const productImage=p.images?.[index]||p.images?.[0];

const imageUrl=
productImage?.startsWith("http")
? productImage
: `${API}${productImage}`;

return(

<div
className="product-card"
key={p._id}
onClick={()=>navigate(`/product/${p._id}`,{state:p})}
>

{/* DISCOUNT */}

{p.discount>0&&(
<div className="discount-badge">
{p.discount}% OFF
</div>
)}

{/* WISHLIST */}

<button
className="wishlist-btn"
onClick={(e)=>{
e.stopPropagation();
toggleWishlist(p);
}}
>
{isWishlisted(p._id)?"❤️":"🤍"}
</button>

{/* IMAGE SLIDER */}

{/* IMAGE SLIDER */}

<div className="product-image-container">

<button
className="img-arrow left"
onClick={(e)=>{
e.stopPropagation();
changeImage(p._id,-1);
}}
>
‹
</button>

<img src={imageUrl} alt={p.name} />

<button
className="img-arrow right"
onClick={(e)=>{
e.stopPropagation();
changeImage(p._id,1);
}}
>
›
</button>

</div>

{/* DOTS */}

<div className="image-dots">
{p.images?.map((_,i)=>(
<span
key={i}
className={`dot ${i===index?"active":""}`}
onClick={(e)=>{
e.stopPropagation();
setImageIndexes(prev=>({...prev,[p._id]:i}));
}}
></span>
))}
</div>
<h4>{p.name}</h4>

<div style={{fontSize:"14px",marginBottom:"6px",color:"#f5a623"}}>
{"★".repeat(Math.round(p.ratings||0))}
{"☆".repeat(5-Math.round(p.ratings||0))}
<span style={{color:"#555",marginLeft:"6px"}}>
{p.ratings||0} ({p.numReviews||0} reviews)
</span>
</div>

<p className="price">

<span className="sell-price">
₹{p.price}
</span>

{p.originalPrice>0&&(
<span className="original-price">
₹{p.originalPrice}
</span>
)}

{p.discount>0&&(
<span className="discount-text">
{p.discount}% OFF
</span>
)}

</p>

</div>

);

})}

</div>

{/* ===== INFO SECTION ===== */}

<section className="info-section">

<div className="info-container">

<div className="info-box">
<h3>About Us</h3>
<p>
JIA BELLE is a premium handbag brand designed for modern women who
love elegance, style, and functionality.
</p>
</div>

<div className="info-box">
<h3>Contact Us</h3>
<p>Email: support@jiabelle.com</p>
<p>Phone: +91 9876543210</p>
<p>Location: Gujarat, India</p>
</div>

<div className="info-box">
<h3>Customer Support</h3>
<p>Shipping Information</p>
<p>Returns & Refunds</p>
<p>Order Tracking</p>
</div>

<div className="info-box">
<h3>Follow Us</h3>
<p>Instagram</p>
<p>Facebook</p>
<p>Twitter</p>
</div>

</div>

</section>
</div>


);

}

export default Home;