import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import SellerRequest from "../models/SellerRequest.js";
import { sendEmail } from "../utils/sendEmail.js";


/* ================= ADMIN DASHBOARD STATS ================= */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });

    const approvedSellers = await User.countDocuments({
      sellerStatus: "approved",
    });

    const pendingSellers = await User.countDocuments({
      sellerStatus: "pending",
    });

    const activeSellers = await User.countDocuments({
      sellerStatus: "approved",
      isBlocked: false,
    });

    const blockedSellers = await User.countDocuments({
      sellerStatus: "approved",
      isBlocked: true,
    });

    const totalProducts = await Product.countDocuments();

    res.json({
      totalUsers,
      approvedSellers,
      pendingSellers,
      activeSellers,
      blockedSellers,
      totalProducts,
    });
  } catch {
    res.status(500).json({ message: "Admin stats failed" });
  }
};

/* ================= GET ALL USERS (PAGINATION + SEARCH) ================= */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = "" } = req.query;

    const query = {
      role: "user",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      data: users,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch {
    res.status(500).json({ message: "Users fetch failed" });
  }
};

/* ================= GET SELLERS BY TAB ================= */
export const getSellersByTab = async (req, res) => {
  try {
    const { tab = "pending", page = 1, limit = 15 } = req.query;

    let query = {};

    if (tab === "pending") {
      query = { sellerStatus: "pending" };
    }

    if (tab === "approved") {
      query = { sellerStatus: "approved", isBlocked: false };
    }

    if (tab === "blocked") {
      query = { sellerStatus: "approved", isBlocked: true };
    }

    if (tab === "rejected") {
      query = { sellerStatus: "rejected" };
    }

    const total = await User.countDocuments(query);

    const sellers = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      data: sellers,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalSellers: total,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch sellers" });
  }
};

/* ================= APPROVE SELLER ================= */
export const approveSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.role = "seller";
    seller.sellerStatus = "approved";
    seller.isBlocked = false;
    await seller.save();

    await SellerRequest.deleteOne({ user: seller._id });

    await sendEmail(
      seller.email,
      "Seller Approved 🎉",
      `Hello ${seller.name}, your seller account has been approved.`
    );

    res.json({ message: "Seller approved successfully" });
  } catch {
    res.status(500).json({ message: "Approve failed" });
  }
};

/* ================= REJECT SELLER ================= */
export const rejectSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.role = "user";
    seller.sellerStatus = "rejected";
    seller.isBlocked = false;
    await seller.save();

    await SellerRequest.deleteOne({ user: seller._id });

    await sendEmail(
      seller.email,
      "Seller Rejected ❌",
      `Hello ${seller.name}, your seller request was rejected.`
    );

    res.json({ message: "Seller rejected successfully" });
  } catch {
    res.status(500).json({ message: "Reject failed" });
  }
};

/* ================= BLOCK SELLER ================= */
export const blockSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller || seller.sellerStatus !== "approved") {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isBlocked = true;
    await seller.save();

    await sendEmail(
      seller.email,
      "Seller Blocked 🚫",
      "Your seller account has been blocked by admin."
    );

    res.json({ message: "Seller blocked successfully" });
  } catch {
    res.status(500).json({ message: "Block failed" });
  }
};

/* ================= UNBLOCK SELLER ================= */
export const unblockSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller || seller.sellerStatus !== "approved") {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isBlocked = false;
    await seller.save();

    await sendEmail(
      seller.email,
      "Seller Unblocked 🔓",
      "Your seller account has been unblocked by admin."
    );

    res.json({ message: "Seller unblocked successfully" });
  } catch {
    res.status(500).json({ message: "Unblock failed" });
  }
};

/* ================= ADMIN GET ALL PRODUCTS ================= */
export const getAllProducts = async (req, res) => {
try {
const products = await Product.find()
  .populate("seller", "name email")
  .sort({ createdAt: -1 });

res.json(products);
} catch (error) {


console.error(error);

res.status(500).json({
  message: "Products fetch failed"
});


}
};

/* ================= ADMIN BLOCK / UNBLOCK PRODUCT ================= */
export const blockUnblockProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

product.status =
product.status === "blocked" ? "approved" : "blocked";

    await product.save();

    res.json({ status: product.status });
  } catch {
    res.status(500).json({ message: "Product block failed" });
  }
};
/* ================= ADMIN LATEST ORDERS ================= */

export const getLatestOrders = async (req, res) => {

try {

const orders = await Order.find()
.populate("user","name email")
.populate({
  path: "products.product",
  select: "name"
})
.populate({
  path: "products.seller",
  select: "name email"
})
.sort({ createdAt: -1 })
.limit(5);

res.json(orders);

} catch (error) {

console.error(error);

res.status(500).json({
message:"Orders fetch failed"
});

}

};
/* ================= UPDATE ORDER STATUS ================= */


