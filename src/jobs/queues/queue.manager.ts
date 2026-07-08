import { logger } from "../../config/logger";
import { emailQueue } from "./email.queue";

class QueueManager {
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info("📦 Initializing queues...");

    // Future queues can be initialized here
    // paymentQueue
    // notificationQueue
    // searchQueue

    void emailQueue;
    this.initialized = true;
    logger.info("✅ Queues initialized");
  }
}

export default new QueueManager();