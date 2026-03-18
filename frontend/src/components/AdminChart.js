import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminChart({ stats }) {

  const data = {
    labels: ["Users", "Approved Sellers", "Pending Sellers", "Products"],
datasets: [
{
label: "Platform Stats",
data: [
stats.totalUsers || 0,
stats.approvedSellers || 0,
stats.pendingSellers || 0,
stats.totalProducts || 0
],
backgroundColor: [
"#6366f1",
"#22c55e",
"#f59e0b",
"#3b82f6"
],
borderRadius: 6
}
]  };

return (
  <div
    style={{
      marginTop: "40px",
      background: "white",
      padding: "20px",
      borderRadius: "14px",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      height: "350px"
    }}
  >
    <Bar
      data={data}
      options={{
        maintainAspectRatio: false
      }}
    />
  </div>
);
}


export default AdminChart;