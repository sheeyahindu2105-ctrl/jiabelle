import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  createNotification,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= NOTIFICATION ROUTES ================= */

// GET ALL NOTIFICATIONS
router.get("/", protect, getNotifications);

// GET UNREAD COUNT
router.get("/count", protect, getUnreadCount);

// CREATE NOTIFICATION
router.post("/", protect, createNotification);

// MARK SINGLE NOTIFICATION AS READ
router.put("/:id/read", protect, markAsRead);

// MARK ALL AS READ
router.put("/read-all", protect, markAllAsRead);

// DELETE NOTIFICATION
router.delete("/:id", protect, deleteNotification);

export default router;