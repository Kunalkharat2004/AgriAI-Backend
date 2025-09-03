import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { CustomError } from "../utils/error";

// Extended request interface
export interface AuthRequest extends Request {
  user?: any;
}

// Authentication middleware
export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(" ")[1];

    // Check if token exists
    if (!token) {
      throw new CustomError("Authentication failed: No token provided", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret!);

    // Add user info to request
    (req as AuthRequest).user = decoded;

    next();
  } catch (error) {
    next(new CustomError("Authentication failed: Invalid token", 401));
  }
};

// Admin authorization middleware
export const adminAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== "admin") {
      throw new CustomError("Unauthorized: Admin access required", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
