import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import Product from "../models/Product.js";
import { getAdminReports } from "../controllers/adminController.js";
import {
getAdminStats,
getAllUsers,

// sellers
getSellersByTab,
approveSeller,
rejectSeller,
blockSeller,
unblockSeller,

// products
getAllProducts,
blockUnblockProduct,

// orders
getLatestOrders,
updateOrderStatus,
exportOrdersCSV,
exportRevenuePDF

} from "../controllers/adminController.js";
const router = express.Router();

/* ================= ADMIN ================= */
router.get("/reports", getAdminReports);
router.get("/stats", protect, isAdmin, getAdminStats);
router.get("/users", protect, isAdmin, getAllUsers);

/* ================= SELLERS ================= */

router.get("/sellers", protect, isAdmin, getSellersByTab);

router.put("/sellers/approve/:id", protect, isAdmin, approveSeller);
router.put("/sellers/reject/:id", protect, isAdmin, rejectSeller);
router.put("/sellers/block/:id", protect, isAdmin, blockSeller);
router.put("/sellers/unblock/:id", protect, isAdmin, unblockSeller);

/* ================= PRODUCTS ================= */

router.get("/products", protect, isAdmin, getAllProducts);
router.put("/products/block/:id", protect, isAdmin, blockUnblockProduct);

/* ================= ORDERS ================= */
router.get("/reports/export/orders", exportOrdersCSV);
router.get("/reports/export/revenue", exportRevenuePDF);
router.get("/orders/latest", protect, isAdmin, getLatestOrders);

router.put("/orders/status/:id", protect, isAdmin, updateOrderStatus);

export default router;
