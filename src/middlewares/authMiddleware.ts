import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { CustomError } from "../utils/error";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to authenticate JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret as string);

      // Set user data in request
      req.user = decoded;

      next();
    } catch (error) {
      next(new CustomError("Not authorized, invalid token", 401));
    }
  } else {
    next(new CustomError("Not authorized, no token provided", 401));
  }
};

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new CustomError("Not authorized as admin", 403));
  }
};
