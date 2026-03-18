import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/orders.css";

function Orders() {

  const [orders, setOrders] = useState([]);

  const API = "http://localhost:5000";   // ✅ fixed (removed env confusion)
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const res = await fetch(`${API}/api/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        setOrders(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error("Error fetching orders", err);
        setOrders([]);
      }

    };

    if (token) {
      fetchOrders();   // ✅ only call if token exists
    }

  }, [token]);

  return (

    <div className="orders-page">

      <button
        className="back-home-btn"
        onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <h2 className="orders-title">My Orders</h2>

      <div className="orders-container">

        {orders.length === 0 && (
          <p className="empty-text">No orders found.</p>
        )}

        {orders.map(order => {

          const firstProduct = order.products?.[0]?.product;

          return (

            <div className="order-card" key={order._id}>

              <div className="order-left">

                <img
                  src={
                    firstProduct?.images?.[0] ||
                    firstProduct?.image ||
                    ""
                  }
                  alt="product"
                  className="order-product-img"
                />

                <div className="order-info">

                  <h3 className="order-product-title">
                    {firstProduct?.name || "Product"}
                  </h3>

                  <p className="order-id">
                    Order ID: #{order._id.slice(-8)}
                  </p>

                  <p className="order-total">
                    Total ₹{order.totalAmount}
                  </p>

                  <p className={`order-status status-${order.orderStatus}`}>
                    {order.orderStatus?.replace("_", " ")}
                  </p>

                </div>

              </div>

              <div className="order-right">

                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/order-details/${order._id}`)}
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