import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/config";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.allowedOrigins as string[],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);

// Logging in development mode
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/appointments", appointmentRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "AgriAI API is running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(globalErrorHandler);

// Export app
export { app };
