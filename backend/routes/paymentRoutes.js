import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

const router = express.Router();

/* CREATE ORDER */

router.post("/create-order", async (req, res) => {

  try {

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {

    console.log("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Order creation failed" });

  }

});
/* VERIFY PAYMENT */

router.post("/verify-payment", (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      res.json({
        success: true,
        message: "Payment verified successfully",
      });

    } else {

      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });

    }

  } 
catch (error) {
  console.log("VERIFY PAYMENT ERROR:", error);
  res.status(500).json({ message: "Payment verification failed" });

  }

});

export default router;