import { useNavigate } from "react-router-dom";
import "./LogoutButton.css";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // remove only auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
