import { Resend } from "resend";
import { config } from "../../config/config";

const apiKey = config.resend.api;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined in .env");
}

export const resend = new Resend(apiKey);

export default resend;