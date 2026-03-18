import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRequestRoutes from "./routes/sellerRequestRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { startOrderStatusUpdater } from "./utils/updateOrderStatus.js";

import path from "path";
import { fileURLToPath } from "url";

/* SOCKET IMPORTS */
import http from "http";
import { Server } from "socket.io";

/* ================= SETUP ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

/* ================= HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
cors: {
origin: process.env.CLIENT_URL || "http://localhost:3000",
credentials: true,
},
});

/* SOCKET CONNECTION */
io.on("connection", (socket) => {
console.log("User connected:", socket.id);

socket.on("join", (userId) => {
socket.join(userId);
console.log(`User joined room: ${userId}`);
});

socket.on("disconnect", () => {
console.log("User disconnected");
});
});

/* EXPORT SOCKET */
export { io };

/* ================= MIDDLEWARES ================= */

/* ✅ CORS (IMPORTANT FOR GOOGLE LOGIN) */
app.use(
cors({
origin: process.env.CLIENT_URL || "http://localhost:3000",
credentials: true,
})
);

/* ✅ FIX GOOGLE POPUP + COOP ERROR */
app.use((req, res, next) => {
res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
next();
});

/* BODY PARSER */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller-requests", sellerRequestRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);

/* ================= STATIC ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
res.send("Backend running 🚀");
});

/* ================= ERROR HANDLER (NEW) ================= */
app.use((err, req, res, next) => {
console.error("Server Error:", err.message);
res.status(500).json({
success: false,
message: "Internal Server Error",
});
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);

/* START BACKGROUND JOB */
startOrderStatusUpdater();
});
