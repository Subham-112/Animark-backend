import mongoose from "mongoose";
import { config } from "./config";

let isConnected = false;

const connectDB = async (): Promise<void> => {
  try {
    // Reuse existing connection
    if (isConnected) {
      console.log("✅ Using existing MongoDB connection");
      return;
    }

    const dbUrl = config.db.url
    const dbName = config.db.name;
    const connectionUrl = `${dbUrl}/${dbName}`;
    if (config.env === "dev") console.log("Connecting with URL 👉 ", connectionUrl);

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

    console.log("🟢 MongoDB Connected");

    mongoose.connection.on("disconnected", () => {
      console.log("🟡 MongoDB Disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB Reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("🔴 MongoDB Error:", err);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
