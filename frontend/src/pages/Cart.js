import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cart.css";

function Cart() {
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || user?.id;

  const cartKey = userId ? `cart_${userId}` : "cart_guest";

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(cartKey)) || [];
    setCart(saved);
  }, [cartKey]);

  /* ================= SAVE CART ================= */
  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem(cartKey, JSON.stringify(updated));
  };

  /* ================= UPDATE QTY ================= */
  const updateQuantity = (id, change) => {
    const updated = cart.map((item) => {
      if (item._id === id) {
        const newQty = (item.quantity || 1) + change;
        return {
          ...item,
          quantity: newQty < 1 ? 1 : newQty,
        };
      }
      return item;
    });

    saveCart(updated);
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    saveCart(updated);
    setSelected(selected.filter((sid) => sid !== id));
  };

  /* ================= SELECT ITEM ================= */
  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((sid) => sid !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    const selectedItems = cart.filter((item) =>
      selected.includes(item._id)
    );

    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem(
      "checkoutItems",
      JSON.stringify(selectedItems)
    );

    navigate("/checkout");
  };

  /* ================= TOTAL ================= */
  const total = cart
    .filter((item) => selected.includes(item._id))
    .reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate("/home")}>
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="cart-container">
          {/* LEFT - ITEMS */}
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-item" key={item._id}>
                <input
                  type="checkbox"
                  checked={selected.includes(item._id)}
                  onChange={() => toggleSelect(item._id)}
                />

                <img src={item.images?.[0]} alt={item.name} />

                <div className="cart-info">
                  <h4>{item.name}</h4>
                  <p className="price">₹{item.price}</p>

                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item._id, -1)}>
                      -
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item._id, 1)}>
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT - SUMMARY */}
          <div className="cart-summary">
            <h3>Total: ₹{total}</h3>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Checkout Selected Items
            </button>
          </div>
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

export default Cart;