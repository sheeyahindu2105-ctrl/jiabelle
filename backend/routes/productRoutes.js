import express from "express";
import Product from "../models/Product.js";

import {
  addProduct,
  getMyProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  blockProduct,
  addReview,
  deleteReview,
  updateReview
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isSeller } from "../middleware/sellerMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* ================= SELLER ROUTES ================= */

// ADD PRODUCT
router.post(
  "/",
  protect,
  isSeller,
  upload.array("images", 5),
  addProduct
);

// GET MY PRODUCTS
router.get(
  "/my-products",
  protect,
  isSeller,
  getMyProducts
);

// UPDATE PRODUCT
router.put(
  "/:id",
  protect,
  isSeller,
  upload.array("images", 5),
  updateProduct
);

// DELETE PRODUCT
router.delete(
  "/:id",
  protect,
  isSeller,
  deleteProduct
);

/* ================= ADMIN ROUTES ================= */

// APPROVE PRODUCT
router.put(
  "/:id/approve",
  protect,
  isAdmin,
  approveProduct
);

// REJECT PRODUCT
router.put(
  "/:id/reject",
  protect,
  isAdmin,
  rejectProduct
);

// BLOCK PRODUCT
router.put(
  "/:id/block",
  protect,
  isAdmin,
  blockProduct
);

// GET ALL PRODUCTS FOR ADMIN
router.get(
  "/admin/products",
  protect,
  isAdmin,
  async (req, res) => {

    try {

      const products = await Product.find()
        .populate("seller", "name email")
        .sort({ createdAt: -1 });

      res.json(products);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error while fetching products"
      });

    }

  }
);

/* ================= PUBLIC ROUTES ================= */

// GET APPROVED PRODUCTS (HOME PAGE)
router.get("/", getAllProducts);

/* ================= REVIEW ROUTES ================= */

// ADD REVIEW
router.post(
  "/:id/review",
  protect,
  addReview
);

// DELETE REVIEW
router.delete(
  "/:id/review/:reviewId",
  protect,
  deleteReview
);
router.put(
  "/:id/review/:reviewId",
  protect,
  updateReview
);
export default router;