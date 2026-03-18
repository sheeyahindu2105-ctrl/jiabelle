import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/productDetails.css";

function ProductDetails() {

const location = useLocation();
const navigate = useNavigate();
const product = location.state;

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* USER INFO */

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?._id || user?.id;

/* ================= STATES ================= */

const [wishlist, setWishlist] = useState([]);
const [selectedIndex, setSelectedIndex] = useState(0);

const [search, setSearch] = useState("");
const [suggestions, setSuggestions] = useState([]);
const [products, setProducts] = useState([]);

const [rating, setRating] = useState(0);
const [comment, setComment] = useState("");

const [reviews, setReviews] = useState(product?.reviews || []);

const [editingReviewId, setEditingReviewId] = useState(null);
const [editComment, setEditComment] = useState("");
const [editRating, setEditRating] = useState(0);

/* ================= FETCH PRODUCTS ================= */

useEffect(() => {

const fetchProducts = async () => {

try {

const res = await fetch(`${API}/api/products`);
const data = await res.json();

setProducts(Array.isArray(data) ? data : []);

} catch (err) {

console.error("Search fetch error:", err);

}

};

fetchProducts();

}, [API]);

/* ================= SEARCH ================= */

useEffect(() => {

if (!search.trim()) {
setSuggestions([]);
return;
}

const results = products
.filter((p) =>
p.name.toLowerCase().includes(search.toLowerCase())
)
.slice(0, 5);

setSuggestions(results);

}, [search, products]);

/* ================= WISHLIST ================= */

useEffect(() => {

if (!userId) return;

const saved =
JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];

setWishlist(saved);

}, [userId]);

if (!product) {
return <p>Product not found</p>;
}

/* ================= IMAGE ================= */

const productImages =
product.images && product.images.length > 0
? product.images
: [];

const getImageUrl = (img) => {

if (!img) return "/placeholder.png";

if (typeof img === "string") {
return img.startsWith("http") ? img : `${API}${img}`;
}

if (img.url) {
return img.url.startsWith("http")
? img.url
: `${API}/${img.url}`;
}

return "/placeholder.png";

};

const currentImage = getImageUrl(productImages[selectedIndex]);

/* ================= WISHLIST TOGGLE ================= */

const toggleWishlist = () => {

const token = localStorage.getItem("token");

if (!token || !userId) {
alert("Please login to use wishlist");
navigate("/login");
return;
}

let updated =
JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];

const exists = updated.find((item) => item._id === product._id);

if (exists) {
updated = updated.filter((item) => item._id !== product._id);
} else {
updated.push(product);
}

setWishlist(updated);

localStorage.setItem(
`wishlist_${userId}`,
JSON.stringify(updated)
);

};

const isWishlisted = wishlist.some(
(item) => item._id === product._id
);

/* ================= ADD TO CART ================= */

const handleAddToCart = () => {

const token = localStorage.getItem("token");

if (!token) {
alert("Please login to add items to cart");
navigate("/login");
return;
}

let cart =
JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

const exists = cart.find((item) => item._id === product._id);

if (exists) {

cart = cart.map((item) =>
item._id === product._id
? { ...item, quantity: (item.quantity || 1) + 1 }
: item
);

} else {

cart.push({ ...product, quantity: 1 });

}

localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
alert("Added to cart");

};

/* ================= BUY NOW ================= */

const handlePlaceOrder = () => {

const token = localStorage.getItem("token");

if (!token) {
navigate("/login");
return;
}

const buyNowItem = [{ ...product, quantity: 1 }];

localStorage.setItem(
"checkoutItems",
JSON.stringify(buyNowItem)
);

navigate("/checkout");

};

/* ================= ADD REVIEW ================= */

