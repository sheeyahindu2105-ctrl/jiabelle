import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;

  const wishlistKey = userId ? `wishlist_${userId}` : "wishlist_guest";
  const cartKey = userId ? `cart_${userId}` : "cart_guest";

  /* ================= LOAD ================= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    setWishlist(saved);
  }, [wishlistKey]);

  /* ================= SAVE ================= */
  const saveWishlist = (updated) => {
    setWishlist(updated);
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
  };

  /* ================= REMOVE ================= */
  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item._id !== id);
    saveWishlist(updated);
  };

  /* ================= MOVE TO CART ================= */
  const moveToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

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

    localStorage.setItem(cartKey, JSON.stringify(cart));
    removeFromWishlist(product._id);

    alert("Moved to cart");
  };

  return (
    <div className="wishlist-page">
      <h2>Your Wishlist</h2>

      {/* EMPTY STATE */}
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h3>No items in wishlist</h3>
          <p>Start adding products you love ❤️</p>

          <button onClick={() => navigate("/home")}>
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div className="wishlist-card" key={item._id}>
              <img
                src={item.images?.[0]}
                alt={item.name}
              />

              <h4>{item.name}</h4>
              <p className="price">₹{item.price}</p>

              <div className="wishlist-buttons">
                <button onClick={() => moveToCart(item)}>
                  Move to Cart
                </button>

                <button
                  className="remove-btn"
                  onClick={() => removeFromWishlist(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() => navigate("/home")}
      >
        ← Back to Home
      </button>
    </div>
  );
}

export default Wishlist;