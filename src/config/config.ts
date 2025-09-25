import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3600,
  mongoURI: process.env.MONGO_CONNECTION_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  allowedOrigins: [process.env.FRONTEND_URL, "http://localhost:5173"].filter(
    (origin): origin is string => Boolean(origin)
  ),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || "agri-ai/users",
  },
};
if (!config.jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}
