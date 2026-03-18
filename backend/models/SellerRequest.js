import mongoose from "mongoose";

const sellerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// prevent OverwriteModelError
const SellerRequest =
  mongoose.models.SellerRequest ||
  mongoose.model("SellerRequest", sellerRequestSchema);

export default SellerRequest;
