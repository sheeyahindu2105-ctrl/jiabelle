import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/productDetails.css";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state;

  const API = process.env.REACT_APP_API_URL || "https://jiabelle-backend.onrender.com";

  /* ================= USER ================= */

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch {
    user = null;
  }

  const userId = user?._id || user?.id;

  /* ================= STATES ================= */

  const [wishlist, setWishlist] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!product) return;

    setReviews(product.reviews || []);

    if (!userId) return;

    const saved =
      JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];

    setWishlist(saved);
  }, [product, userId]);

  /* ================= GUARD ================= */

  if (!product) {
    return <p style={{ textAlign: "center" }}>Product not found</p>;
  }

  /* ================= FUNCTIONS ================= */

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleWishlist = () => {
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      alert("Login first");
      navigate("/login");
      return;
    }

    let updated =
      JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];

    const exists = updated.find((item) => item._id === product._id);

    updated = exists
      ? updated.filter((item) => item._id !== product._id)
      : [...updated, product];

    setWishlist(updated);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updated));
  };

  const isWishlisted = wishlist.some(
    (item) => item._id === product._id
  );

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login first");
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

  const handlePlaceOrder = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem(
      "checkoutItems",
      JSON.stringify([{ ...product, quantity: 1 }])
    );

    navigate("/checkout");
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login first");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `${API}/api/products/${product._id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const data = await res.json();

      setReviews(data.reviews || []);
      setRating(0);
      setComment("");
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= IMAGE ================= */

  const productImages = product.images || [];

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

  /* ================= UI ================= */
return (
  <div className="product-details">

    <Navbar
      search=""
      setSearch={() => {}}
      products={[]}
    />
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details-container">

        {/* IMAGE */}
        <div className="image-section">
          <div className="main-image-wrapper">

            {product.discount > 0 && (
              <div className="image-discount">
                {product.discount}% OFF
              </div>
            )}

            <img src={currentImage} alt={product.name} />

            {productImages.length > 1 && (
              <>
                <button className="arrow left" onClick={prevImage}>‹</button>
                <button className="arrow right" onClick={nextImage}>›</button>
              </>
            )}

            <button className="wishlist-heart" onClick={toggleWishlist}>
              {isWishlisted ? "❤️" : "🤍"}
            </button>
          </div>

          {/* THUMBNAILS */}
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

        {/* DETAILS */}
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
            <button onClick={handleAddToCart}>Add to Cart</button>
            <button className="order-btn" onClick={handlePlaceOrder}>
              Buy Now
            </button>
            <button className="share-btn" onClick={handleShare}>
              🔗 Share
            </button>
          </div>

          {/* REVIEW */}
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

            {reviews.length > 0 && (
              <div className="reviews-list">
                {reviews.map((r, i) => (
                  <div key={i} className="review-item">
                    <strong>{r.user?.name || "User"}</strong>
                    <div>{"★".repeat(r.rating)}</div>
                    <p>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default ProductDetails;