const submitReview = async () => {

const token = localStorage.getItem("token");

if (!token) {
alert("Please login to submit review");
navigate("/login");
return;
}

try {

const res = await fetch(`${API}/api/products/${product._id}/review`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`
},
body: JSON.stringify({
rating,
comment
})
});

const data = await res.json();

alert("Review submitted!");

setReviews(data.reviews || []);

setRating(0);
setComment("");

} catch (err) {

console.log(err);
alert("Error submitting review");

}

};

/* ================= DELETE REVIEW ================= */

const deleteReview = async (reviewId) => {

const token = localStorage.getItem("token");

try {

await fetch(`${API}/api/products/${product._id}/review/${reviewId}`, {
method: "DELETE",
headers: {
Authorization: `Bearer ${token}`
}
});

setReviews((prev) => prev.filter((r) => r._id !== reviewId));

} catch (err) {

console.log(err);

}

};

/* ================= UPDATE REVIEW ================= */

const updateReview = async () => {

const token = localStorage.getItem("token");

try {

const res = await fetch(`${API}/api/products/${product._id}/review/${editingReviewId}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`
},
body: JSON.stringify({
rating: editRating,
comment: editComment
})
});

const data = await res.json();

setReviews(data.reviews);
setEditingReviewId(null);

} catch (err) {

console.log(err);

}

};

/* ================= IMAGE SLIDER ================= */

const prevImage = () => {

setSelectedIndex((prev) =>
prev === 0 ? productImages.length - 1 : prev - 1
);

};

const nextImage = () => {

setSelectedIndex((prev) =>
prev === productImages.length - 1 ? 0 : prev + 1
);

};

return (

<div className="product-details">

<header className="pd-header">

<div className="pd-logo" onClick={() => navigate("/home")}>
JIA BELLE
</div>

<div className="pd-search-box">

<input
type="text"
placeholder="Search handbags, clutches..."
value={search}
onChange={(e) => setSearch(e.target.value)}
/>

{suggestions.length > 0 && (

<div className="pd-search-dropdown">

{suggestions.map((item) => (

<div
key={item._id}
className="pd-search-item"
onClick={() =>
navigate(`/product/${item._id}`, {
state: item,
})
}
>
{item.name}
</div>

))}

</div>

)}

</div>

</header>

<button className="back-btn" onClick={() => navigate(-1)}>
← Back
</button>

<div className="details-container">

{/* IMAGE SECTION */}

<div className="image-section">

<div className="main-image-wrapper">

{product.discount > 0 && (
<div className="image-discount">
{product.discount}% OFF
</div>
)}

<img src={currentImage} alt={product.name} />

<button className="arrow left" onClick={prevImage}>‹</button>
<button className="arrow right" onClick={nextImage}>›</button>

<button
className="wishlist-heart"
onClick={toggleWishlist}
>
{isWishlisted ? "❤️" : "🤍"}
</button>

</div>

<div className="thumb-row">

{productImages.map((img, i) => (

<img
key={i}
src={getImageUrl(img)}
alt="thumb"
className={`thumb ${selectedIndex === i ? "active" : ""}`}
onClick={() => setSelectedIndex(i)}
/>

))}

</div>

</div>

{/* PRODUCT INFO */}

<div className="details-info">

<h2>{product.name}</h2>

<div className="price-section">

<span className="price">₹{product.price}</span>

{product.originalPrice > 0 && (
<span className="old-price">
₹{product.originalPrice}
</span>
)}

</div>

<p className="desc">{product.description}</p>

<div className="details-buttons">

<button disabled={product.stock === 0} onClick={handleAddToCart}>
Add to Cart
</button>

<button
className="order-btn"
disabled={product.stock === 0}
onClick={handlePlaceOrder}
>
Buy Now
</button>

</div>

<div className="review-section">

<h3>Write a Review</h3>

<div className="star-rating">
{[1,2,3,4,5].map((star)=>(
<span
key={star}
className={star <= rating ? "star active" : "star"}
onClick={()=>setRating(star)}
>
★
</span>
))}
</div>

<textarea
placeholder="Write your review"
value={comment}
onChange={(e)=>setComment(e.target.value)}
/>

<button onClick={submitReview}>
Submit Review
</button>

</div>

<h3>Customer Reviews</h3>

{reviews?.map((r)=>(
<div key={r._id} className="review-item">

<strong>{r.name}</strong>

<div>
{"★".repeat(r.rating)}
{"☆".repeat(5-r.rating)}
</div>

<p>{r.comment}</p>

{userId === r.user && (

<div className="review-actions">

<button
className="edit-btn"
onClick={()=>{
setEditingReviewId(r._id);
setEditComment(r.comment);
setEditRating(r.rating);
}}
>
Edit
</button>

<button
className="delete-btn"
onClick={()=>deleteReview(r._id)}
>
Delete
</button>

</div>

)}

{editingReviewId === r._id && (

<div className="edit-review-box">

<div className="star-rating">
{[1,2,3,4,5].map((star)=>(
<span
key={star}
className={star <= editRating ? "star active" : "star"}
onClick={()=>setEditRating(star)}
>
★
</span>
))}
</div>

<textarea
value={editComment}
onChange={(e)=>setEditComment(e.target.value)}
/>

<button onClick={updateReview}>
Update Review
</button>

</div>

)}

</div>
))}

</div>

</div>

</div>

);

}

export default ProductDetails;

