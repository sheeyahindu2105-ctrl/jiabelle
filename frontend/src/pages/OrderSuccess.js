import { useNavigate } from "react-router-dom";
import "../styles/orderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="order-success-page">
      <div className="success-card">
        <div className="success-icon">🎉</div>

        <h1>Order Placed Successfully!</h1>
        <p>Your order has been confirmed.</p>

        <div className="success-actions">
          <button
            className="success-btn primary"
            onClick={() => navigate("/orders")}
          >
            View My Orders
          </button>

          <button
            className="success-btn"
            onClick={() => navigate("/home")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
