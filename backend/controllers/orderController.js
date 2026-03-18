import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import { io } from "../index.js";
import { getAutoOrderStatus } from "../utils/orderStatus.js";

/* ================= CREATE ORDER ================= */

export const createOrder = async (req, res) => {
  try {

    console.log("CREATE ORDER API HIT");

    const items = req.body.products || req.body.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    let totalAmount = 0;
    const orderProducts = [];

    for (const item of items) {

      const productId = item.productId || item.product;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.status !== "approved") {
        return res.status(400).json({ message: "Product not available" });
      }

      const quantity = item.qty || item.quantity || 1;

      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      totalAmount += product.price * quantity;

      orderProducts.push({
        product: product._id,
        seller: product.seller,
        qty: quantity,
        price: product.price,
        orderStatus: "processing"
      });

      /* UPDATE STOCK */
      product.stock -= quantity;
      await product.save();

      /* LOW STOCK ALERT */
      if (product.stock <= 5) {

        const stockNotification = await Notification.create({
          user: product.seller,
          message: `Low stock alert for "${product.name}"`,
          type: "stock",
          isRead: false
        });

        io.to(product.seller.toString()).emit("newNotification", stockNotification);
      }
    }

    /* CREATE ORDER */

    const { shippingAddress } = req.body;

    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      paymentStatus: "paid",
      orderStatus: "processing" // ✅ IMPORTANT (ADD THIS)
    });

    console.log("ORDER CREATED:", order._id);

    /* CUSTOMER NOTIFICATION */

    const customerNotification = await Notification.create({
      user: req.user._id,
      message: "Your order has been placed successfully.",
      type: "order",
      isRead: false
    });

    io.to(req.user._id.toString()).emit("newNotification", customerNotification);

    /* NOTIFY SELLERS */

    const sellerIds = [...new Set(orderProducts.map(p => p.seller.toString()))];

    for (const seller of sellerIds) {

      const sellerNotification = await Notification.create({
        user: seller,
        message: "You received a new order.",
        type: "order",
        isRead: false
      });

      io.to(seller).emit("newNotification", sellerNotification);
    }

    res.status(201).json(order);

  } catch (error) {

    console.error("createOrder ERROR:", error);
    res.status(500).json({ message: "Order failed" });

  }
};

/* ================= GET CUSTOMER ORDERS ================= */

export const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const updatedOrders = orders.map(order => {

      let status = order.orderStatus;

      /* ✅ DO NOT OVERRIDE CANCELLED */
      if (status !== "cancelled") {
      status = getAutoOrderStatus(order.createdAt, order.orderStatus);      }

      const updatedProducts = order.products.map(p => ({
        ...p._doc,
        orderStatus: status
      }));

      return {
        ...order._doc,
        products: updatedProducts,
        orderStatus: status
      };
    });

    res.json(updatedOrders);

  } catch (error) {

    console.error("getMyOrders ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });

  }
};

/* ================= GET SELLER ORDERS ================= */

export const getSellerOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      "products.seller": req.user._id
    })
      .populate("products.product", "name")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const updatedOrders = orders.map(order => {

      let status = order.orderStatus;

      /* ✅ DO NOT OVERRIDE CANCELLED */
      if (status !== "cancelled") {
    status = getAutoOrderStatus(order.createdAt, order.orderStatus);      }

      const updatedProducts = order.products.map(p => {

        if (p.seller.toString() === req.user._id.toString()) {
          return {
            ...p._doc,
            orderStatus: status
          };
        }

        return p._doc;
      });

      return {
        ...order._doc,
        products: updatedProducts
      };
    });

    res.json(updatedOrders);

  } catch (err) {

    console.error("getSellerOrders ERROR:", err);
    res.status(500).json({ message: "Failed to fetch seller orders" });

  }
};

/* ================= SELLER REVENUE ================= */

export const getSellerRevenue = async (req, res) => {
  try {

    const sellerId = req.user._id;

    const orders = await Order.find({
      "products.seller": sellerId
    });

    const revenueByDate = {};

    orders.forEach(order => {

      order.products.forEach(item => {

        if (item.seller.toString() === sellerId.toString()) {

          const date = new Date(order.createdAt).toLocaleDateString("en-GB");
          const revenue = item.price * item.qty;

          if (!revenueByDate[date]) {
            revenueByDate[date] = 0;
          }

          revenueByDate[date] += revenue;
        }
      });
    });

    const labels = Object.keys(revenueByDate);
    const data = Object.values(revenueByDate);

    res.json({ labels, data });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Revenue fetch failed" });

  }
};

/* ================= CANCEL ORDER ================= */

export const cancelOrder = async (req,res)=>{
try{

const order = await Order.findById(req.params.id);

if(!order){
return res.status(404).json({message:"Order not found"});
}

/* ❌ BLOCK AFTER SHIPPED */

const notAllowed = [
"shipped",
"out_for_delivery",
"delivered"
];

if(order.orderStatus === "cancelled"){
  return res.status(400).json({
    message:"Order already cancelled"
  });
}

if(notAllowed.includes(order.orderStatus)){
  return res.status(400).json({
    message:"Order already shipped. Cannot cancel."
  });
}
/* ✅ CANCEL */

order.orderStatus = "cancelled";

order.products.forEach(p=>{
p.orderStatus = "cancelled";
});

await order.save();

res.json({message:"Order cancelled successfully"});

}catch(err){

console.log(err);
res.status(500).json({message:"Cancel failed"});

}
};