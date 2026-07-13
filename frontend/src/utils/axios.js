import axios from "axios";

/* ================= BASE URL ================= */
// ✅ Keep this
const BASE_URL = "https://jiabelle-backend.onrender.com/api";

/* ================= INSTANCE ================= */
const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

/* ================= REQUEST INTERCEPTOR ================= */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("🔒 Unauthorized - clearing token");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (!error.response) {
      console.error("🌐 Backend not running or wrong URL");
    }

    if (status === 404) {
      console.warn("❗ API route not found:", error.config?.url);
    }

    if (status >= 500) {
      console.error("🔥 Server error");
    }

    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status,
      message: error.response?.data || error.message,
    });

    return Promise.reject(error);
  }
);

export default instance;