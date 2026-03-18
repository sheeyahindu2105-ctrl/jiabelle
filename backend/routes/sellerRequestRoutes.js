import express from "express";
import {
  submitSellerRequest,
  getAllSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
} from "../controllers/sellerRequestController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// USER
router.post("/", protect, submitSellerRequest);

// ADMIN
router.get("/", protect, isAdmin, getAllSellerRequests);
router.patch("/:id/approve", protect, isAdmin, approveSellerRequest);
router.patch("/:id/reject", protect, isAdmin, rejectSellerRequest);

export default router;
