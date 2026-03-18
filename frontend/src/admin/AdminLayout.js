import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "../styles/admin.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2 className="logo">Admin Panel</h2>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="nav-link">
            📊 <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/users" className="nav-link">
            👤 <span>Users</span>
          </NavLink>

          <NavLink to="/admin/sellers" className="nav-link">
            🏪 <span>Sellers</span>
          </NavLink>

          <NavLink to="/admin/products" className="nav-link">
            📦 <span>Products</span>
          </NavLink>

          <NavLink to="/admin/orders" className="nav-link">
            🛒 <span>Orders</span>
          </NavLink>
          <NavLink to="/admin/reports" className="nav-link">
              📊 <span>Reports</span>
          </NavLink>  
        </nav>

        <div className="sidebar-logout">
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin">
        <div className="admin-header">
          <h2>Admin</h2>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
