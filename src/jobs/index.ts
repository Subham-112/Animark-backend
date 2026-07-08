import queueManager from "./queues/queue.manager";
import workerManager from "./workers/worker.manager";

export const initializeJobs = async () => {
  await queueManager.initialize();
  await workerManager.initialize();
};