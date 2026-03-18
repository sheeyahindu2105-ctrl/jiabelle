import Notification from "../models/Notification.js";
import { io } from "../index.js"; // import socket

/* ================= GET USER NOTIFICATIONS ================= */
export const getNotifications = async (req, res) => {
  try {

    const query = { user: req.user._id };

    /* SELLER SHOULD NOT SEE USER ACTION NOTIFICATIONS */
    if (req.user.role === "seller") {
      query.type = { $in: ["product", "order", "stock", "admin"] };
    }

    const notifications = await Notification
      .find(query)
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {

    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });

  }
};
/* ================= GET UNREAD COUNT ================= */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("Count error:", error);
    res.status(500).json({ message: "Failed to count notifications" });
  }
};

/* ================= MARK SINGLE AS READ ================= */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true }
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

/* ================= CREATE NOTIFICATION ================= */
export const createNotification = async (req, res) => {
  try {
    const { message, type, userId, link } = req.body;

    const notification = await Notification.create({
      user: userId || req.user._id,   // IMPORTANT
      message,
      type: type || "system",
      link: link || ""
    });

    /* 🔔 REAL-TIME SOCKET EMIT */
    io.to((userId || req.user._id).toString()).emit(
      "newNotification",
      notification
    );

    res.status(201).json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ message: "Failed to create notification" });
  }
};
/* ================= MARK ALL AS READ ================= */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

/* ================= DELETE NOTIFICATION ================= */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};