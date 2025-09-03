import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/error";
import { config } from "../config/config";

// Global error handler middleware
const globalErrorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails = {};

  // Check for custom error with status code
  if ("statusCode" in err) {
    statusCode = (err as CustomError).statusCode;
  }

  // Set message based on error type
  if (err.message) {
    message = err.message;
  }

  // For validation errors or other structured errors
  if ("errors" in err) {
    errorDetails = (err as any).errors;
  }

  // Log the error in development
  console.error("ERROR:", {
    statusCode,
    message,
    stack: err.stack,
    details: errorDetails,
  });

  // Send the error response
  res.status(statusCode).json({
    status: "error",
    message,
    error: errorDetails,
    // Only include stack trace in development
    stack: config.nodeEnv === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;
