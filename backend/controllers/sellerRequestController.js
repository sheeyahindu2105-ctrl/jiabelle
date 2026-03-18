import SellerRequest from "../models/SellerRequest.js";
import User from "../models/User.js";

/* ================= USER SUBMIT SELLER REQUEST ================= */
export const submitSellerRequest = async (req, res) => {
  try {
    const { shopName, phone } = req.body;

    const exists = await SellerRequest.findOne({
      user: req.user._id,
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Seller request already submitted" });
    }

    const request = await SellerRequest.create({
      user: req.user._id,
      shopName,
      phone,
      status: "pending",
    });

    await User.findByIdAndUpdate(req.user._id, {
      sellerStatus: "pending",
    });

    res.status(201).json({
      message: "Seller request submitted",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Request failed" });
  }
};

/* ================= ADMIN GET ALL REQUESTS ================= */
export const getAllSellerRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find()
      .populate("user", "name email sellerStatus")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/* ================= ADMIN APPROVE REQUEST ================= */
export const approveSellerRequest = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await User.findByIdAndUpdate(request.user, {
      role: "seller",
      sellerStatus: "approved",
      isBlocked: false,
    });

    await SellerRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Seller approved successfully" });
  } catch {
    res.status(500).json({ message: "Approve failed" });
  }
};

/* ================= ADMIN REJECT REQUEST ================= */
export const rejectSellerRequest = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await User.findByIdAndUpdate(request.user, {
      role: "user",
      sellerStatus: "rejected",
    });

    await SellerRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Seller rejected successfully" });
  } catch {
    res.status(500).json({ message: "Reject failed" });
  }
};
