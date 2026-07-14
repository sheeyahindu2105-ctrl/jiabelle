import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const API =
  process.env.REACT_APP_API_URL ||
  "https://jiabelle-backend.onrender.com";
  const token = localStorage.getItem("token");

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API}/api/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }

      } catch (err) {
        console.error("Order fetch error:", err);
      }
    };

    fetchOrders();
 }, [API, token]);

  /* ================= STATUS CLASS ================= */

  const getStatusClass = (status) => {
    return `order-status status-${status}`;
  };

  /* ================= UI ================= */

  return (
    <div className="orders-page">

      {/* BACK BUTTON */}
      <button
        className="back-home-btn"
        onClick={() => navigate("/home")}
      >
        ← Back to Home
      </button>

      <h2 className="orders-title">My Orders</h2>

      {/* EMPTY */}
      {orders.length === 0 && (
        <p className="empty-text">No orders found</p>
      )}

      {/* LIST */}
      <div className="orders-container">

        {orders.map((order) => {

          const product = order.items?.[0]?.product;

          const image = product?.images?.[0]
            ? product.images[0].startsWith("http")
              ? product.images[0]
              : `${API}${product.images[0]}`
            : "/placeholder.png";

          return (
            <div key={order._id} className="order-card">

              {/* LEFT */}
              <div className="order-left">

                <img
                  src={image}
                  alt="product"
                  className="order-product-img"
                />

                <div>
                  <h4 className="order-product-title">
                    {product?.name || "Product"}
                  </h4>

                  <p className="order-id">
                    Order ID: #{order._id.slice(-8)}
                  </p>

                  <p className="order-total">
                    Total: ₹{order.totalAmount}
                  </p>

                  {/* STATUS */}
                  <span className={getStatusClass(order.orderStatus)}>
                    {order.orderStatus}
                  </span>

                </div>

              </div>

              {/* RIGHT */}
              <div className="order-right">

                <button
                  className="view-details-btn"
                  onClick={() =>
                    navigate(`/order-details/${order._id}`)
                  }
                >
                  View Details
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Orders;