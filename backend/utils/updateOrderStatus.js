import cron from "node-cron";
import Order from "../models/Order.js";
import { getAutoOrderStatus } from "./orderStatus.js";

export const startOrderStatusUpdater = () => {

cron.schedule("*/5 * * * *", async () => {

try {

console.log("Checking orders for automatic status update...");

/* ❌ DO NOT TOUCH CANCELLED + DELIVERED */
const orders = await Order.find({
orderStatus: { $nin: ["cancelled", "delivered"] }
});

for (const order of orders) {

/* EXTRA SAFETY */
if(order.orderStatus === "cancelled") continue;

/* ✅ STATUS CALCULATION */
const newStatus = getAutoOrderStatus(order.createdAt, order.orderStatus);

/* ONLY UPDATE IF CHANGED */
if (order.orderStatus !== newStatus) {

/* ✅ FIX: HANDLE EMPTY PRODUCTS */
if(order.products && order.products.length > 0){

await Order.updateOne(
{ _id: order._id },
{
orderStatus: newStatus,
"products.$[].orderStatus": newStatus
}
);

}else{

await Order.updateOne(
{ _id: order._id },
{
orderStatus: newStatus
}
);

}

console.log(`Order ${order._id} updated to ${newStatus}`);

}

}

} catch (error) {
console.error("Order status update error:", error);
}

});

};