export const updateOrderStatus = async (req,res)=>{

try{

const order = await Order.findById(req.params.id);

if(!order){
return res.status(404).json({message:"Order not found"});
}

order.status = req.body.status;

await order.save();

res.json({message:"Order status updated",status:order.status});

}catch(err){

console.error(err);

res.status(500).json({message:"Status update failed"});

}

};
/* ================= ADMIN REPORTS ================= */

/* ================= ADMIN REPORTS ================= */

export const getAdminReports = async (req, res) => {
try {

/* ================= TOTAL USERS ================= */

const totalUsers = await User.countDocuments({ role: "user" });

/* ================= TOTAL ORDERS ================= */

const totalOrders = await Order.countDocuments();

/* ================= PRODUCTS SOLD ================= */

const productsSoldData = await Order.aggregate([
{ $unwind: "$products" },
{
$group:{
_id:null,
total:{ $sum:"$products.quantity" }
}
}
]);

const productsSold = productsSoldData[0]?.total || 0;

/* ================= TOTAL REVENUE ================= */

const revenueData = await Order.aggregate([
{
$group:{
_id:null,
total:{ $sum:"$totalAmount" }
}
}
]);

const totalRevenue = revenueData[0]?.total || 0;

/* ================= MONTHLY REVENUE ================= */

const salesData = await Order.aggregate([
{
$group:{
_id:{ $month:"$createdAt" },
revenue:{ $sum:"$totalAmount" }
}
},
{ $sort:{ _id:1 } }
]);

const sales = salesData.map(s => ({
month:`M${s._id}`,
revenue:s.revenue
}));

/* ================= ORDERS PER DAY ================= */

const ordersData = await Order.aggregate([
{
$group:{
_id:{ $dayOfMonth:"$createdAt" },
count:{ $sum:1 }
}
},
{ $sort:{ _id:1 } }
]);

const ordersPerDay = ordersData.map(o => ({
day:o._id,
count:o.count
}));

/* ================= CATEGORY SALES ================= */

const categories = await Product.aggregate([
{
$group:{
_id:"$category",
count:{ $sum:1 }
}
}
]);

const categorySales = categories.map(c => ({
category:c._id,
count:c.count
}));

/* ================= SELLER REVENUE ================= */

const sellerRevenueData = await Order.aggregate([
{ $unwind:"$products" },

{
$lookup:{
from:"users",
localField:"products.seller",
foreignField:"_id",
as:"seller"
}
},

{ $unwind:"$seller" },

{
$group:{
_id:"$seller.name",
revenue:{ $sum:"$totalAmount" }
}
},

{ $sort:{ revenue:-1 } }
]);

const sellerRevenue = sellerRevenueData.map(s => ({
seller:s._id,
revenue:s.revenue
}));

/* ================= TOP SELLING PRODUCTS ================= */

const topProducts = await Order.aggregate([

{ $unwind: "$products" },

{
$group: {
_id: "$products.product",
sold: { $sum: { $ifNull: ["$products.quantity", 1] } }
}
},

{ $sort: { sold: -1 } },

{ $limit: 5 },

{
$lookup: {
from: "products",
localField: "_id",
foreignField: "_id",
as: "product"
}
},

{ $unwind: "$product" },

{
$project: {
_id: "$product._id",
name: "$product.name",
sold: 1
}
}

]);
/* ================= RESPONSE ================= */

res.json({

stats:{
totalRevenue,
totalOrders,
totalUsers,
productsSold
},

sales,
ordersPerDay,
categorySales,
sellerRevenue,
topProducts

});

} catch (error) {

console.error(error);

res.status(500).json({
message:"Reports fetch failed"
});

}
};
/* ================= EXPORT ORDERS CSV ================= */

export const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");

    const { Parser } = await import("json2csv");

    const data = orders.map(o => ({
      OrderID: o._id,
      Customer: o.user?.name || "Unknown",
      Email: o.user?.email || "Unknown",
      TotalAmount: o.totalAmount,
      Status: o.status,
      Date: o.createdAt
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders-report.csv");

    res.send(csv);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "CSV export failed" });
  }
};


/* ================= EXPORT REVENUE PDF ================= */

export const exportRevenuePDF = async (req, res) => {
  try {
    const orders = await Order.find();

    const PDFDocument = (await import("pdfkit")).default;

    let revenue = 0;
    orders.forEach(o => revenue += o.totalAmount || 0);

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=revenue-report.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Revenue Report", { align: "center" });

    doc.moveDown();
    doc.text(`Total Orders: ${orders.length}`);
    doc.text(`Total Revenue: ₹${revenue}`);

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF export failed" });
  }
};