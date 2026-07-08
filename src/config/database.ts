import mongoose from "mongoose";
import { config } from "./config";
import { logger } from "./logger";

let isConnected = false;

const connectDB = async (): Promise<void> => {
  try {
    // Reuse existing connection
    if (isConnected) {
      logger.info("✅ Using existing MongoDB connection");
      return;
    }

    const dbUrl = config.db.url
    const dbName = config.db.name;
    const connectionUrl = `${dbUrl}/${dbName}`;

    if (!connectionUrl) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(connectionUrl, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      appName: "animark-backend",
    });

    isConnected = true;

    logger.info("🍃 MongoDB Connected");

    mongoose.connection.on("disconnected", () => {
      logger.warn("🟡 MongoDB Disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("🔄 MongoDB Reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      logger.error("🔴 MongoDB Error:", err);
    });
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
