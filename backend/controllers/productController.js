import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { io } from "../index.js";

/* ================= ADD PRODUCT ================= */
export const addProduct = async (req, res) => {
  try {

    const seller = await User.findById(req.user._id);

    if (!seller || seller.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can add products",
      });
    }

    if (seller.sellerStatus !== "approved") {
      return res.status(403).json({
        message: "Your seller account is not approved yet",
      });
    }

    if (seller.isBlocked) {
      return res.status(403).json({
        message: "Your seller account is blocked by admin",
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
  images: images,
  seller: req.user._id,
  status: "pending",
});
    /* SELLER NOTIFICATION */

    const notification = await Notification.create({
      user: req.user._id,
      message: `Your product "${product.name}" was submitted for admin approval`,
      type: "product",
    });

    io.to(req.user._id.toString()).emit("newNotification", notification);

    res.status(201).json({
      message: "Product submitted for admin approval",
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
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.stock = req.body.stock || product.stock;
    product.category = req.body.category || product.category;
    product.originalPrice = req.body.originalPrice || product.originalPrice;
    product.discount = req.body.discount || product.discount;

    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => file.path);
    }

    product.status = "pending";

    await product.save();

    /* SELLER NOTIFICATION */

    const notification = await Notification.create({
      user: req.user._id,
      message: `Your product "${product.name}" was updated and sent for admin approval`,
      type: "product",
    });

    io.to(req.user._id.toString()).emit("newNotification", notification);

    res.json({
      message: "Product updated and sent for admin approval",
      product,
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};


/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await product.deleteOne();

    res.json({
      message: "Product deleted",
    });

  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};


/* ================= ADMIN APPROVE PRODUCT ================= */
export const approveProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.status = "approved";
    await product.save();

    const notification = await Notification.create({
      user: product.seller,
      message: `Your product "${product.name}" has been approved by admin`,
      type: "product",
    });

    io.to(product.seller.toString()).emit("newNotification", notification);

    res.json({
      message: "Product approved successfully",
      product,
    });

  } catch (error) {
    console.error("APPROVE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Failed to approve product" });
  }
};


/* ================= ADMIN REJECT PRODUCT ================= */
export const rejectProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.status = "rejected";
    await product.save();

    const notification = await Notification.create({
      user: product.seller,
      message: `Your product "${product.name}" was rejected by admin`,
      type: "product",
    });

    io.to(product.seller.toString()).emit("newNotification", notification);

    res.json({
      message: "Product rejected",
      product,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= ADMIN BLOCK PRODUCT ================= */
export const blockProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.status = "blocked";
    await product.save();

    const notification = await Notification.create({
      user: product.seller,
      message: `Your product "${product.name}" was blocked by admin`,
      type: "admin",
    });

    io.to(product.seller.toString()).emit("newNotification", notification);

    res.json({
      message: "Product blocked",
      product,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
/* ================= ADD PRODUCT REVIEW ================= */

export const addReview = async (req, res) => {
  try {

    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this product"
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.ratings =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.json({
      message: "Review added successfully",
      reviews: product.reviews
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};


/* ================= DELETE REVIEW ================= */

export const deleteReview = async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const review = product.reviews.find(
      (r) => r._id.toString() === req.params.reviewId
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this review"
      });
    }

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== req.params.reviewId
    );

    product.numReviews = product.reviews.length;

    if (product.reviews.length > 0) {
      product.ratings =
        product.reviews.reduce((acc, item) => acc + item.rating, 0) /
        product.reviews.length;
    } else {
      product.ratings = 0;
    }

    await product.save();

    res.json({
      message: "Review deleted successfully",
      reviews: product.reviews
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};
export const updateReview = async (req, res) => {

  try {

    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.find(
      (r) => r._id.toString() === req.params.reviewId
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = Number(rating);
    review.comment = comment;

    product.ratings =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.json({
      message: "Review updated successfully",
      reviews: product.reviews
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};