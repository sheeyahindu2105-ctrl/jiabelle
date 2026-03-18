import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function GoogleAuthButton() {
const navigate = useNavigate();
const location = useLocation();

const redirectTo = location.state?.redirectTo || null;

const handleSuccess = async (response) => {
try {
if (!response?.credential) {
alert("No credential received from Google");
return;
}


  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/auth/google`,
    {
      token: response.credential,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );

  const { user, token } = res.data;

  if (!user || !token) {
    throw new Error("Invalid server response");
  }

  /* SAVE USER */
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  const role = user.role;

  /* 🔴 PRIORITY: REDIRECT (Become Seller flow) */
  if (redirectTo) {
    navigate(redirectTo, { replace: true });
    return;
  }

  /* NORMAL FLOW */
  if (role === "admin") {
    navigate("/admin/dashboard", { replace: true });
  } else if (role === "seller") {
    navigate("/seller-dashboard", { replace: true });
  } else {
    navigate("/home", { replace: true });
  }

} catch (error) {
  console.error("Google Login Error:", error?.response?.data || error.message);
  alert(error?.response?.data?.message || "Google login failed");
}

};

return (
<div style={{ marginTop: "15px", display: "flex", justifyContent: "center" }}>
<GoogleLogin
onSuccess={handleSuccess}
onError={() => {
console.log("Google Login Error");
alert("Google login failed");
}}
useOneTap={false}
flow="popup"
theme="outline"
size="large"
/> </div>
);
}

export default GoogleAuthButton;
