import { useEffect, useState } from "react";

function SponsorPage() {
  const [products, setProducts] = useState([]);

  const API = "http://localhost:5000";

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${API}/api/products/my`); // seller products
      const data = await res.json();
      setProducts(data || []);
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Promote Your Products 🚀</h2>

      <div style={{ display: "grid", gap: "20px" }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ddd", padding: "15px" }}>
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>

            <button style={{ background: "#b11226", color: "#fff", padding: "8px 12px" }}>
              Promote This Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SponsorPage;