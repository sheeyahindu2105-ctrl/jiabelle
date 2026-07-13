import { useEffect, useState } from "react";
import axios from "../utils/axios";

function AdAnalytics() {
  const [ads, setAds] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAds = async () => {
      const res = await axios.get("/api/ads/my-ads", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAds(res.data);
    };

    fetchAds();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 My Ad Analytics</h2>

      <div className="analytics-grid">
        {ads.map((ad) => (
          <div key={ad._id} className="analytics-card">

            <h3>{ad.productId?.name}</h3>

            <p>👁️ Views: {ad.views}</p>
            <p>🖱️ Clicks: {ad.clicks}</p>

            <p>💰 Plan: ₹{ad.plan?.price}</p>
            <p>📅 Duration: {ad.plan?.duration} Days</p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default AdAnalytics;