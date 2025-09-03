import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  getOrdersDashboard,
  getSalesData,
  getProductCategories,
  getAllOrders
} from "../controllers/orderController";
import { authenticate } from "../middlewares/authMiddleware";
import { authentication } from "../middlewares/authentication";
import { isAdmin } from "../middlewares/authMiddleware";

const router = express.Router();

// Protected routes - use both middleware for backward compatibility
router.post("/", [authenticate, authentication], createOrder);
router.get("/", [authenticate, authentication], getOrders);
router.get("/user", [authenticate, authentication], getUserOrders);

// Admin routes
router.get("/admin/dashboard", [authenticate, authentication, isAdmin], getOrdersDashboard);
router.get("/admin/sales", [authenticate, authentication, isAdmin], getSalesData);
router.get("/admin/categories", [authenticate, authentication, isAdmin], getProductCategories);
router.get("/admin/all", [authenticate, authentication, isAdmin], getAllOrders);
router.patch("/admin/:id/status", [authenticate, authentication, isAdmin], updateOrderStatus);

// Individual order routes
router.get("/:id", [authenticate, authentication], getOrderById);
router.put("/:id/status", [authenticate, authentication], updateOrderStatus);

// Test endpoint (to be removed in production)
router.post("/test", (req, res) => {
  console.log("Test order endpoint hit:", req.body);
  res.status(200).json({ message: "Test endpoint working" });
});

export default router;
