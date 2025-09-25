import express from "express";
import {
  login,
  register,
  getProfile,
  updateProfile,
  listExperts,
} from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = express.Router();

// Public routes
router.post("/register", upload.single("photo"), register);
router.post("/login", login);
router.get("/experts", listExperts);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
