import { Express } from "express";
import { config as env } from "./config/config";
import { app } from "./app";
import { config } from "dotenv";
import { watchEnvFile } from "./config/envWatcher";
import connectDB from "./config/database";

config();
watchEnvFile();

const port = env.port;

const startServer = async (port: number, app: Express) => {
  await connectDB();
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

startServer(Number(port), app as Express);
