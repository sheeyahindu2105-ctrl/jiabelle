import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { io } from "../index.js";

/* ================= ADD PRODUCT ================= */
export const addProduct = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id);

    if (!seller || seller.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can add products" });
    }

    if (seller.sellerStatus !== "approved") {
      return res.status(403).json({
        message: "Your seller account is not approved yet",
      });
    }

    if (seller.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    if (images.length === 0) {
      return res.status(400).json({
        message: "At least one image required",
      });
    }

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      discount: req.body.discount,
      stock: req.body.stock,
      category: req.body.category,
      images,
      seller: req.user._id,
      status: "approved", // ✅ for testing ads visibility
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
};

/* ================= GET MY PRODUCTS ================= */
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ================= GET ALL PRODUCTS ================= */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "approved",
    }).populate("seller", "name email");

    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.stock = req.body.stock || product.stock;
    product.category = req.body.category || product.category;
    product.originalPrice =
      req.body.originalPrice || product.originalPrice;
    product.discount = req.body.discount || product.discount;

    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => file.path);
    }

    product.status = "approved"; // keep visible

    await product.save();

    res.json({
      message: "Product updated",
      product,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================= ADMIN APPROVE ================= */
export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    product.status = "approved";
    await product.save();

    res.json({ message: "Product approved", product });
  } catch (error) {
    res.status(500).json({ message: "Error approving product" });
  }
};

/* ================= ADMIN REJECT ================= */
export const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    product.status = "rejected";
    await product.save();

    res.json({ message: "Product rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting product" });
  }
};

/* ================= ADMIN BLOCK ================= */
export const blockProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    product.status = "blocked";
    await product.save();

    res.json({ message: "Product blocked" });
  } catch (error) {
    res.status(500).json({ message: "Error blocking product" });
  }
};

/* ================= ADD REVIEW ================= */
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.ratings =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.json({ message: "Review added", reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE REVIEW ================= */
export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== req.params.reviewId
    );

    product.numReviews = product.reviews.length;

    await product.save();

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE REVIEW ================= */
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    const review = product.reviews.find(
      (r) => r._id.toString() === req.params.reviewId
    );

    review.rating = rating;
    review.comment = comment;

    await product.save();

    res.json({ message: "Review updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};