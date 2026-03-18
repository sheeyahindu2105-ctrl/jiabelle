import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import "../styles/admin.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const LIMIT = 15;

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(
        `${API}/api/admin/users?page=${page}&limit=${LIMIT}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setUsers(data.data || []);
      setTotalPages(data.totalPages || 1);
    };

    fetchUsers();
  }, [API, token, page, search]);

  return (
    <div className="card">
      <h3>All Users</h3>

      {/* SEARCH */}
      <input
        className="search-input"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="2" className="empty">No users found</td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(p - 1, 1))}
        onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
      />
    </div>
  );
}

export default AdminUsers;
