import { Queue, JobsOptions } from "bullmq";
import redisConnection from "../../config/redis";

export enum EmailJobName {
  SEND_EMAIL = "SEND_EMAIL",
}

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: {
    age: 24 * 60 * 60, // 24 Hours
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 60 * 60, // 7 Days
  },
};

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
  defaultJobOptions,
});

export default emailQueue;
