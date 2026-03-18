import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    const saved =
      JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];
    setWishlist(saved);
  }, [userId]);

  const saveWishlist = (updated) => {
    setWishlist(updated);
    localStorage.setItem(
      `wishlist_${userId}`,
      JSON.stringify(updated)
    );
  };

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item._id !== id);
    saveWishlist(updated);
  };

  const moveToCart = (product) => {
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
    removeFromWishlist(product._id);
    alert("Moved to cart");
  };

  return (
    <div className="wishlist-page">
      <h2>Your Wishlist</h2>

      {wishlist.length === 0 ? (
        <p>No items in wishlist</p>
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

      <button className="back-btn" onClick={() => navigate("/home")}>
        ← Back to Home
      </button>
    </div>
  );
}

export default Wishlist;
