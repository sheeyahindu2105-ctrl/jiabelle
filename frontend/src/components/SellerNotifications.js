import "../styles/SellerNotifications.css";

function SellerNotifications({
  totalProducts,
  lowStock,
  outStock,
  totalOrders,
  totalRevenue
}) {
  return (
    <div className="notif-container">

      {outStock > 0 && (
        <div className="notif-box danger">
          ❌ {outStock} Out of Stock
        </div>
      )}

      {lowStock > 0 && (
        <div className="notif-box warning">
          ⚠️ {lowStock} Low Stock
        </div>
      )}

      <div className="notif-box info">
        📦 {totalProducts} Products
      </div>

      <div className="notif-box primary">
        🛒 {totalOrders} Orders
      </div>

      <div className="notif-box success">
        💰 ₹{totalRevenue} Revenue
      </div>

    </div>
  );
}

export default SellerNotifications;