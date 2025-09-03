import mongoose from "mongoose";
import { config } from "./config";
import colors from "colors";

// Enable colors
colors.enable();

const connectDB = async (): Promise<boolean> => {
  try {
    const conn = await mongoose.connect(
      config.mongoURI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    const err = error as Error;
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
