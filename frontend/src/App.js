import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import SellerDashboard from "./pages/SellerDashboard";
import BecomeSeller from "./pages/BecomeSeller";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import SellerProducts from "./pages/SellerProducts";
import Cart from "./pages/Cart";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";
import CategoryPage from "./pages/CategoryPage";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Account from "./pages/Account";
import SellerOrders from "./pages/SellerOrders";
import SellerAnalytics from "./pages/SellerAnalytics";

// Admin
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminSellers from "./admin/AdminSellers";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminReports from "./admin/AdminReports";

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
const token = localStorage.getItem("token");

let user = null;
try {
user = JSON.parse(localStorage.getItem("user"));
} catch {
user = null;
}

if (!user || !token) {
return <Navigate to="/login" replace />;
}

if (user.isBlocked) {
localStorage.removeItem("token");
localStorage.removeItem("user");
alert("Your account is blocked by admin");
return <Navigate to="/login" replace />;
}

if (allowedRoles && !allowedRoles.includes(user.role)) {
if (user.role === "seller") {
return <Navigate to="/seller-dashboard" replace />;
}

```
if (user.role === "admin") {
  return <Navigate to="/admin/dashboard" replace />;
}

return <Navigate to="/home" replace />;
```

}

return children;
};

function App() {
const token = localStorage.getItem("token");

let user = null;
try {
user = JSON.parse(localStorage.getItem("user"));
} catch {
user = null;
}

return ( <Routes>

```
  {/* DEFAULT */}
  <Route path="/" element={<Navigate to="/home" replace />} />

  {/* LOGIN */}
  <Route
    path="/login"
    element={
      token && user ? (
        user.role === "admin" ? (
          <Navigate to="/admin/dashboard" replace />
        ) : user.role === "seller" ? (
          <Navigate to="/seller-dashboard" replace />
        ) : (
          <Navigate to="/home" replace />
        )
      ) : (
        <Login />
      )
    }
  />

  {/* SIGNUP */}
  <Route
    path="/signup"
    element={
      token && user ? <Navigate to="/home" replace /> : <Signup />
    }
  />

  {/* PUBLIC */}
  <Route path="/home" element={<Home />} />
  <Route path="/category/:name" element={<CategoryPage />} />
  <Route path="/product/:id" element={<ProductDetails />} />
  <Route path="/order-success" element={<OrderSuccess />} />

  {/* PROTECTED USER */}
  <Route
    path="/wishlist"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <Wishlist />
      </ProtectedRoute>
    }
  />

  <Route
    path="/cart"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <Cart />
      </ProtectedRoute>
    }
  />

  <Route
    path="/checkout"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <Checkout />
      </ProtectedRoute>
    }
  />

  <Route
    path="/orders"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <Orders />
      </ProtectedRoute>
    }
  />

  <Route
    path="/order-details/:id"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <OrderDetails />
      </ProtectedRoute>
    }
  />

  {/* PROFILE */}
  <Route
    path="/profile"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <Profile />
      </ProtectedRoute>
    }
  />

  <Route
    path="/notifications"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <Notifications />
      </ProtectedRoute>
    }
  />

  <Route
    path="/account"
    element={
      <ProtectedRoute allowedRoles={["user", "seller", "admin"]}>
        <Account />
      </ProtectedRoute>
    }
  />

  {/* SELLER */}
  <Route
    path="/become-seller"
    element={
      <ProtectedRoute allowedRoles={["user"]}>
        <BecomeSeller />
      </ProtectedRoute>
    }
  />

  <Route
    path="/seller-dashboard"
    element={
      <ProtectedRoute allowedRoles={["seller", "admin"]}>
        <SellerDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/seller/products"
    element={
      <ProtectedRoute allowedRoles={["seller", "admin"]}>
        <SellerProducts />
      </ProtectedRoute>
    }
  />

  <Route
    path="/seller/orders"
    element={
      <ProtectedRoute allowedRoles={["seller", "admin"]}>
        <SellerOrders />
      </ProtectedRoute>
    }
  />

  <Route
    path="/seller/analytics"
    element={
      <ProtectedRoute allowedRoles={["seller", "admin"]}>
        <SellerAnalytics />
      </ProtectedRoute>
    }
  />

  {/* ADMIN */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="sellers" element={<AdminSellers />} />
    <Route path="products" element={<AdminProducts />} />
    <Route path="orders" element={<AdminOrders />} />
    <Route path="reports" element={<AdminReports />} />
  </Route>

  {/* FALLBACK */}
  <Route path="*" element={<Navigate to="/home" replace />} />

</Routes>


);
}

export default App;
