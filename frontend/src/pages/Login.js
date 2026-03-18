import "../styles/Auth.css";
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import GoogleAuthButton from "../components/GoogleAuthButton";

function Login() {
const navigate = useNavigate();
const location = useLocation();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const redirectTo = location.state?.redirectTo || null;

/* ================= NORMAL LOGIN ================= */
const handleLogin = async (e) => {
e.preventDefault();
setError("");


try {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setError(data.message || "Login failed");
    return;
  }

  handleUserRedirect(data);

} catch (err) {
  setError("Server not responding. Try again later.");
}


};

/* ================= GOOGLE LOGIN HANDLER ================= */
const handleGoogleLogin = async (token) => {
setError("");


try {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/auth/google`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    setError(data.message || "Google login failed");
    return;
  }

  handleUserRedirect(data);

} catch (err) {
  setError("Google login failed. Try again.");
}


};

/* ================= COMMON REDIRECT LOGIC ================= */
const handleUserRedirect = (data) => {
const user = data.user;
const role = user.role;


// SELLER checks
if (role === "seller") {
  if (user.sellerStatus === "pending") {
    setError("Seller request is under review");
    return;
  }
  if (user.sellerStatus === "rejected") {
    setError("Seller request has been rejected");
    return;
  }
  if (user.isBlocked) {
    setError("Your seller account has been blocked");
    return;
  }
}

// SAVE LOGIN
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(user));

// REDIRECT
if (redirectTo) {
  navigate(redirectTo, { replace: true });
  return;
}

if (role === "admin") {
  navigate("/admin/dashboard", { replace: true });
} else if (role === "seller") {
  navigate("/seller-dashboard", { replace: true });
} else {
  navigate("/home", { replace: true });
}


};

return ( <div className="auth-container"> <form className="auth-form" onSubmit={handleLogin}> <h2>Login</h2>


    {error && <p className="error-text">{error}</p>}

    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button type="submit">Login</button>

    <p style={{ textAlign: "center", margin: "10px 0" }}>OR</p>

    {/* 🔥 GOOGLE BUTTON WITH CALLBACK */}
    <GoogleAuthButton onSuccess={handleGoogleLogin} />

    <p>
      Don't have an account? <Link to="/signup">Create account</Link>
    </p>
  </form>
</div>


);
}

export default Login;
