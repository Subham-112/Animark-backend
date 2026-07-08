import { logger } from "../../config/logger";
import "./email.worker";

class WorkerManager {
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    logger.info("🚀 Starting background workers...");

    // Workers are started simply by importing them.

    this.initialized = true;
    logger.info("✅ Background workers started");
  }
}

export default new WorkerManager();
