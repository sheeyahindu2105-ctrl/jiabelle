import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";

/* ================= PAGES ================= */
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
import SearchPage from "./pages/SearchPage";
import AddProduct from "./pages/AddProduct";

/* ================= ADMIN ================= */
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminSellers from "./admin/AdminSellers";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminReports from "./admin/AdminReports";

/* ================= HELPER ================= */
const getUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined"
      ? JSON.parse(stored)
      : null;
  } catch {
    return null;
  }
};

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (!user || !token) return <Navigate to="/login" replace />;

  if (user.isBlocked) {
    localStorage.clear();
    alert("Your account is blocked by admin");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "seller")
      return <Navigate to="/seller-dashboard" replace />;
    if (user.role === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();

  /* ================= SEARCH ================= */
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  const API = "http://localhost:5000";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  /* ================= NAVBAR HIDE ================= */
  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/seller-dashboard",
    "/seller",
    "/admin",
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  /* ================= FOOTER ================= */
  const showFooterOnlyOnHome =
    location.pathname === "/home" || location.pathname === "/";

  return (
    <div className="app-container">

      {/* NAVBAR */}
      {!shouldHideNavbar && (
        <Navbar
          search={search}
          setSearch={setSearch}
          products={products}
        />
      )}

      {/* MAIN */}
      <div className="main-content">
        <Routes>

          <Route path="/" element={<Navigate to="/home" />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* USER */}
          <Route path="/home" element={<Home />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/search/:query" element={<SearchPage />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/account" element={<Account />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/seller/add-product" element={<AddProduct />} />

          {/* SELLER */}
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/products"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/analytics"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerAnalytics />
              </ProtectedRoute>
            }
          />

          {/* BECOME SELLER */}
          <Route path="/become-seller" element={<BecomeSeller />} />

          {/* ❌ REMOVED ADVERTISE */}

          {/* ADMIN */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reports" element={<AdminReports />} />
            {/* ❌ REMOVED AdminAds */}
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/home" />} />

        </Routes>
      </div>

      {/* FOOTER */}
      {showFooterOnlyOnHome && <Footer />}

    </div>
  );
}

export default App;