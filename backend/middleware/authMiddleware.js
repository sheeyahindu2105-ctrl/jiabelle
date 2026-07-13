import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ================= PROTECT ================= */

export const protect = async (req, res, next) => {
  try {
    let token;

    /* ================= GET TOKEN ================= */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "❌ No token provided",
      });
    }

    /* ================= VERIFY TOKEN ================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ================= FIND USER ================= */
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "❌ User not found",
      });
    }

    /* ================= BLOCK CHECK ================= */
    if (user.isBlocked && user.role !== "admin") {
      return res.status(403).json({
        message: "🚫 Your account is blocked by admin",
      });
    }

    /* ================= ATTACH USER ================= */
    req.user = user;

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "❌ Not authorized, token failed",
    });
  }
};

/* ================= ADMIN ONLY ================= */

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "❌ Admin access only",
    });
  }
};

/* ================= SELLER ONLY ================= */

export const isSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    return res.status(403).json({
      message: "❌ Seller access only",
    });
  }
};