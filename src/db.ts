import mongoose from "mongoose";
import { config } from "./config/config";
import colors from "colors";

// Enable colors
colors.enable();

const connectDB = async (): Promise<boolean> => {
  try {
    const conn = await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    return true;
  } catch (error) {
    const err = error as Error;
    console.error(`Error connecting to MongoDB: ${err.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDB;
