export const isSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Seller access only" });
  }

  if (req.user.sellerStatus !== "approved") {
    return res.status(403).json({
      message: "Seller approval pending. You cannot add products yet.",
    });
  }

  if (req.user.isBlocked) {
    return res.status(403).json({
      message: "Your seller account is blocked by admin.",
    });
  }

  next(); // ✅ allow request
};
