import { useEffect, useState, useCallback } from "react";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/admin.css";

const TABS = ["pending", "approved", "blocked", "rejected"];

function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  /* ================= FETCH SELLERS ================= */
  const fetchSellers = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/sellers?tab=${tab}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setSellers(data.data || []);
    } catch (err) {
      console.error("FETCH SELLERS ERROR:", err);
      setSellers([]);
    }
  }, [API, token, tab, search]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  /* ================= ACTION HANDLER ================= */
  const handleConfirm = async () => {
    if (!selectedSeller) return;
    setLoading(true);

    let url = "";

    if (actionType === "approve")
      url = `${API}/api/admin/sellers/approve/${selectedSeller._id}`;
    if (actionType === "reject")
      url = `${API}/api/admin/sellers/reject/${selectedSeller._id}`;
    if (actionType === "block")
      url = `${API}/api/admin/sellers/block/${selectedSeller._id}`;
    if (actionType === "unblock")
      url = `${API}/api/admin/sellers/unblock/${selectedSeller._id}`;

    try {
      await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConfirmOpen(false);
      setSelectedSeller(null);
      setActionType("");
      fetchSellers(); // 🔥 refresh list
    } catch (err) {
      console.error("SELLER ACTION ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Sellers</h3>

      {/* ================= TABS ================= */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= SEARCH ================= */}
      <div className="search-wrapper">
        <input
          className="search-input"
          placeholder="Search seller name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= TABLE ================= */}
      {sellers.length === 0 ? (
        <p className="empty">No sellers</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {sellers.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  {tab === "pending" && (
                    <span className="badge pending">PENDING</span>
                  )}
                  {tab === "approved" && (
                    <span className="badge approved">ACTIVE</span>
                  )}
                  {tab === "blocked" && (
                    <span className="badge rejected">BLOCKED</span>
                  )}
                  {tab === "rejected" && (
                    <span className="badge rejected">REJECTED</span>
                  )}
                </td>

                <td>
                  {/* PENDING */}
                  {tab === "pending" && (
                    <>
                      <button
                        className="approve-btn"
                        onClick={() => {
                          setSelectedSeller(s);
                          setActionType("approve");
                          setConfirmOpen(true);
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => {
                          setSelectedSeller(s);
                          setActionType("reject");
                          setConfirmOpen(true);
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* APPROVED */}
                  {tab === "approved" && (
                    <button
                      className="reject-btn"
                      onClick={() => {
                        setSelectedSeller(s);
                        setActionType("block");
                        setConfirmOpen(true);
                      }}
                    >
                      Block
                    </button>
                  )}

                  {/* BLOCKED */}
                  {tab === "blocked" && (
                    <button
                      className="approve-btn"
                      onClick={() => {
                        setSelectedSeller(s);
                        setActionType("unblock");
                        setConfirmOpen(true);
                      }}
                    >
                      Unblock
                    </button>
                  )}

                  {/* REJECTED */}
                  {tab === "rejected" && <span>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= CONFIRM MODAL ================= */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Action"
        message={`Are you sure you want to ${actionType} this seller?`}
        confirmText={loading ? "Processing..." : "Confirm"}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setConfirmOpen(false)}
      />
    </div>
  );
}

export default AdminSellers;
