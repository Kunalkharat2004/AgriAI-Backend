import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/config";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.allowedOrigins,
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

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Root endpoint
app.get("/", (req, res) => {
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
