import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { OAuth2Client } from "google-auth-library";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Notification from "../models/Notification.js";

const router = express.Router();

/* ================= GOOGLE CLIENT ================= */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= TOKEN ================= */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

/* ================= MULTER ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    res.status(201).json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error("SIGNUP ERROR:", error);

    res.status(500).json({
      message: "Signup failed",
      error: error.message
    });

  }
});
/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked && user.role !== "admin") {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
      },
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({ message: "Login failed" });

  }

});

/* ================= GOOGLE LOGIN ================= */
router.post("/google", async (req, res) => {

  try {

    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {

      user = await User.create({
        name,
        email,
        avatar: picture,
        role: "user",
        isGoogleUser: true,
      });

      await Notification.create({
        user: user._id,
        message: "Welcome to JIA BELLE!",
        type: "account",
      });

    }

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
      },
    });

  } catch (error) {

    console.error("GOOGLE LOGIN ERROR:", error);

    res.status(401).json({ message: "Google authentication failed" });

  }

});

/* ================= CURRENT USER ================= */
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

/* ================= UPDATE PROFILE ================= */
router.put(
  "/profile",
  protect,
  upload.single("avatar"),
  async (req, res) => {
    try {

      console.log("BODY:", req.body); // 🔥 DEBUG

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.name = req.body.name || user.name;

      /* ✅ FIXED REMOVE + UPLOAD LOGIC */
      if (req.body && (req.body.removeAvatar === "true" || req.body.removeAvatar === true)) {
        user.avatar = "";
      } else if (req.file) {
        user.avatar = `/uploads/${req.file.filename}`;
      }

      user.address = {
        fullName: req.body.fullName || user.address?.fullName,
        phone: req.body.phone || user.address?.phone,
        street: req.body.street || user.address?.street,
        city: req.body.city || user.address?.city,
      };

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        address: updatedUser.address,
      });

    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);
      res.status(500).json({ message: "Profile update failed" });
    }
  }
);
/* ================= CHANGE PASSWORD ================= */


router.put("/change-password", protect, async (req, res) => {

  try {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All password fields required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(oldPassword); // ✅ FIX

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = newPassword; // ✅ auto hashed

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {

    console.error("PASSWORD ERROR:", error);

    res.status(500).json({ message: "Password update failed" });

  }
});
export default router;
