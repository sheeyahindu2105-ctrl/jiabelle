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

import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

/* ================= ALLOWED ORIGINS ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://jiabelle.vercel.app",
];

/* ================= CORS ================= */

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log("Joined:", userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

export { io };

/* ================= GOOGLE AUTH ================= */

app.use((req, res, next) => {
  res.setHeader(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups"
  );
  res.setHeader(
    "Cross-Origin-Embedder-Policy",
    "unsafe-none"
  );
  next();
});

/* ================= BODY ================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC ================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller-requests", sellerRequestRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startOrderStatusUpdater();
});