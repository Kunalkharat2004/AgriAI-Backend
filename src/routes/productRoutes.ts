import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get("/", getProducts);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", getProductById);

// Protected routes (admin only)
router.post("/", authenticate, createProduct);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);

export default router;
