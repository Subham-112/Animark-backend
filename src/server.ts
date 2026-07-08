import { Express } from "express";
import { config as env } from "./config/config";
import { app } from "./app";
import { config } from "dotenv";
import { watchEnvFile } from "./config/envWatcher";
import connectDB from "./config/database";
import { initializeJobs } from "./jobs";
import { logger } from "./config/logger";

config();
watchEnvFile();

const port = env.port;

const startServer = async (port: number, app: Express) => {
  await connectDB();
  await initializeJobs();
  
  app.listen(port, () => {
    logger.info(`🚀 Server running on http://localhost:${port}`);
  });
};

startServer(Number(port), app as Express);
