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

/* USER places order */
router.post("/", protect, createOrder);

router.put("/cancel/:id", protect, cancelOrder);

/* USER fetches their orders */
router.get("/my", protect, getMyOrders);

/* SELLER fetches orders for their products */
router.get("/seller", protect, isSeller, getSellerOrders);

/* SELLER revenue */
router.get(
"/seller/revenue",
protect,
isSeller,
getSellerRevenue
);

export default router;