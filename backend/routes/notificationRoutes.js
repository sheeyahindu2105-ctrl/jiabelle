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

router.get("/", protect, getNotifications);
router.get("/count", protect, getUnreadCount);
router.post("/", protect, createNotification);
router.put("/:id/read", protect, markAsRead); // fixed route
router.put("/read-all", protect, markAllAsRead);
router.delete("/:id", protect, deleteNotification);


export default router;
