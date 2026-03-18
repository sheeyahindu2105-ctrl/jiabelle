export const getAutoOrderStatus = (createdAt, currentStatus) => {

/* 🔒 DO NOT CHANGE CANCELLED */
if(currentStatus === "cancelled"){
  return "cancelled";
}

const now = new Date();
const orderTime = new Date(createdAt);

const diffMinutes = (now - orderTime) / (1000 * 60);
const diffHours = (now - orderTime) / (1000 * 60 * 60);

if (diffMinutes < 30) return "processing";
if (diffHours < 24) return "placed";
if (diffHours < 48) return "shipped";
if (diffHours < 72) return "out_for_delivery";

return "delivered";
};