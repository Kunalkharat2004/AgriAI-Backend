import express from "express";
import {
  login,
  register,
  getProfile,
  updateProfile,
} from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
