import mongoose from "mongoose";

/* ================= REVIEW SCHEMA ================= */

const reviewSchema = new mongoose.Schema({
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User"
},

name: {
type: String
},

rating: {
type: Number,
required: true
},

comment: {
type: String
}

}, { timestamps: true });

/* ================= PRODUCT SCHEMA ================= */

const productSchema = new mongoose.Schema(
{
name: {
type: String,
required: true,
trim: true
},

description: {
type: String,
default: ""
},

/* ================= PRICING ================= */

price: {
type: Number,
required: true
},

originalPrice: {
type: Number,
default: 0
},

discount: {
type: Number,
default: 0
},

/* ================= STOCK ================= */

stock: {
type: Number,
default: 0
},

/* ================= CATEGORY ================= */

category: {
type: String,
required: true
},

/* ================= IMAGES ================= */

images: [
{
type: String
}
],

/* ================= SELLER ================= */

seller: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},

/* ================= ADMIN APPROVAL STATUS ================= */

status: {
type: String,
enum: ["pending", "approved", "rejected", "blocked"],
default: "pending"
},

/* ================= PRODUCT BADGES ================= */

productType: {
type: String,
enum: ["new", "normal"],
default: "normal"
},

/* ================= RATING SYSTEM ================= */

ratings: {
type: Number,
default: 0
},

numReviews: {
type: Number,
default: 0
},

reviews: [reviewSchema]

},
{ timestamps: true }
);

export default mongoose.model("Product", productSchema);
