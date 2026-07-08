import { Job, Worker } from "bullmq";

import redisConnection from "../../config/redis";
import { EmailJobData } from "../../services/email/email.types";
import { sendEmail } from "../../services/email/email.service";

export const emailWorker = new Worker(
  "email-queue",
  async (job: Job<EmailJobData>) => {
    console.log(`📨 Processing Email Job: ${job.id}`);

    await sendEmail(job.data);

    console.log(`✅ Email sent successfully.`);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`❌ Job ${job?.id} failed`);
  console.error(error);
});

emailWorker.on("error", (error) => {
  console.error("❌ Email Worker Error:", error);
});

export default emailWorker;