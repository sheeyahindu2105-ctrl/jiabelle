import express from "express";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getSellerRevenue,
  cancelOrder
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isSeller } from "../middleware/sellerMiddleware.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

// ➕ CREATE ORDER
router.post("/", protect, createOrder);

// ❌ CANCEL ORDER
router.put("/cancel/:id", protect, cancelOrder);

// 📦 GET MY ORDERS
router.get("/my", protect, getMyOrders);

/* ================= SELLER ROUTES ================= */

// 🛒 GET SELLER ORDERS
router.get("/seller", protect, isSeller, getSellerOrders);

// 💰 GET SELLER REVENUE
router.get("/seller/revenue", protect, isSeller, getSellerRevenue);

export default router;