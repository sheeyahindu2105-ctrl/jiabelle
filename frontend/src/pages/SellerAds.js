import { useEffect, useState } from "react";

function SellerAds() {

 const [ads, setAds] = useState([]);
const token = localStorage.getItem("token");

const API =
  process.env.REACT_APP_API_URL ||
  "https://jiabelle-backend.onrender.com";

useEffect(() => {
  
   fetch(`${API}/api/ads/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAds(data));
  }, [token]);

  return (
    <div>

      <h2>My Ads</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Budget</th>
            <th>Clicks</th>
            <th>Views</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {ads.map(ad => (
            <tr key={ad._id}>
              <td>{ad.productId?.name}</td>
              <td>₹{ad.budget}</td>
              <td>{ad.clicks}</td>
              <td>{ad.views}</td>
              <td>{ad.status}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default SellerAds;