import emailQueue, { EmailJobName } from "../queues/email.queue";
import { EmailJobData } from "../../services/email/email.types";

export const addEmailJob = async (
  data: EmailJobData,
): Promise<void> => {
  await emailQueue.add(EmailJobName.SEND_EMAIL, data);
};

export default addEmailJob;